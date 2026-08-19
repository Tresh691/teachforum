<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}
require_once __DIR__ . '/config.php';

$fileId = (int)($_POST['id'] ?? 0);
$teacherId = $_SESSION['user']['id'];

$stmt = $pdo->prepare("SELECT * FROM files WHERE id=? AND teacher_id=?");
$stmt->execute([$fileId, $teacherId]);
$file = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$file) {
    echo json_encode(['success' => false, 'error' => 'Файл не найден']);
    exit;
}

$filePath = __DIR__ . '/uploads/' . $file['stored_name'];
if (file_exists($filePath)) {
    unlink($filePath);
}

$stmt = $pdo->prepare("DELETE FROM files WHERE id=?");
$stmt->execute([$fileId]);

echo json_encode(['success' => true]);