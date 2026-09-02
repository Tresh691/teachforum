<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$student_id = (int)($_POST['student_id'] ?? 0);
$exam_name = trim($_POST['exam_name'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$exam_date = $_POST['exam_date'] ?? null;
$score = (int)($_POST['score'] ?? 0);
$comment = trim($_POST['comment'] ?? '');

if ($student_id <= 0 || $exam_name === '') {
    echo json_encode(['success' => false, 'error' => 'Обязательные поля не заполнены']);
    exit;
}

// Проверка ученика
$stmt = $pdo->prepare("SELECT id FROM students WHERE id = ? AND teacher_id = ?");
$stmt->execute([$student_id, $teacher_id]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Ученик не найден']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO exam_results (teacher_id, student_id, exam_name, subject, exam_date, score, comment) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([$teacher_id, $student_id, $exam_name, $subject ?: null, $exam_date ?: null, $score, $comment ?: null]);

echo json_encode(['success' => true, 'exam_id' => $pdo->lastInsertId()]);