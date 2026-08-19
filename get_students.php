<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$stmt = $pdo->prepare("SELECT id, first_name, last_name, subject, login FROM students WHERE teacher_id = ? ORDER BY created_at DESC");
$stmt->execute([$teacher_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));