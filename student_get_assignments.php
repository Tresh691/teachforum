<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$student_id = $_SESSION['user']['id'];

// Персональные задания
$stmt = $pdo->prepare("SELECT id AS type_id, 'personal' AS source, title, text, topic, links, status FROM homeworks WHERE student_id = ?");
$stmt->execute([$student_id]);
$personal = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Назначенные из библиотеки
$stmt = $pdo->prepare("
    SELECT sa.id AS assignment_id, 'library' AS source, lt.title, lt.text, lt.topic, lt.links, sa.status
    FROM student_assignments sa
    JOIN library_tasks lt ON sa.library_task_id = lt.id
    WHERE sa.student_id = ?
");
$stmt->execute([$student_id]);
$library = $stmt->fetchAll(PDO::FETCH_ASSOC);

$all = array_merge($personal, $library);
echo json_encode($all);