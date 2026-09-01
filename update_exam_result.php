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
$exam_name = trim($_POST['exam_name'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$exam_date = $_POST['exam_date'] ?? null;
$score = (int)($_POST['score'] ?? 0);

if ($id <= 0 || $exam_name === '') {
    echo json_encode(['success' => false, 'error' => 'Неверные данные']);
    exit;
}

// Проверяем, что запись принадлежит учителю
$stmt = $pdo->prepare("SELECT id FROM exam_results WHERE id = ? AND teacher_id = ?");
$stmt->execute([$id, $teacher_id]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Запись не найдена']);
    exit;
}

$stmt = $pdo->prepare("UPDATE exam_results SET exam_name = ?, subject = ?, exam_date = ?, score = ? WHERE id = ? AND teacher_id = ?");
$stmt->execute([$exam_name, $subject ?: null, $exam_date ?: null, $score, $id, $teacher_id]);

echo json_encode(['success' => true]);