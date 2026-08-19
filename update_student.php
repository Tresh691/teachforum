<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$student_id = (int)($_POST['id'] ?? 0);
$first_name = trim($_POST['first_name'] ?? '');
$last_name  = trim($_POST['last_name'] ?? '');
$subject    = trim($_POST['subject'] ?? '');

if ($first_name === '') {
    echo json_encode(['success' => false, 'error' => 'Имя обязательно']);
    exit;
}

// Проверяем принадлежность ученика учителю
$stmt = $pdo->prepare("SELECT id FROM students WHERE id = ? AND teacher_id = ?");
$stmt->execute([$student_id, $teacher_id]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Ученик не найден']);
    exit;
}

$stmt = $pdo->prepare("UPDATE students SET first_name = ?, last_name = ?, subject = ? WHERE id = ?");
$stmt->execute([$first_name, $last_name, $subject ?: null, $student_id]);

echo json_encode(['success' => true]);