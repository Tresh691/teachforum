<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$student_id = $_SESSION['user']['id'];

$stmt = $pdo->prepare("SELECT cb.id, cb.name FROM custom_blocks cb
                       JOIN custom_block_access cba ON cb.id = cba.custom_block_id
                       WHERE cba.student_id = ?
                       ORDER BY cb.sort_order");
$stmt->execute([$student_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));