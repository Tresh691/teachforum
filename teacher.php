<?php
session_start();

// Автологин по куке
if (empty($_SESSION['user']) && isset($_COOKIE['remember_token'])) {
    require_once __DIR__ . '/config.php';
    $stmt = $pdo->prepare("SELECT id, login, plan, avatar, hidden_sections, timezone FROM teachers WHERE remember_token = ?");
    $stmt->execute([$_COOKIE['remember_token']]);
    $teacher = $stmt->fetch();
    if ($teacher) {
        $hiddenRaw = $teacher['hidden_sections'];
        if (is_string($hiddenRaw)) {
            $hiddenDecoded = json_decode($hiddenRaw, true);
            $hiddenArray = is_array($hiddenDecoded) ? $hiddenDecoded : [];
        } else {
            $hiddenArray = [];
        }

        $_SESSION['user'] = [
            'id'    => $teacher['id'],
            'login' => $teacher['login'],
            'role'  => 'teacher',
            'plan'  => $teacher['plan'] ?? 'basic',
            'avatar'=> $teacher['avatar'],
            'hidden_sections' => $hiddenArray,
            'timezone' => $teacher['timezone'] ?? 'Europe/Moscow'
        ];
        $newToken = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare("UPDATE teachers SET remember_token = ? WHERE id = ?");
        $stmt->execute([$newToken, $teacher['id']]);
        setcookie('remember_token', $newToken, time() + 60*60*24*30, '/', '', false, true);
    }
}

if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    header('Location: index.php');
    exit;
}

if (!isset($pdo)) {
    require_once __DIR__ . '/config.php';
}

// === ГАРАНТИЯ АКТУАЛЬНОСТИ (добавлен onboarding_completed) ===
$stmt = $pdo->prepare("SELECT plan, avatar, hidden_sections, timezone, onboarding_completed FROM teachers WHERE id = ?");
$stmt->execute([$_SESSION['user']['id']]);
$teacherData = $stmt->fetch(PDO::FETCH_ASSOC);
$onboardingCompleted = 0;
if ($teacherData) {
    $_SESSION['user']['plan']   = $teacherData['plan'] ?? 'basic';
    $_SESSION['user']['avatar'] = $teacherData['avatar'] ?? null;
    $_SESSION['user']['timezone'] = $teacherData['timezone'] ?? 'Europe/Moscow';
    $onboardingCompleted = (int)($teacherData['onboarding_completed'] ?? 0);

    $hiddenRaw = $teacherData['hidden_sections'] ?? null;
    if (is_string($hiddenRaw)) {
        $decoded = json_decode($hiddenRaw, true);
        $_SESSION['user']['hidden_sections'] = is_array($decoded) ? $decoded : [];
    } else {
        $_SESSION['user']['hidden_sections'] = [];
    }
}

