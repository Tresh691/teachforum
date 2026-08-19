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
$type = $_POST['type'] ?? 'material';

if (!in_array($type, ['material','tasks','lectures'])) {
    $type = 'material';
}

if ($name === '') {
    echo json_encode(['success' => false, 'error' => 'Название обязательно']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO custom_blocks (teacher_id, name, type) VALUES (?, ?, ?)");
$stmt->execute([$teacher_id, $name, $type]);
$newId = $pdo->lastInsertId();

echo json_encode(['success' => true, 'block_id' => $newId]);