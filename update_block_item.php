<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$id = $_POST['id'] ?? 0;
$title = trim($_POST['title'] ?? '');
$link = trim($_POST['link'] ?? '');
$comment = trim($_POST['comment'] ?? '');
if ($title === '') {
    echo json_encode(['error' => 'Название обязательно']);
    exit;
}
$stmt = $pdo->prepare("UPDATE block_items SET title = ?, link = ?, comment = ? WHERE id = ?");
$stmt->execute([$title, $link, $comment, $id]);
echo json_encode(['success' => true]);