<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    echo json_encode(['active' => false, 'error' => 'no_session']);
    exit;
}

require_once __DIR__ . '/config.php';

$stmt = $pdo->prepare("SELECT expires_at, activated FROM teachers WHERE id = ?");
$stmt->execute([$_SESSION['user']['id']]);
$teacher = $stmt->fetch();

if (!$teacher || $teacher['activated'] != 1) {
    echo json_encode(['active' => false, 'error' => 'deactivated']);
    exit;
}

if (!empty($teacher['expires_at']) && strtotime($teacher['expires_at']) < time()) {
    // Если срок истёк – деактивируем прямо здесь
    $stmt = $pdo->prepare("UPDATE teachers SET activated = 0 WHERE id = ?");
    $stmt->execute([$_SESSION['user']['id']]);
    // Очищаем токен
    $stmt = $pdo->prepare("UPDATE teachers SET remember_token = NULL WHERE id = ?");
    $stmt->execute([$_SESSION['user']['id']]);
    echo json_encode(['active' => false, 'error' => 'expired']);
    exit;
}

echo json_encode(['active' => true]);