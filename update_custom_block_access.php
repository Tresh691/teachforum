<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';

$block_id = $_POST['block_id'] ?? 0;
$student_ids = json_decode($_POST['student_ids'] ?? '[]', true);

if (!is_array($student_ids)) {
    echo json_encode(['error' => 'Неверные данные']);
    exit;
}

// Удаляем старые права
$stmt = $pdo->prepare("DELETE FROM custom_block_access WHERE custom_block_id = ?");
$stmt->execute([$block_id]);

// Вставляем новые
if (!empty($student_ids)) {
    $stmt = $pdo->prepare("INSERT INTO custom_block_access (custom_block_id, student_id) VALUES (?, ?)");
    foreach ($student_ids as $sid) {
        $stmt->execute([$block_id, $sid]);
    }
}

echo json_encode(['success' => true]);