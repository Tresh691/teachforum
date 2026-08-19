<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$block_id = $_GET['block_id'] ?? 0;
$stmt = $pdo->prepare("SELECT id, title, link, comment FROM block_items WHERE block_id = ? ORDER BY created_at ASC");
$stmt->execute([$block_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));