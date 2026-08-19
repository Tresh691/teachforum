<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$student_id = $_SESSION['user']['id'];

$stmt = $pdo->prepare("SELECT id, student_id, block_id, title, topic, text, links, status FROM homeworks WHERE student_id = ? ORDER BY created_at DESC");
$stmt->execute([$student_id]);
$homeworks = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($homeworks as &$hw) {
    if ($hw['block_id'] !== null) {
        $hw['block_id'] = (int)$hw['block_id'];
    }
}
unset($hw);

echo json_encode($homeworks);