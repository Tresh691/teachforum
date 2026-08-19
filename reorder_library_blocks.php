<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$order = json_decode($_POST['order'] ?? '[]', true);

if (!is_array($order)) {
    echo json_encode(['success' => false, 'error' => 'Неверный формат']);
    exit;
}

// Обновляем sort_order для каждого блока
$stmt = $pdo->prepare("UPDATE library_blocks SET sort_order = ? WHERE id = ? AND teacher_id = ?");
foreach ($order as $index => $blockId) {
    $stmt->execute([$index, (int)$blockId, $teacher_id]);
}

echo json_encode(['success' => true]);