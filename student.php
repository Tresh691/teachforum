<?php
session_start();

if (empty($_SESSION['user']) && isset($_COOKIE['remember_token'])) {
    require_once __DIR__ . '/config.php';
    $stmt = $pdo->prepare("SELECT id, login, first_name, last_name, avatar FROM students WHERE remember_token = ?");
    $stmt->execute([$_COOKIE['remember_token']]);
    $student = $stmt->fetch();
    if ($student) {
        $_SESSION['user'] = [
            'id'    => $student['id'],
            'login' => $student['login'],
            'name'  => $student['first_name'] . ' ' . ($student['last_name'] ?? ''),
            'role'  => 'student',
            'avatar'=> $student['avatar']
        ];
        // Ротация токена
        $newToken = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare("UPDATE students SET remember_token = ? WHERE id = ?");
        $stmt->execute([$newToken, $student['id']]);
        setcookie('remember_token', $newToken, time() + 60*60*24*30, '/', '', false, true);
    }
}

if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    header('Location: index.html');
    exit;
}
$studentName = htmlspecialchars($_SESSION['user']['name']);
$studentId = (int)$_SESSION['user']['id'];

// Подтягиваем аватар из БД, если его нет в сессии
if (!isset($_SESSION['user']['avatar'])) {
    require_once __DIR__ . '/config.php';
    $stmt = $pdo->prepare("SELECT avatar FROM students WHERE id = ?");
    $stmt->execute([$studentId]);
    $_SESSION['user']['avatar'] = $stmt->fetchColumn();
}
$studentAvatar = $_SESSION['user']['avatar'] ?? null;

// --- ПОЛУЧАЕМ НАСТРОЙКИ СКРЫТЫХ РАЗДЕЛОВ УЧИТЕЛЯ ---
$teacherHidden = [];
if (!isset($pdo)) {
    require_once __DIR__ . '/config.php';
}
$stmt = $pdo->prepare("SELECT t.hidden_sections FROM teachers t JOIN students s ON s.teacher_id = t.id WHERE s.id = ?");
$stmt->execute([$studentId]);
$teacherHiddenRaw = $stmt->fetchColumn();
if (is_string($teacherHiddenRaw)) {
    $decoded = json_decode($teacherHiddenRaw, true);
    $teacherHidden = is_array($decoded) ? $decoded : [];
} else {
    $teacherHidden = [];
}

// --- ПОЛУЧАЕМ КАСТОМИЗАЦИЮ САЙДБАРА УЧИТЕЛЯ (названия, иконки) ---
$sidebarCustomData = [];
$stmt = $pdo->prepare("
    SELECT sc.section_key, sc.custom_title, sc.custom_icon 
    FROM sidebar_customization sc 
    JOIN teachers t ON sc.teacher_id = t.id 
    JOIN students s ON s.teacher_id = t.id 
    WHERE s.id = ?
");
$stmt->execute([$studentId]);
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $sidebarCustomData[$row['section_key']] = [
        'title' => $row['custom_title'],
        'icon'  => $row['custom_icon']
    ];
}
$sidebarCustomJson = json_encode($sidebarCustomData, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// --- ПОЛУЧАЕМ ЧАСОВОЙ ПОЯС УЧЕНИКА ---
$stmt = $pdo->prepare("SELECT timezone FROM students WHERE id = ?");
$stmt->execute([$studentId]);
$studentTimezone = $stmt->fetchColumn() ?: 'Europe/Moscow';
// ---------------------------------------------------
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Просматривайте своё расписание, домашние задания и учебные материалы.">
    <title>Личный кабинет — TeachForum</title>
    <link rel="stylesheet" href="css/style2.css">
    <link rel="stylesheet" href="css/teacher9.css">
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
            <?php if ($studentAvatar && file_exists(__DIR__ . '/' . $studentAvatar)): ?>
                <img src="<?= htmlspecialchars($studentAvatar) ?>" class="welcome-avatar-img" alt="Аватар">
            <?php else: ?>
                <div class="welcome-avatar"><?= mb_substr($studentName, 0, 1) ?></div>
            <?php endif; ?>
            <div class="welcome-info">
                <div class="welcome-greeting">Привет,</div>
                <div class="welcome-name" title="<?= $studentName ?>"><?= $studentName ?></div>
            </div>
            <div class="welcome-actions">
                <button class="btn-icon" onclick="openStudentTimezoneModal()" title="Часовой пояс" style="color:white;">🕒</button>
            </div>
        </div>
        <nav class="sidebar__nav">
            <a class="sidebar__link active" data-tab="schedule">📅 Расписание</a>
            <a class="sidebar__link" data-tab="homeworks">📝 Домашние задания</a>
            <a class="sidebar__link" data-tab="lectures">📚 Лекции</a>
            <div id="customBlocksContainer"></div>
        </nav>
        <div class="sidebar__logout">
            <a href="logout.php" class="logout-link">🚪 Выйти</a>
        </div>
    </aside>
    <main class="main" id="mainContent"></main>

    <script>
        const STUDENT_ID = <?= $studentId ?>;
        const STUDENT_AVATAR = '<?= $studentAvatar ?? '' ?>';
        const HIDDEN_SECTIONS = <?= json_encode($teacherHidden) ?>;
        const SIDEBAR_CUSTOMIZATION = <?= $sidebarCustomJson ?>;
        let STUDENT_TIMEZONE = <?= json_encode($studentTimezone) ?>;
    </script>
    <script src="js/student8.js"></script>
    <script>
        // Применяем скрытие разделов и кастомизацию после загрузки кастомных блоков
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                applyHiddenSections();
                applySidebarCustomization();
            }, 100);
        });
    </script>
</body>
</html>