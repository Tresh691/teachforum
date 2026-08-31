<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$block_id = (int)($_POST['id'] ?? 0);
$name = trim($_POST['name'] ?? '');
$type = $_POST['type'] ?? 'lecture';
$section_id = $_POST['section_id'] ?? null; // может быть null

if ($block_id <= 0 || $name === '') {
    echo json_encode(['success' => false, 'error' => 'Неверные данные']);
    exit;
}

// Проверяем, что блок принадлежит учителю и имеет нужный тип
$stmt = $pdo->prepare("SELECT id FROM blocks WHERE id = ? AND teacher_id = ? AND type = ?");
$stmt->execute([$block_id, $teacher_id, $type]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Блок не найден']);
    exit;
}

// Если section_id передан и это лекция, обновляем его
if ($type === 'lecture') {
    // section_id может быть пустой строкой или 'null' — преобразуем
    $section_id = ($section_id === '' || $section_id === null || $section_id === 'null') ? null : (int)$section_id;
}

$stmt = $pdo->prepare("UPDATE blocks SET name = ?, section_id = ? WHERE id = ? AND teacher_id = ?");
$stmt->execute([$name, $section_id, $block_id, $teacher_id]);

echo json_encode(['success' => true]);