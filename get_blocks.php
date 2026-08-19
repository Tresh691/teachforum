<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$type = $_GET['type'] ?? 'lecture';
$stmt = $pdo->prepare("SELECT id, name, sort_order FROM blocks WHERE teacher_id = ? AND type = ? ORDER BY sort_order ASC");
$stmt->execute([$teacher_id, $type]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));