<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$id = $_POST['id'] ?? 0;
$stmt = $pdo->prepare("DELETE FROM homework_blocks WHERE id = ? AND teacher_id = ?");
$stmt->execute([$id, $teacher_id]);
echo json_encode(['success' => true]);