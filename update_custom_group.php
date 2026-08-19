<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$id = $_POST['id'] ?? 0;
$name = trim($_POST['name'] ?? '');
if ($name === '') {
    echo json_encode(['error' => 'Название обязательно']);
    exit;
}
$stmt = $pdo->prepare("UPDATE custom_groups SET name = ? WHERE id = ?");
$stmt->execute([$name, $id]);
echo json_encode(['success' => true]);