// --- КАСТОМИЗАЦИЯ САЙДБАРА ---
$sidebarCustomStmt = $pdo->prepare("SELECT section_key, custom_title, custom_icon FROM sidebar_customization WHERE teacher_id = ?");
$sidebarCustomStmt->execute([$_SESSION['user']['id']]);
$sidebarCustomData = [];
while ($row = $sidebarCustomStmt->fetch(PDO::FETCH_ASSOC)) {
    $sidebarCustomData[$row['section_key']] = [
        'title' => $row['custom_title'],
        'icon'  => $row['custom_icon']
    ];
}
$sidebarCustomJson = json_encode($sidebarCustomData, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

$teacherName = htmlspecialchars($_SESSION['user']['login']);
$currentPlan = $_SESSION['user']['plan'];
$teacherAvatar = $_SESSION['user']['avatar'] ?? null;

$warningHtml = '';
$stmt = $pdo->prepare("SELECT expires_at FROM teachers WHERE id = ?");
$stmt->execute([$_SESSION['user']['id']]);
$expires = $stmt->fetchColumn();
if (!empty($expires)) {
    $daysLeft = ceil((strtotime($expires) - time()) / 86400);
    if ($daysLeft <= 3 && $daysLeft > 0) {
        $dayWord = getDayWord($daysLeft);
        $warningHtml = '<div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; margin-bottom: 20px; border-radius: 8px;">';
        $warningHtml .= '<strong>⚠️ Доступ истекает через ' . $daysLeft . ' ' . $dayWord . '.</strong> ';
        $warningHtml .= '<a href="contact.html" style="color: var(--primary);">Продлить доступ</a>';
        $warningHtml .= '</div>';
    }
}

$stmt = $pdo->prepare("SELECT expires_at, activated FROM teachers WHERE id = ?");
$stmt->execute([$_SESSION['user']['id']]);
$teacherDataCheck = $stmt->fetch();
if ($teacherDataCheck) {
    if (!empty($teacherDataCheck['expires_at']) && strtotime($teacherDataCheck['expires_at']) < time()) {
        if ($teacherDataCheck['activated'] != 0) {
            $stmt = $pdo->prepare("UPDATE teachers SET activated = 0 WHERE id = ?");
            $stmt->execute([$_SESSION['user']['id']]);
        }
        $stmt = $pdo->prepare("UPDATE teachers SET remember_token = NULL WHERE id = ?");
        $stmt->execute([$_SESSION['user']['id']]);
        setcookie('remember_token', '', time() - 3600, '/', '', false, true);
        session_destroy();
        header('Location: index.php?error=expired');
        exit;
    }
    if ($teacherDataCheck['activated'] != 1) {
        session_destroy();
        header('Location: index.php?error=expired');
        exit;
    }
}

function getDayWord($n) {
    $n = $n % 100;
    if ($n >= 11 && $n <= 19) return 'дней';
    $last = $n % 10;
    if ($last == 1) return 'день';
    if ($last >= 2 && $last <= 4) return 'дня';
    return 'дней';
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Управляйте учениками, расписанием, домашними заданиями и библиотекой материалов.">
    <title>Личный кабинет — TeachForum</title>
    <link rel="stylesheet" href="css/style2.css">
    <link rel="stylesheet" href="css/teacher11.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <button class="hamburger" id="hamburger">☰</button>
    <aside class="sidebar" id="sidebar">
        <div class="sidebar__logo">TeachForum</div>
        <div class="sidebar__welcome">
            <?php if ($teacherAvatar && file_exists(__DIR__ . '/' . $teacherAvatar)): ?>
                <img src="<?= htmlspecialchars($teacherAvatar) ?>" class="welcome-avatar-img" alt="Аватар">
            <?php else: ?>
                <div class="welcome-avatar"><?= mb_substr($teacherName, 0, 1) ?></div>
            <?php endif; ?>
            <div class="welcome-info">
                <div class="welcome-greeting">Привет,</div>
                <div class="welcome-name" title="<?= $teacherName ?>"><?= $teacherName ?></div>
            </div>
            <div class="welcome-actions">
                <button class="btn-icon" onclick="openTimezoneModal()" title="Часовой пояс" style="color:white;">🕒</button>
                <button class="btn-icon" onclick="openSidebarEditor()" title="Настроить меню" style="color:white;">⚙️</button>
            </div>
        </div>
        <nav class="sidebar__nav">
            <a class="sidebar__link active" data-tab="students">👥 Ученики</a>
            <a class="sidebar__link" data-tab="schedule">📅 Моё расписание</a>
            <a class="sidebar__link" data-tab="homeworks">📝 Домашние задания</a>

            <?php if ($currentPlan !== 'basic'): ?>
                <a class="sidebar__link" data-tab="library">📖 Библиотека заданий</a>
                <a class="sidebar__link" data-tab="lectures">📚 Лекции</a>
                <div id="customBlocksContainer"></div>
                <a class="sidebar__link" data-tab="add-custom-block" style="font-size:14px; opacity:0.7;" onclick="event.preventDefault(); openAddCustomBlockModal();">+ Добавить раздел</a>
            <?php else: ?>
                <span class="sidebar__link locked" title="Доступно в Профессиональном тарифе" style="opacity:0.5; cursor:pointer;" onclick="showUpgradeMessage()">📖 Библиотека заданий</span>
                <span class="sidebar__link locked" title="Доступно в Профессиональном тарифе" style="opacity:0.5; cursor:pointer;" onclick="showUpgradeMessage()">📚 Лекции</span>
                <span class="sidebar__link locked" title="Доступно в Профессиональном тарифе" style="opacity:0.5; cursor:pointer;" onclick="showUpgradeMessage()">📋 Шпоры</span>
            <?php endif; ?>

            <!-- Кнопка повторного обучения -->
            <a class="sidebar__link" id="onboardingReplayBtn" style="opacity:0.6;font-size:13px;<?= $onboardingCompleted ? '' : 'display:none;' ?>" onclick="event.preventDefault(); if(window.Onboarding) window.Onboarding.start(true);">❓ Обучение</a>
            <a class="sidebar__link" data-tab="help" style="opacity:0.5; font-size:14px;">📘 Справка</a>
        </nav>
        <div class="sidebar__logout">
            <a href="logout.php" class="logout-link">🚪 Выйти</a>
        </div>
    </aside>
    <main class="main" id="mainContent"><?= $warningHtml ?></main>

    <script>
    const CURRENT_TEACHER_ID = <?= (int)$_SESSION['user']['id'] ?>;
    const CURRENT_PLAN = <?= json_encode($currentPlan) ?>;
    const TEACHER_AVATAR = <?= json_encode($teacherAvatar ?? '') ?>;
    const SIDEBAR_CUSTOMIZATION = <?= $sidebarCustomJson ?>;
    let HIDDEN_SECTIONS = <?= json_encode($_SESSION['user']['hidden_sections'] ?? []) ?>;
    let TEACHER_TIMEZONE = <?= json_encode($_SESSION['user']['timezone'] ?? 'Europe/Moscow') ?>;
    window.__ONBOARDING_COMPLETED__ = <?= json_encode((bool)$onboardingCompleted) ?>;
    </script>
    <script src="js/teacher19.js"></script>
    <script>
    loadCustomBlocks();
    applyHiddenSections();
    applySidebarCustomization();
    </script>
</body>
</html>