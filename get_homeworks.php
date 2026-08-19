<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$student_id = $_GET['student_id'] ?? 0;

$stmt = $pdo->prepare("SELECT id, student_id, block_id, title, topic, text, links, status FROM homeworks WHERE teacher_id = ? AND student_id = ? ORDER BY created_at DESC");
$stmt->execute([$teacher_id, $student_id]);
$homeworks = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Приводим block_id к целому числу или null
foreach ($homeworks as &$hw) {
    if ($hw['block_id'] !== null) {
        $hw['block_id'] = (int)$hw['block_id'];
    }
}
unset($hw);

echo json_encode($homeworks);