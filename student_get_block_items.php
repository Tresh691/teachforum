<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$block_id = $_GET['block_id'] ?? 0;
$stmt = $pdo->prepare("SELECT id, title, link, comment FROM block_items WHERE block_id = ? ORDER BY created_at ASC");
$stmt->execute([$block_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));