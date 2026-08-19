<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$id = $_POST['id'] ?? 0;
$name = trim($_POST['name'] ?? '');

if ($name === '') {
    echo json_encode(['error' => 'Название обязательно']);
    exit;
}

$stmt = $pdo->prepare("UPDATE blocks SET name = ? WHERE id = ? AND teacher_id = ?");
$stmt->execute([$name, $id, $teacher_id]);

echo json_encode(['success' => true]);