<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$id = (int)($_POST['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Неверный ID']);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM exam_results WHERE id = ? AND teacher_id = ?");
$stmt->execute([$id, $teacher_id]);

echo json_encode(['success' => true]);