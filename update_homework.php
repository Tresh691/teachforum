<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$id         = (int)($_POST['id'] ?? 0);
$status     = $_POST['status'] ?? null;

// Если передан только статус (и это не пустая строка), обновляем только его
if ($id > 0 && $status !== null) {
    $stmt = $pdo->prepare("UPDATE homeworks SET status = ? WHERE id = ? AND teacher_id = ?");
    $stmt->execute([$status, $id, $teacher_id]);
    echo json_encode(['success' => true]);
    exit;
}

// Иначе обрабатываем полное редактирование
$block_id = $_POST['block_id'] ?? null;
$title    = trim($_POST['title'] ?? '');
$text     = trim($_POST['text'] ?? '');
$links    = trim($_POST['links'] ?? '');

if ($title === '') {
    echo json_encode(['success' => false, 'error' => 'Название обязательно']);
    exit;
}

// Преобразуем пустую строку ссылок в NULL, чтобы избежать ошибки JSON
if ($links === '') {
    $links = null;
}

$stmt = $pdo->prepare("UPDATE homeworks SET block_id = ?, title = ?, text = ?, links = ?, status = ? WHERE id = ? AND teacher_id = ?");
$stmt->execute([$block_id ?: null, $title, $text, $links, $status ?? 'Не выполнено', $id, $teacher_id]);

echo json_encode(['success' => true]);