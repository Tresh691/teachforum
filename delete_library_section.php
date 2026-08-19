<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$id = (int)($_POST['id'] ?? 0);
// При удалении раздела блоки внутри него переходят в корень (section_id = NULL)
$stmt = $pdo->prepare("UPDATE library_blocks SET section_id = NULL WHERE section_id = ? AND teacher_id = ?");
$stmt->execute([$id, $teacher_id]);
$stmt = $pdo->prepare("DELETE FROM library_sections WHERE id = ? AND teacher_id = ?");
$stmt->execute([$id, $teacher_id]);
echo json_encode(['success' => true]);