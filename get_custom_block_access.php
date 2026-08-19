<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$block_id = $_GET['block_id'] ?? 0;
$stmt = $pdo->prepare("SELECT student_id FROM custom_block_access WHERE custom_block_id = ?");
$stmt->execute([$block_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));