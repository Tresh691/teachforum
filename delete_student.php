<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$student_id = $_POST['student_id'] ?? 0;
$stmt = $pdo->prepare("DELETE FROM students WHERE id = ? AND teacher_id = ?");
$stmt->execute([$student_id, $teacher_id]);
echo json_encode(['success' => true]);