<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$name = trim($_POST['name'] ?? '');
$type = $_POST['type'] ?? 'lecture';
if ($name === '') {
    echo json_encode(['error' => 'Название обязательно']);
    exit;
}
$stmt = $pdo->prepare("INSERT INTO blocks (teacher_id, name, type) VALUES (?, ?, ?)");
$stmt->execute([$teacher_id, $name, $type]);
echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);