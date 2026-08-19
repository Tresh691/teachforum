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
$name = trim($_POST['name'] ?? '');
$section_id = $_POST['section_id'] ?? null;

if ($name === '') {
    echo json_encode(['success' => false, 'error' => 'Название обязательно']);
    exit;
}
$stmt = $pdo->prepare("UPDATE library_blocks SET name = ?, section_id = ? WHERE id = ? AND teacher_id = ?");
$stmt->execute([$name, $section_id ?: null, $id, $teacher_id]);
echo json_encode(['success' => true]);