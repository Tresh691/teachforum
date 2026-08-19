<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$group_id = (int)($_POST['group_id'] ?? 0);
$title = trim($_POST['title'] ?? '');
$link = trim($_POST['link'] ?? '');
$comment = trim($_POST['comment'] ?? '');
$text = trim($_POST['text'] ?? '');       // для заданий
$links = trim($_POST['links'] ?? '');     // для заданий (JSON или строки)

if ($title === '') {
    echo json_encode(['success' => false, 'error' => 'Название обязательно']);
    exit;
}

// Проверяем принадлежность группы учителю
$stmt = $pdo->prepare("
    SELECT cg.type FROM custom_groups cg
    JOIN custom_blocks cb ON cg.custom_block_id = cb.id
    WHERE cg.id = ? AND cb.teacher_id = ?
");
$stmt->execute([$group_id, $teacher_id]);
$group = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$group) {
    echo json_encode(['success' => false, 'error' => 'Группа не найдена']);
    exit;
}

$type = $group['type'];

// В зависимости от типа группы сохраняем разные поля
if ($type === 'tasks') {
    // Для заданий: храним текст в comment, а ссылки — в отдельном поле? 
    // У нас в custom_items есть поля comment и link. 
    // Для заданий мы можем использовать comment как текст задания, а link как ссылки (JSON).
    // Или использовать отдельные поля: сейчас задействуем comment для text, link для links.
    $commentToSave = $text;
    $linkToSave = $links;   // это будет JSON-строка из textarea
} else {
    // material и lectures
    $commentToSave = $comment;
    $linkToSave = $link;
}

$stmt = $pdo->prepare("INSERT INTO custom_items (group_id, title, link, comment) VALUES (?, ?, ?, ?)");
$stmt->execute([$group_id, $title, $linkToSave, $commentToSave]);

echo json_encode(['success' => true]);