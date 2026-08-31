<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$section_id = (int)($_POST['id'] ?? 0);

if ($section_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Неверный ID']);
    exit;
}

// Удаляем раздел
$stmt = $pdo->prepare("DELETE FROM lecture_sections WHERE id = ? AND teacher_id = ?");
$stmt->execute([$section_id, $teacher_id]);

// Блоки, принадлежащие этому разделу, остаются без раздела (section_id = NULL)
$stmt = $pdo->prepare("UPDATE blocks SET section_id = NULL WHERE section_id = ? AND teacher_id = ? AND type = 'lecture'");
$stmt->execute([$section_id, $teacher_id]);

echo json_encode(['success' => true]);