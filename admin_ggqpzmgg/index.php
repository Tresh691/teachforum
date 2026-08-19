<?php
session_start();
if (empty($_SESSION['admin'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../config.php';

$msg = '';
// Создание нового учителя
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $login    = trim($_POST['login'] ?? '');
    $password = $_POST['password'] ?? '';
    $email    = trim($_POST['email'] ?? '');
    if (!empty($login) && !empty($password)) {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        // По умолчанию создаём с бессрочным доступом и базовым тарифом
        $stmt = $pdo->prepare("INSERT INTO teachers (login, password_hash, email, activated, plan, expires_at) VALUES (?, ?, ?, 1, 'basic', NULL)");
        $stmt->execute([$login, $hash, $email]);
        $msg = "Учитель $login создан (базовый тариф, бессрочный доступ).";
    }
}

$teachers = $pdo->query("SELECT id, login, email, activated, expires_at, plan FROM teachers ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Админ‑панель — TeachForum</title>
    <link rel="stylesheet" href="../css/style2.css">
    <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
        .btn-small { padding: 4px 10px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="card" style="max-width:1000px; margin:40px auto; padding:24px;">
        <h2>Админ‑панель</h2>
        <?php if ($msg): ?>
            <p style="color:green;"><?= htmlspecialchars($msg) ?></p>
        <?php endif; ?>
        <?php if (isset($_GET['extended'])): ?>
            <p style="color:green;">Доступ продлён.</p>
        <?php endif; ?>
        <?php if (isset($_GET['plan_changed'])): ?>
            <p style="color:green;">Тариф изменён.</p>
        <?php endif; ?>

        <h3>Создать учителя</h3>
        <form method="post" style="margin-bottom:32px;">
            <div class="form-group"><label>Логин</label><input type="text" name="login" class="form-input" required></div>
            <div class="form-group"><label>Пароль</label><input type="password" name="password" class="form-input" required></div>
            <div class="form-group"><label>Email (необязательно)</label><input type="email" name="email" class="form-input"></div>
            <button type="submit" class="btn btn--primary">Создать</button>
        </form>

        <h3>Существующие учителя</h3>
        <table>
            <thead>
                <tr><th>Логин</th><th>Email</th><th>Тариф</th><th>Статус</th><th>Пробный до</th><th>Действия</th></tr>
            </thead>
            <tbody>
                <?php foreach ($teachers as $t): ?>
                <tr>
                    <td><?= htmlspecialchars($t['login']) ?></td>
                    <td><?= htmlspecialchars($t['email'] ?? '—') ?></td>
                    <td>
                        <form action="change_plan.php" method="post" style="display:flex; gap:4px; align-items:center;">
                            <input type="hidden" name="teacher_id" value="<?= $t['id'] ?>">
                            <select name="plan" class="form-input" style="width:120px;">
                                <option value="basic" <?= $t['plan']=='basic'?'selected':'' ?>>Базовый</option>
                                <option value="pro" <?= $t['plan']=='pro'?'selected':'' ?>>Профессиональный</option>
                                <option value="team" <?= $t['plan']=='team'?'selected':'' ?>>Команда</option>
                            </select>
                            <button type="submit" class="btn btn--primary btn-small">Сменить</button>
                        </form>
                    </td>
                    <td><?= $t['activated'] ? 'Активен' : 'Деактивирован' ?></td>
                    <td><?= $t['expires_at'] ? date('d.m.Y H:i', strtotime($t['expires_at'])) : 'Бессрочно' ?></td>
                    <td>
                        <form action="extend.php" method="post" style="display:flex; gap:4px; align-items:center;">
                            <input type="hidden" name="teacher_id" value="<?= $t['id'] ?>">
                            <input type="number" name="days" placeholder="Дней" min="1" class="form-input" style="width:70px;">
                            <button type="submit" class="btn btn--primary btn-small">Продлить</button>
                            <button type="button" class="btn btn--secondary btn-small" onclick="this.form.date.value='<?= date('Y-m-d', strtotime('+1 year')) ?>'; this.form.days.value=''; this.form.submit();">Год</button>
                            <input type="hidden" name="date" value="">
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <p style="margin-top:16px;"><a href="login.php?logout=1">Выйти из админки</a></p>
    </div>
</body>
</html>