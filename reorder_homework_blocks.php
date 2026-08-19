<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$student_id = $_POST['student_id'] ?? 0;
$order = json_decode($_POST['order'] ?? '[]', true);

if (!is_array($order)) {
    echo json_encode(['error' => 'Неверный формат']);
    exit;
}

foreach ($order as $index => $blockId) {
    $stmt = $pdo->prepare("UPDATE homework_blocks SET sort_order = ? WHERE id = ? AND teacher_id = ? AND student_id = ?");
    $stmt->execute([$index, $blockId, $teacher_id, $student_id]);
}

echo json_encode(['success' => true]);