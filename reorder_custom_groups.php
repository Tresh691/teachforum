<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$order = json_decode($_POST['order'] ?? '[]', true);
if (!is_array($order)) {
    echo json_encode(['error' => 'Неверный формат']);
    exit;
}
foreach ($order as $index => $groupId) {
    $stmt = $pdo->prepare("UPDATE custom_groups SET sort_order = ? WHERE id = ?");
    $stmt->execute([$index, $groupId]);
}
echo json_encode(['success' => true]);