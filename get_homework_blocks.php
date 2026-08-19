<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$student_id = (int)($_GET['student_id'] ?? 0);
$category_id = $_GET['category_id'] ?? null;

if ($category_id === 'all') {
    // Все блоки, включая без категории
    $stmt = $pdo->prepare("SELECT id, name, category_id FROM homework_blocks WHERE teacher_id = ? AND student_id = ? ORDER BY sort_order ASC");
    $stmt->execute([$teacher_id, $student_id]);
} elseif ($category_id === 'none' || $category_id === '') {
    // Только без категории
    $stmt = $pdo->prepare("SELECT id, name, category_id FROM homework_blocks WHERE teacher_id = ? AND student_id = ? AND category_id IS NULL ORDER BY sort_order ASC");
    $stmt->execute([$teacher_id, $student_id]);
} else {
    // Конкретная категория
    $stmt = $pdo->prepare("SELECT id, name, category_id FROM homework_blocks WHERE teacher_id = ? AND student_id = ? AND category_id = ? ORDER BY sort_order ASC");
    $stmt->execute([$teacher_id, $student_id, (int)$category_id]);
}
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));