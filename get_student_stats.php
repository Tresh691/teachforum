<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$student_id = (int)($_GET['student_id'] ?? 0);
$year  = (int)($_GET['year'] ?? date('Y'));
$month = (int)($_GET['month'] ?? date('m'));

// Проверяем, что ученик принадлежит учителю
$stmt = $pdo->prepare("SELECT id FROM students WHERE id = ? AND teacher_id = ?");
$stmt->execute([$student_id, $teacher_id]);
if (!$stmt->fetch()) {
    echo json_encode(['error' => 'Ученик не найден']);
    exit;
}

// Считаем уроки за выбранный месяц
$stmt = $pdo->prepare("
    SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid,
        SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid,
        SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN payment_status = 'none' THEN 1 ELSE 0 END) AS none
    FROM lessons
    WHERE student_id = ? 
      AND teacher_id = ?
      AND YEAR(lesson_date) = ? 
      AND MONTH(lesson_date) = ?
");
$stmt->execute([$student_id, $teacher_id, $year, $month]);
$stats = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($stats ?: ['total' => 0, 'paid' => 0, 'unpaid' => 0, 'pending' => 0, 'none' => 0]);