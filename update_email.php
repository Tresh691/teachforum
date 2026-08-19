<?php
date_default_timezone_set('Europe/Moscow');
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    header('Location: index.html');
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

$teacher_id = $_SESSION['user']['id'];

// Проверяем, может, email уже добавили — тогда сразу в кабинет
$stmt = $pdo->prepare("SELECT email, email_verified FROM teachers WHERE id = ?");
$stmt->execute([$teacher_id]);
$teacher = $stmt->fetch();

if (!empty($teacher['email'])) {
    // Email уже есть, уходим в кабинет
    header('Location: teacher.php');
    exit;
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Введите корректный email';
    } else {
        // Проверим, не занят ли email другим учителем
        $stmt = $pdo->prepare("SELECT id FROM teachers WHERE email = ? AND id != ?");
        $stmt->execute([$email, $teacher_id]);
        if ($stmt->fetch()) {
            $error = 'Этот email уже используется';
        } else {
            $code = bin2hex(random_bytes(16));
            $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

            $stmt = $pdo->prepare("UPDATE teachers SET email = ?, verification_code = ?, verification_code_expires = ? WHERE id = ?");
            $stmt->execute([$email, $code, $expires, $teacher_id]);

            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'];
            $link = "$protocol://$host/verify.php?code=$code";

            $subject = "Подтверждение email для TeachForum";
            $body = "Перейдите по ссылке, чтобы подтвердить ваш email:\n$link";
            sendEmail($email, $subject, $body);

            $success = 'Письмо с подтверждением отправлено на вашу почту. Проверьте и перейдите по ссылке.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Добавление email — TeachForum</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="card" style="max-width:400px; margin:80px auto; padding:24px;">
        <h2>Добавьте ваш email</h2>
        <p>Для повышения безопасности и возможности восстановления пароля нам нужен ваш email.</p>
        <?php if ($error): ?>
            <p style="color:red;"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        <?php if ($success): ?>
            <p style="color:green;"><?= htmlspecialchars($success) ?></p>
            <p><a href="teacher.php">Перейти в кабинет</a></p>
        <?php else: ?>
        <form method="post">
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" name="email" class="form-input" required>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Отправить код подтверждения</button>
        </form>
        <?php endif; ?>
    </div>
</body>
</html>