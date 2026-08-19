<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$studentId = $_SESSION['user']['id'];
$block_id = (int)($_GET['block_id'] ?? 0);

// Получаем teacher_id ученика
$stmt = $pdo->prepare("SELECT teacher_id FROM students WHERE id = ?");
$stmt->execute([$studentId]);
$teacherId = $stmt->fetchColumn();

$stmt = $pdo->prepare("
    SELECT cg.id, cg.name, cg.type, cg.sort_order 
    FROM custom_groups cg
    JOIN custom_blocks cb ON cg.custom_block_id = cb.id
    WHERE cg.custom_block_id = ? AND cb.teacher_id = ?
    ORDER BY cg.sort_order ASC
");
$stmt->execute([$block_id, $teacherId]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));