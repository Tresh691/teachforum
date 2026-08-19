<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id    = $_SESSION['user']['id'];
$task_id       = (int)($_POST['task_id'] ?? 0);
$student_id    = (int)($_POST['student_id'] ?? 0);
$category_name = trim($_POST['category_name'] ?? '');

// Проверяем задание в библиотеке
$stmt = $pdo->prepare("SELECT id, title, text, links, block_id FROM library_tasks WHERE id = ? AND (teacher_id = ? OR teacher_id IS NULL)");
$stmt->execute([$task_id, $teacher_id]);
$task = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$task) {
    echo json_encode(['success' => false, 'error' => 'Задание не найдено']);
    exit;
}

// Проверка дубликата
$stmt = $pdo->prepare("SELECT id FROM homeworks WHERE student_id = ? AND library_task_id = ?");
$stmt->execute([$student_id, $task_id]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Это задание уже назначено ученику']);
    exit;
}

// --- Создание/поиск категории ---
$category_id = null;
if ($category_name !== '') {
    $stmt = $pdo->prepare("SELECT id FROM homework_categories WHERE name = ? AND student_id = ? AND teacher_id = ?");
    $stmt->execute([$category_name, $student_id, $teacher_id]);
    $existing = $stmt->fetchColumn();
    if ($existing) {
        $category_id = $existing;
    } else {
        $stmt = $pdo->prepare("INSERT INTO homework_categories (teacher_id, student_id, name) VALUES (?, ?, ?)");
        $stmt->execute([$teacher_id, $student_id, $category_name]);
        $category_id = $pdo->lastInsertId();
    }
}

// --- Создание/поиск блока (как раньше, но с учётом категории) ---
$block_id = null;
if ($task['block_id']) {
    $stmt = $pdo->prepare("SELECT name FROM library_blocks WHERE id = ?");
    $stmt->execute([$task['block_id']]);
    $libBlockName = $stmt->fetchColumn();
    if ($libBlockName) {
        if ($category_id) {
            $stmt = $pdo->prepare("SELECT id FROM homework_blocks WHERE name = ? AND student_id = ? AND category_id = ?");
            $stmt->execute([$libBlockName, $student_id, $category_id]);
        } else {
            $stmt = $pdo->prepare("SELECT id FROM homework_blocks WHERE name = ? AND student_id = ? AND category_id IS NULL");
            $stmt->execute([$libBlockName, $student_id]);
        }
        $existingBlock = $stmt->fetchColumn();
        if ($existingBlock) {
            $block_id = $existingBlock;
        } else {
            $stmt = $pdo->prepare("INSERT INTO homework_blocks (teacher_id, student_id, name, category_id) VALUES (?, ?, ?, ?)");
            $stmt->execute([$teacher_id, $student_id, $libBlockName, $category_id]);
            $block_id = $pdo->lastInsertId();
        }
    }
}

// Вставляем задание
$links = $task['links'] ?? null;
$stmt = $pdo->prepare("INSERT INTO homeworks (teacher_id, student_id, block_id, library_task_id, title, text, links) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([$teacher_id, $student_id, $block_id, $task_id, $task['title'], $task['text'] ?? '', $links]);

echo json_encode(['success' => true]);