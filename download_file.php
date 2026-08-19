<?php
session_start();
if (empty($_SESSION['user'])) {
    http_response_code(403);
    exit('Доступ запрещён');
}
require_once __DIR__ . '/config.php';

$file_id = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM files WHERE id = ?");
$stmt->execute([$file_id]);
$file = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$file) {
    http_response_code(404);
    exit('Файл не найден');
}

// Проверка доступа
$student_id = $_SESSION['user']['id'] ?? 0;
// Здесь можно добавить проверку прав, аналогичную get_files.php

$filePath = __DIR__ . '/uploads/' . $file['stored_name'];
if (!file_exists($filePath)) {
    http_response_code(404);
    exit('Файл не найден');
}

header('Content-Type: ' . ($file['mime_type'] ?? 'application/octet-stream'));
header('Content-Disposition: attachment; filename="' . $file['original_name'] . '"');
header('Content-Length: ' . filesize($filePath));
readfile($filePath);
exit;