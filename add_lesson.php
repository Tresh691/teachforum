<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$student_id = (int)($_POST['student_id'] ?? 0);
$date       = $_POST['date'] ?? '';
$time       = trim($_POST['time'] ?? '');
$topic      = trim($_POST['topic'] ?? '');
$teacher_timezone = $_POST['teacher_timezone'] ?? 'Europe/Moscow';

if ($time === '' || $topic === '') {
    echo json_encode(['success' => false, 'error' => 'Время и тема обязательны']);
    exit;
}

// Если передан часовой пояс учителя, конвертируем время в московское
if ($teacher_timezone !== 'Europe/Moscow') {
    try {
        $dateTime = new DateTime("2024-01-01 $time", new DateTimeZone($teacher_timezone));
        $dateTime->setTimezone(new DateTimeZone('Europe/Moscow'));
        $time = $dateTime->format('H:i');
    } catch (Exception $e) {
        // оставляем как есть при ошибке
    }
}

$stmt = $pdo->prepare("INSERT INTO lessons (teacher_id, student_id, lesson_date, time, topic) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$teacher_id, $student_id, $date, $time, $topic]);

echo json_encode(['success' => true]);