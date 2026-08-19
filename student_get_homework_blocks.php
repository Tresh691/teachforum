<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$student_id = $_SESSION['user']['id'];
$category_id = $_GET['category_id'] ?? null;

if ($category_id === 'all' || $category_id === null) {
    // Все блоки ученика
    $stmt = $pdo->prepare("SELECT id, name, category_id FROM homework_blocks WHERE student_id = ? ORDER BY sort_order ASC");
    $stmt->execute([$student_id]);
} elseif ($category_id === 'none') {
    // Без категории
    $stmt = $pdo->prepare("SELECT id, name, category_id FROM homework_blocks WHERE student_id = ? AND category_id IS NULL ORDER BY sort_order ASC");
    $stmt->execute([$student_id]);
} else {
    // Конкретная категория
    $stmt = $pdo->prepare("SELECT id, name, category_id FROM homework_blocks WHERE student_id = ? AND category_id = ? ORDER BY sort_order ASC");
    $stmt->execute([$student_id, (int)$category_id]);
}
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));