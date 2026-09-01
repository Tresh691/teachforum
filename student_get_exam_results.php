<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$student_id = (int)$_SESSION['user']['id'];
$stmt = $pdo->prepare("SELECT exam_name, subject, exam_date, score FROM exam_results WHERE student_id = ? ORDER BY exam_date DESC");
$stmt->execute([$student_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));