<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}
require_once __DIR__ . '/config.php';
$block_id = (int)($_POST['block_id'] ?? 0);
$student_ids = json_decode($_POST['student_ids'] ?? '[]', true);

// Проверяем, что блок принадлежит учителю
$stmt = $pdo->prepare("SELECT id FROM blocks WHERE id = ? AND teacher_id = ?");
$stmt->execute([$block_id, $_SESSION['user']['id']]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Блок не найден']);
    exit;
}

$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare("DELETE FROM block_access WHERE block_id = ?");
    $stmt->execute([$block_id]);
    if (!empty($student_ids)) {
        $stmt = $pdo->prepare("INSERT INTO block_access (block_id, student_id) VALUES (?, ?)");
        foreach ($student_ids as $sid) {
            $stmt->execute([$block_id, (int)$sid]);
        }
    }
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => 'Ошибка БД']);
}