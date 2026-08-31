<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$stmt = $pdo->prepare("SELECT id, name, sort_order FROM lecture_sections WHERE teacher_id = ? ORDER BY sort_order ASC, id ASC");
$stmt->execute([$teacher_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));