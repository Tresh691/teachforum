<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$student_id = (int)($_POST['student_id'] ?? 0);
$name = trim($_POST['name'] ?? '');
if ($name === '') {
    echo json_encode(['success' => false, 'error' => 'Введите название']);
    exit;
}
$stmt = $pdo->prepare("INSERT INTO homework_categories (teacher_id, student_id, name) VALUES (?, ?, ?)");
$stmt->execute([$teacher_id, $student_id, $name]);
echo json_encode(['success' => true, 'category_id' => $pdo->lastInsertId()]);