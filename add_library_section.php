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
if ($name === '') {
    echo json_encode(['success' => false, 'error' => 'Название обязательно']);
    exit;
}
$stmt = $pdo->prepare("INSERT INTO library_sections (teacher_id, name) VALUES (?, ?)");
$stmt->execute([$teacher_id, $name]);
echo json_encode(['success' => true, 'section_id' => $pdo->lastInsertId()]);