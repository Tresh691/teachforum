<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$student_id = (int)($_GET['student_id'] ?? 0);

$stmt = $pdo->prepare("SELECT id, name FROM homework_categories WHERE teacher_id = ? AND student_id = ? ORDER BY sort_order ASC");
$stmt->execute([$teacher_id, $student_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));