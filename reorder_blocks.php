<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$type = $_POST['type'] ?? 'lecture';
$order = json_decode($_POST['order'] ?? '[]', true);

if (!is_array($order)) {
    echo json_encode(['error' => 'Неверный формат']);
    exit;
}

foreach ($order as $index => $blockId) {
    $stmt = $pdo->prepare("UPDATE blocks SET sort_order = ? WHERE id = ? AND teacher_id = ? AND type = ?");
    $stmt->execute([$index, $blockId, $teacher_id, $type]);
}

echo json_encode(['success' => true]);