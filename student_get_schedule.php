<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';
$student_id = $_SESSION['user']['id'];
$year  = (int)($_GET['year'] ?? date('Y'));
$month = (int)($_GET['month'] ?? date('m'));
$timezone = $_GET['timezone'] ?? 'Europe/Moscow';

$stmt = $pdo->prepare("SELECT id, lesson_date, time, topic, comment, recording_link, payment_status FROM lessons WHERE student_id = ? AND YEAR(lesson_date) = ? AND MONTH(lesson_date) = ? ORDER BY lesson_date, time");
$stmt->execute([$student_id, $year, $month]);
$lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Конвертируем время
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