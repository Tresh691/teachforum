<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$teacher_id = (int)$_SESSION['user']['id'];
$student_id = (int)($_GET['student_id'] ?? 0);
$month = (int)($_GET['month'] ?? date('m'));
$year = (int)($_GET['year'] ?? date('Y'));
$timezone = $_GET['timezone'] ?? 'Europe/Moscow';

$stmt = $pdo->prepare("
    SELECT id, lesson_date, time, topic, comment, recording_link, payment_status
    FROM lessons
    WHERE teacher_id = ? AND student_id = ? AND YEAR(lesson_date) = ? AND MONTH(lesson_date) = ?
    ORDER BY lesson_date, time
");
$stmt->execute([$teacher_id, $student_id, $year, $month]);
$lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($lessons as &$lesson) {
    if ($lesson['time']) {
        try {
            $date = new DateTime("2024-01-01 {$lesson['time']}", new DateTimeZone('Europe/Moscow'));
            $date->setTimezone(new DateTimeZone($timezone));
            $lesson['time'] = $date->format('H:i');
        } catch (Exception $e) {}
    }
}
unset($lesson);

echo json_encode($lessons);