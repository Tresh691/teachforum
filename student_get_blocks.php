<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$student_id = (int)$_SESSION['user']['id'];
$type = $_GET['type'] ?? 'lecture';

// Только блоки, к которым ученик имеет явный доступ
$stmt = $pdo->prepare("
    SELECT b.id, b.name, b.sort_order
    FROM blocks b
    JOIN students s ON b.teacher_id = s.teacher_id
    WHERE s.id = ? AND b.type = ?
      AND b.id IN (SELECT block_id FROM block_access WHERE student_id = ?)
    ORDER BY b.sort_order ASC
");
$stmt->execute([$student_id, $type, $student_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));