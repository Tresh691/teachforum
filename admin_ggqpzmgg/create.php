<?php
session_start();
if (!isset($_SESSION['admin'])) {
    die('Доступ запрещён');
}
require_once __DIR__ . '/../config.php';

$login = trim($_POST['login'] ?? '');
$password = $_POST['password'] ?? '';

if ($login === '' || $password === '') {
    die('Логин и пароль обязательны');
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare("INSERT INTO teachers (login, password_hash, activated) VALUES (?, ?, 1)");
$stmt->execute([$login, $hash]);

header('Location: index.php?ok=1&login=' . urlencode($login));
exit;