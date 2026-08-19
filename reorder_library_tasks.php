<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$block_id = $_POST['block_id'] ?? 0;
$order = json_decode($_POST['order'] ?? '[]', true);

if (!is_array($order)) {
    echo json_encode(['error' => 'Неверный формат']);
    exit;
}

foreach ($order as $index => $taskId) {
    $stmt = $pdo->prepare("UPDATE library_tasks SET sort_order = ? WHERE id = ? AND block_id = ?");
    $stmt->execute([$index, $taskId, $block_id]);
}

echo json_encode(['success' => true]);