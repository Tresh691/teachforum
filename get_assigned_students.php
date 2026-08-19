<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$task_id = $_GET['task_id'] ?? 0;
$stmt = $pdo->prepare("SELECT student_id FROM homeworks WHERE library_task_id = ?");
$stmt->execute([$task_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));