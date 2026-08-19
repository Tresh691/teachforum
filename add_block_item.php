<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$block_id = $_POST['block_id'] ?? 0;
$title = trim($_POST['title'] ?? '');
$link = trim($_POST['link'] ?? '');
$comment = trim($_POST['comment'] ?? '');
if ($title === '') {
    echo json_encode(['error' => 'Название обязательно']);
    exit;
}
$stmt = $pdo->prepare("INSERT INTO block_items (block_id, title, link, comment) VALUES (?, ?, ?, ?)");
$stmt->execute([$block_id, $title, $link, $comment]);
echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);