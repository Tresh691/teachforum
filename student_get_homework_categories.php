<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$student_id = $_SESSION['user']['id'];

// Получаем teacher_id ученика
$stmt = $pdo->prepare("SELECT teacher_id FROM students WHERE id = ?");
$stmt->execute([$student_id]);
$teacher_id = $stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT id, name FROM homework_categories WHERE teacher_id = ? AND student_id = ? ORDER BY sort_order ASC");
$stmt->execute([$teacher_id, $student_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));