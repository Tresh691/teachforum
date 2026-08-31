<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$student_id = $_SESSION['user']['id'];

// Получаем teacher_id ученика
$stmt = $pdo->prepare("SELECT teacher_id FROM students WHERE id = ?");
$stmt->execute([$student_id]);
$teacher_id = $stmt->fetchColumn();

if (!$teacher_id) {
    echo json_encode([]);
    exit;
}

// Получаем разделы учителя, в которых есть блоки, доступные ученику
$stmt = $pdo->prepare("
    SELECT ls.id, ls.name
    FROM lecture_sections ls
    JOIN blocks b ON b.section_id = ls.id AND b.type = 'lecture'
    JOIN block_access ba ON ba.block_id = b.id AND ba.student_id = ?
    WHERE ls.teacher_id = ?
    GROUP BY ls.id
    ORDER BY ls.sort_order, ls.id
");
$stmt->execute([$student_id, $teacher_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));