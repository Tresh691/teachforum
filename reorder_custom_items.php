<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$order = json_decode($_POST['order'] ?? '[]', true);
if (!is_array($order)) {
    echo json_encode(['error' => 'Неверный формат']);
    exit;
}
foreach ($order as $index => $itemId) {
    $stmt = $pdo->prepare("UPDATE custom_items SET sort_order = ? WHERE id = ?");
    $stmt->execute([$index, $itemId]);
}
echo json_encode(['success' => true]);