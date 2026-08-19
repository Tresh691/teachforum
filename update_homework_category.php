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
$name = trim($_POST['name'] ?? '');
if ($name === '') {
    echo json_encode(['success' => false, 'error' => 'Введите название']);
    exit;
}
// Проверка прав
$stmt = $pdo->prepare("SELECT id FROM homework_categories WHERE id = ? AND teacher_id = ?");
$stmt->execute([$category_id, $teacher_id]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Категория не найдена']);
    exit;
}
$stmt = $pdo->prepare("UPDATE homework_categories SET name = ? WHERE id = ?");
$stmt->execute([$name, $category_id]);
echo json_encode(['success' => true]);