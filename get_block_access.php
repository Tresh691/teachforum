<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$block_id = (int)($_GET['block_id'] ?? 0);
$stmt = $pdo->prepare("SELECT student_id FROM block_access WHERE block_id = ?");
$stmt->execute([$block_id]);
$ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo json_encode(array_map('intval', $ids));