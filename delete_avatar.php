<?php
session_start();
if (empty($_SESSION['user'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$role = $_SESSION['user']['role'];
$userId = $_SESSION['user']['id'];

if (!in_array($role, ['teacher', 'student'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Неизвестная роль']);
    exit;
}

// Получаем текущий аватар
if ($role === 'teacher') {
    $stmt = $pdo->prepare("SELECT avatar FROM teachers WHERE id = ?");
} else {
    $stmt = $pdo->prepare("SELECT avatar FROM students WHERE id = ?");
}
$stmt->execute([$userId]);
$avatar = $stmt->fetchColumn();

// Удаляем файл, если есть
if ($avatar) {
    $filePath = __DIR__ . '/' . $avatar;
    if (file_exists($filePath)) {
        unlink($filePath);
    }
}

// Обнуляем поле в БД
if ($role === 'teacher') {
    $stmt = $pdo->prepare("UPDATE teachers SET avatar = NULL WHERE id = ?");
} else {
    $stmt = $pdo->prepare("UPDATE students SET avatar = NULL WHERE id = ?");
}
$stmt->execute([$userId]);

// Обновляем сессию
unset($_SESSION['user']['avatar']);

echo json_encode(['success' => true]);