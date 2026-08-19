<?php
date_default_timezone_set('Europe/Moscow');
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Введите корректный email';
    } else {
        $stmt = $pdo->prepare("SELECT id FROM teachers WHERE email = ?");
        $stmt->execute([$email]);
        $teacher = $stmt->fetch();

        if ($teacher) {
            $code = bin2hex(random_bytes(16));
            $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

            $stmt = $pdo->prepare("UPDATE teachers SET verification_code = ?, verification_code_expires = ? WHERE id = ?");
            $stmt->execute([$code, $expires, $teacher['id']]);

            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'];
            $link = "$protocol://$host/reset_password.php?code=$code";

            $subject = "Восстановление пароля TeachForum";
            $body = "Перейдите по ссылке, чтобы установить новый пароль:\n$link\nСсылка действительна 1 час.";
            sendEmail($email, $subject, $body);

            $success = 'Ссылка для сброса пароля отправлена на вашу почту.';
        } else {
            $success = 'Если этот email зарегистрирован, вы получите письмо со ссылкой для сброса пароля.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Восстановление пароля — TeachForum</title>
    <link rel="stylesheet" href="css/style2.css">
</head>
<body>
    <div class="card" style="max-width:400px; margin:80px auto; padding:24px;">
        <h2>Восстановление пароля</h2>
        <?php if ($error): ?>
            <p style="color:red;"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        <?php if ($success): ?>
            <p style="color:green;"><?= htmlspecialchars($success) ?></p>
            <p><a href="index.php">← На главную</a></p>
        <?php else: ?>
        <form method="post">
            <div class="form-group">
                <label class="form-label">Введите ваш email</label>
                <input type="email" name="email" class="form-input" required>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Отправить ссылку</button>
        </form>
        <?php endif; ?>
        <p style="text-align:center; margin-top:12px;"><a href="index.php">← На главную</a></p>
    </div>
</body>
</html>