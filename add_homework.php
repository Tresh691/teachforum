<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$student_id = (int)($_POST['student_id'] ?? 0);
$block_id   = $_POST['block_id'] ?? null;
$category_id = $_POST['category_id'] ?? null;
$title      = trim($_POST['title'] ?? '');
$text       = trim($_POST['text'] ?? '');
$linksInput = trim($_POST['links'] ?? '');

if ($title === '') {
    echo json_encode(['success' => false, 'error' => 'Название обязательно']);
    exit;
}

// Преобразуем ссылки: если пустая строка – null, иначе пытаемся сохранить как JSON
if ($linksInput === '') {
    $links = null;
} else {
    // Проверяем, не является ли строка уже JSON-массивом
    $decoded = json_decode($linksInput, true);
    if (is_array($decoded)) {
        $links = $linksInput; // это уже JSON
    } else {
        // Превращаем текстовое поле с переносами строк в JSON-массив
        $linksArray = array_filter(array_map('trim', explode("\n", $linksInput)));
        $links = json_encode($linksArray);
    }
}

// Если указана категория, а блок не указан – создаём блок в этой категории
if (empty($block_id) && !empty($category_id)) {
    $stmt = $pdo->prepare("SELECT id FROM homework_categories WHERE id = ? AND teacher_id = ? AND student_id = ?");
    $stmt->execute([$category_id, $teacher_id, $student_id]);
    if ($stmt->fetch()) {
        $stmt = $pdo->prepare("INSERT INTO homework_blocks (teacher_id, student_id, name, category_id) VALUES (?, ?, ?, ?)");
        $stmt->execute([$teacher_id, $student_id, 'Новый блок', $category_id]);
        $block_id = $pdo->lastInsertId();
    }
}

$stmt = $pdo->prepare("INSERT INTO homeworks (teacher_id, student_id, block_id, title, text, links) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$teacher_id, $student_id, $block_id ?: null, $title, $text, $links]);

echo json_encode(['success' => true]);