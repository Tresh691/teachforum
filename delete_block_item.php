<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$id = $_POST['id'] ?? 0;
$stmt = $pdo->prepare("DELETE FROM block_items WHERE id = ?");
$stmt->execute([$id]);
echo json_encode(['success' => true]);