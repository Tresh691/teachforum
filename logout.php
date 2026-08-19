<?php
session_start();
require_once __DIR__ . '/config.php';

// Удаляем токен запоминания у учителя
if (isset($_SESSION['user']['id']) && $_SESSION['user']['role'] === 'teacher') {
    $stmt = $pdo->prepare("UPDATE teachers SET remember_token = NULL WHERE id = ?");
    $stmt->execute([$_SESSION['user']['id']]);
}

// Удаляем токен запоминания у ученика (теперь поле есть)
if (isset($_SESSION['user']['id']) && $_SESSION['user']['role'] === 'student') {
    $stmt = $pdo->prepare("UPDATE students SET remember_token = NULL WHERE id = ?");
    $stmt->execute([$_SESSION['user']['id']]);
}

// Очищаем куку remember_token
setcookie('remember_token', '', time() - 3600, '/', '', false, true);

// Завершаем сессию
session_destroy();

// Очищаем sessionStorage от бета-уведомления и перенаправляем на главную
echo '<script>sessionStorage.removeItem("beta_notice_shown"); window.location.href="index.php";</script>';
exit;