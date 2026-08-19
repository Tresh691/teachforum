<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];

$stmt = $pdo->prepare("SELECT id, name, sort_order FROM library_sections WHERE teacher_id = ? ORDER BY sort_order ASC");
$stmt->execute([$teacher_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));