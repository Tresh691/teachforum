<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$id       = $_POST['id'] ?? 0;
$block_id = $_POST['block_id'] ?? null;
if ($block_id === '' || $block_id === '0') $block_id = null;

$title    = trim($_POST['title'] ?? '');
$text     = trim($_POST['text'] ?? '');
$linksRaw = trim($_POST['links'] ?? '');
$links    = array_filter(array_map('trim', explode("\n", $linksRaw)));

if ($title === '') {
    echo json_encode(['error' => 'Название обязательно']);
    exit;
}

$stmt = $pdo->prepare("UPDATE library_tasks SET block_id=?, title=?, text=?, links=? WHERE id=? AND (teacher_id=? OR teacher_id IS NULL)");
$stmt->execute([$block_id, $title, $text, json_encode($links, JSON_UNESCAPED_UNICODE), $id, $teacher_id]);

echo json_encode(['success' => true]);