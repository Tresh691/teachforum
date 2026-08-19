<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$item_id = (int)($_POST['id'] ?? 0);
$title = trim($_POST['title'] ?? '');
$link = trim($_POST['link'] ?? '');
$comment = trim($_POST['comment'] ?? '');
$text = trim($_POST['text'] ?? '');
$links = trim($_POST['links'] ?? '');

if ($title === '') {
    echo json_encode(['success' => false, 'error' => 'Название обязательно']);
    exit;
}

// Получаем item и проверяем права
$stmt = $pdo->prepare("
    SELECT ci.id, ci.group_id, cg.type FROM custom_items ci
    JOIN custom_groups cg ON ci.group_id = cg.id
    JOIN custom_blocks cb ON cg.custom_block_id = cb.id
    WHERE ci.id = ? AND cb.teacher_id = ?
");
$stmt->execute([$item_id, $teacher_id]);
$item = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$item) {
    echo json_encode(['success' => false, 'error' => 'Элемент не найден']);
    exit;
}

$type = $item['type'];

if ($type === 'tasks') {
    $commentToSave = $text;
    $linkToSave = $links;
} else {
    $commentToSave = $comment;
    $linkToSave = $link;
}

$stmt = $pdo->prepare("UPDATE custom_items SET title = ?, link = ?, comment = ? WHERE id = ?");
$stmt->execute([$title, $linkToSave, $commentToSave, $item_id]);

echo json_encode(['success' => true]);