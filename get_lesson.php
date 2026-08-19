<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(null);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$student_id = $_GET['student_id'] ?? 0;
$date = $_GET['date'] ?? '';
$timezone = $_GET['timezone'] ?? 'Europe/Moscow';

$stmt = $pdo->prepare("SELECT id, lesson_date, time, topic, comment, recording_link, payment_status FROM lessons WHERE teacher_id = ? AND student_id = ? AND lesson_date = ?");
$stmt->execute([$teacher_id, $student_id, $date]);
$lesson = $stmt->fetch(PDO::FETCH_ASSOC);

if ($lesson && $lesson['time']) {
    $lesson['time'] = convertTimeForResponse($lesson['time'], $timezone);
}
echo json_encode($lesson);

function convertTimeForResponse($timeStr, $targetTimezone) {
    if (!$timeStr) return null;
    try {
        $date = new DateTime("2024-01-01 $timeStr", new DateTimeZone('Europe/Moscow'));
        $date->setTimezone(new DateTimeZone($targetTimezone));
        return $date->format('H:i');
    } catch (Exception $e) {
        return $timeStr;
    }
}