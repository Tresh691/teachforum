<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$group_id = $_GET['group_id'] ?? 0;
$stmt = $pdo->prepare("SELECT id, title, link, comment, sort_order FROM custom_items WHERE group_id = ? ORDER BY sort_order ASC");
$stmt->execute([$group_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));