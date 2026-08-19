<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(null);
    exit;
}
require_once __DIR__ . '/config.php';
$student_id = $_SESSION['user']['id'];
$id = $_GET['id'] ?? 0;
$timezone = $_GET['timezone'] ?? 'Europe/Moscow';

$stmt = $pdo->prepare("SELECT id, lesson_date, time, topic, comment, recording_link, payment_status FROM lessons WHERE id = ? AND student_id = ?");
$stmt->execute([$id, $student_id]);
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