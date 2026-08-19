<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$student_id = $_GET['student_id'] ?? 0;
$stmt = $pdo->prepare("
    SELECT sa.id AS assignment_id, lt.title, lt.text, lt.topic, lt.links, sa.status
    FROM student_assignments sa
    JOIN library_tasks lt ON sa.library_task_id = lt.id
    WHERE sa.student_id = ? AND sa.teacher_id = ?
    ORDER BY sa.assigned_at DESC
");
$stmt->execute([$student_id, $teacher_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));