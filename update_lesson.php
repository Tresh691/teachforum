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
$time = trim($_POST['time'] ?? '');
$topic = trim($_POST['topic'] ?? '');
$comment = trim($_POST['comment'] ?? '');
$recording_link = trim($_POST['recording_link'] ?? '');
$payment_status = $_POST['payment_status'] ?? 'none';
$teacher_timezone = $_POST['teacher_timezone'] ?? 'Europe/Moscow';

// Конвертация в московское время, если нужно
if ($time && $teacher_timezone !== 'Europe/Moscow') {
    try {
        $dateTime = new DateTime("2024-01-01 $time", new DateTimeZone($teacher_timezone));
        $dateTime->setTimezone(new DateTimeZone('Europe/Moscow'));
        $time = $dateTime->format('H:i');
    } catch (Exception $e) {}
}

$stmt = $pdo->prepare("UPDATE lessons SET time = ?, topic = ?, comment = ?, recording_link = ?, payment_status = ? WHERE id = ? AND teacher_id = ?");
$stmt->execute([$time, $topic, $comment, $recording_link, $payment_status, $id, $teacher_id]);

echo json_encode(['success' => true]);