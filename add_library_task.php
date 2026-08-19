<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$block_id = $_POST['block_id'] ?? null;
if ($block_id === '' || $block_id === '0') $block_id = null;

$title  = trim($_POST['title'] ?? '');
$text   = trim($_POST['text'] ?? '');
$linksRaw = trim($_POST['links'] ?? '');
$links  = array_filter(array_map('trim', explode("\n", $linksRaw)));

if ($title === '') {
    echo json_encode(['error' => 'Название обязательно']);
    exit;
}

// Вычисляем следующий sort_order
if ($block_id === null) {
    $stmt = $pdo->prepare("SELECT MAX(sort_order) FROM library_tasks WHERE block_id IS NULL");
    $stmt->execute();
} else {
    $stmt = $pdo->prepare("SELECT MAX(sort_order) FROM library_tasks WHERE block_id = ?");
    $stmt->execute([$block_id]);
}
$maxOrder = (int)$stmt->fetchColumn();
$nextOrder = $maxOrder + 1;

$stmt = $pdo->prepare("INSERT INTO library_tasks (teacher_id, block_id, title, text, links, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$teacher_id, $block_id, $title, $text, json_encode($links, JSON_UNESCAPED_UNICODE), $nextOrder]);

echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);