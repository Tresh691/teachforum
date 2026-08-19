<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$block_id = (int)($_POST['block_id'] ?? 0);
$name = trim($_POST['name'] ?? '');
$type = $_POST['type'] ?? 'material';

if (!in_array($type, ['material','tasks','lectures'])) {
    $type = 'material';
}

if ($name === '') {
    echo json_encode(['success' => false, 'error' => 'Название обязательно']);
    exit;
}

// Проверяем, что кастомный блок принадлежит учителю
$stmt = $pdo->prepare("SELECT id FROM custom_blocks WHERE id = ? AND teacher_id = ?");
$stmt->execute([$block_id, $teacher_id]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Раздел не найден']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO custom_groups (custom_block_id, name, type) VALUES (?, ?, ?)");
$stmt->execute([$block_id, $name, $type]);

echo json_encode(['success' => true]);