<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$block_id = (int)($_POST['block_id'] ?? 0);
$section_id = $_POST['section_id'] ?? null;

$stmt = $pdo->prepare("UPDATE library_blocks SET section_id = ? WHERE id = ? AND teacher_id = ?");
$stmt->execute([$section_id ?: null, $block_id, $teacher_id]);
echo json_encode(['success' => true]);