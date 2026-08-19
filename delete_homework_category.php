<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$category_id = (int)($_POST['id'] ?? 0);
// Проверка прав
$stmt = $pdo->prepare("SELECT id FROM homework_categories WHERE id = ? AND teacher_id = ?");
$stmt->execute([$category_id, $teacher_id]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Категория не найдена']);
    exit;
}
// Блоки категории становятся без категории
$stmt = $pdo->prepare("UPDATE homework_blocks SET category_id = NULL WHERE category_id = ?");
$stmt->execute([$category_id]);
// Удаляем категорию
$stmt = $pdo->prepare("DELETE FROM homework_categories WHERE id = ?");
$stmt->execute([$category_id]);
echo json_encode(['success' => true]);