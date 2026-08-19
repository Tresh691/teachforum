<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$name = trim($_POST['name'] ?? '');
$section_id = $_POST['section_id'] ?? null;
if ($name === '') {
    echo json_encode(['success' => false, 'error' => 'Название обязательно']);
    exit;
}
$stmt = $pdo->prepare("INSERT INTO library_blocks (teacher_id, section_id, name) VALUES (?, ?, ?)");
$stmt->execute([$teacher_id, $section_id ?: null, $name]);
echo json_encode(['success' => true, 'block_id' => $pdo->lastInsertId()]);