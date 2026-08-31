<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(null);
    exit;
}
require_once __DIR__ . '/config.php';

$student_id = (int)$_SESSION['user']['id'];
$id = (int)($_GET['id'] ?? 0);
$timezone = $_GET['timezone'] ?? 'Europe/Moscow';

// Ищем урок, где ученик либо основной, либо участник
$stmt = $pdo->prepare("
    SELECT l.id, l.lesson_date, l.time, l.topic, l.comment, l.recording_link, l.payment_status
    FROM lessons l
    LEFT JOIN lesson_students ls ON l.id = ls.lesson_id
    WHERE l.id = ?
      AND (l.student_id = ? OR ls.student_id = ?)
    GROUP BY l.id
    LIMIT 1
");
$stmt->execute([$id, $student_id, $student_id]);
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