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

// Проверяем наличие файла
if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'Файл не загружен']);
    exit;
}

$file = $_FILES['avatar'];

// Проверяем тип (разрешаем только изображения)
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Разрешены только изображения (JPEG, PNG, GIF, WebP)']);
    exit;
}

// Ограничение размера (5 МБ)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'error' => 'Файл слишком большой. Максимум 5 МБ.']);
    exit;
}

// Папка для сохранения
$uploadDir = __DIR__ . '/uploads/avatars/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Генерируем имя файла
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
if (empty($ext)) {
    $ext = 'jpg';
}
$storedName = $role . '_' . $userId . '.' . $ext;
$dest = $uploadDir . $storedName;

// Удаляем старый аватар (любого расширения), если был
$oldAvatar = null;
if ($role === 'teacher') {
    $stmt = $pdo->prepare("SELECT avatar FROM teachers WHERE id = ?");
} else {
    $stmt = $pdo->prepare("SELECT avatar FROM students WHERE id = ?");
}
$stmt->execute([$userId]);
$oldAvatar = $stmt->fetchColumn();

if ($oldAvatar) {
    $oldPath = __DIR__ . '/' . $oldAvatar;
    if (file_exists($oldPath)) {
        unlink($oldPath);
    }
}

// Сохраняем новый файл
if (!move_uploaded_file($file['tmp_name'], $dest)) {
    echo json_encode(['success' => false, 'error' => 'Не удалось сохранить файл']);
    exit;
}

// Обновляем путь в БД (относительный путь от public/)
$relativePath = 'uploads/avatars/' . $storedName;
if ($role === 'teacher') {
    $stmt = $pdo->prepare("UPDATE teachers SET avatar = ? WHERE id = ?");
} else {
    $stmt = $pdo->prepare("UPDATE students SET avatar = ? WHERE id = ?");
}
$stmt->execute([$relativePath, $userId]);

// Обновляем сессию, если нужно
$_SESSION['user']['avatar'] = $relativePath;

echo json_encode(['success' => true, 'avatar' => $relativePath]);