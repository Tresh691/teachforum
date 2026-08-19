<?php
session_start();
if (empty($_SESSION['admin'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../config.php';

$teacher_id = $_POST['teacher_id'] ?? 0;
$days       = intval($_POST['days'] ?? 0);
$date       = $_POST['date'] ?? '';   // конкретная дата (если указана)

if ($days > 0) {
    $new_expires = date('Y-m-d H:i:s', strtotime("+{$days} days"));
} elseif (!empty($date)) {
    $new_expires = $date . ' 23:59:59';
} else {
    // бессрочный доступ
    $new_expires = null;
}

$stmt = $pdo->prepare("UPDATE teachers SET activated = 1, expires_at = ? WHERE id = ?");
$stmt->execute([$new_expires, $teacher_id]);

// Очищаем remember_token, чтобы сбросить старые куки
$stmt = $pdo->prepare("UPDATE teachers SET remember_token = NULL WHERE id = ?");
$stmt->execute([$teacher_id]);

header('Location: index.php?extended=1');
exit;