<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$block_id = $_GET['block_id'] ?? 0;
$stmt = $pdo->prepare("SELECT id, name, type, sort_order FROM custom_groups WHERE custom_block_id = ? ORDER BY sort_order ASC");
$stmt->execute([$block_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));