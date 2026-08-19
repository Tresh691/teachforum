<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];

$data = json_decode($_POST['data'] ?? '[]', true);
if (!is_array($data)) {
    echo json_encode(['success' => false, 'error' => 'Неверный формат']);
    exit;
}

// Разрешённые ключи (исключаем students, schedule, homeworks)
$allowed_keys = ['library', 'lectures', 'cheatsheets', 'help', 'add-custom-block'];
// Добавим кастомные разделы (custom_1 и т.д.) – их ключи начинаются с custom_
foreach ($data as $item) {
    $key = $item['key'] ?? '';
    if (strpos($key, 'custom_') === 0) {
        $allowed_keys[] = $key;
    }
}

$pdo->beginTransaction();
try {
    // Сначала удаляем все настройки учителя для допустимых ключей
    $stmt = $pdo->prepare("DELETE FROM sidebar_customization WHERE teacher_id = ? AND section_key IN (" . implode(',', array_fill(0, count($allowed_keys), '?')) . ")");
    $stmt->execute(array_merge([$teacher_id], $allowed_keys));

    // Вставляем новые
    $stmt = $pdo->prepare("INSERT INTO sidebar_customization (teacher_id, section_key, custom_title, custom_icon) VALUES (?, ?, ?, ?)");
    foreach ($data as $item) {
        $key = $item['key'] ?? '';
        if (!in_array($key, $allowed_keys)) continue;
        $title = trim($item['title'] ?? '');
        $icon  = trim($item['icon'] ?? '');
        // Сохраняем только если есть что сохранять (либо заголовок, либо иконка)
        if ($title !== '' || $icon !== '') {
            $stmt->execute([$teacher_id, $key, $title, $icon]);
        }
    }
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => 'Ошибка БД']);
}