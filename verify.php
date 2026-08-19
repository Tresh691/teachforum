<?php
date_default_timezone_set('Europe/Moscow');
require_once __DIR__ . '/config.php';

$code = $_GET['code'] ?? '';

// Если код не передан или длина не 32 символа — показываем страницу с ошибкой
if (strlen($code) !== 32) {
    showVerifyError('Неверный код.');
    exit;
}

// Временно ищем код БЕЗ проверки activated = 0, чтобы сработало при любом статусе активации
$stmt = $pdo->prepare("SELECT id FROM teachers WHERE verification_code = ? AND verification_code_expires > NOW()");
$stmt->execute([$code]);
$teacher = $stmt->fetch();

if ($teacher) {
    // Подтверждаем email и активируем аккаунт
    $stmt = $pdo->prepare("UPDATE teachers SET activated = 1, email_verified = 1, verification_code = NULL, verification_code_expires = NULL WHERE id = ?");
    $stmt->execute([$teacher['id']]);
    showVerifySuccess();
} else {
    // Код не найден или истёк — показываем сообщение с кнопкой «Запросить новый код»
    showVerifyError('Ссылка недействительна или устарела.');
}

// ============================================
// Функции для отображения красивых страниц
// ============================================
function showVerifySuccess() {
    echo '<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Email подтверждён — TeachForum</title>
    <link rel="stylesheet" href="css/style2.css">
</head>
<body>
    <div class="card" style="max-width:400px; margin:80px auto; padding:24px; text-align:center;">
        <div style="font-size:48px; margin-bottom:16px;">✅</div>
        <h2>Готово!</h2>
        <p>Email подтверждён! Теперь вы можете войти.</p>
        <a href="index.php" class="btn btn--primary" style="margin-top:16px;">Войти</a>
    </div>
</body>
</html>';
    exit;
}

function showVerifyError($message) {
    echo '<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Ошибка подтверждения — TeachForum</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="card" style="max-width:400px; margin:80px auto; padding:24px; text-align:center;">
        <div style="font-size:48px; margin-bottom:16px;">⚠️</div>
        <h2>' . htmlspecialchars($message) . '</h2>
        <p>Вы можете запросить новое письмо для подтверждения email.</p>
        <a href="resend_verification.php" class="btn btn--primary" style="margin-top:16px;">Запросить новый код</a>
        <p style="margin-top:12px;"><a href="index.php">← На главную</a></p>
    </div>
</body>
</html>';
    exit;
}