<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$student_id = (int)$_SESSION['user']['id'];
$year  = (int)($_GET['year'] ?? date('Y'));
$month = (int)($_GET['month'] ?? date('m'));
$timezone = $_GET['timezone'] ?? 'Europe/Moscow';

// Получаем все уроки, где ученик либо основной, либо участник группового урока
$stmt = $pdo->prepare("
    SELECT l.id, l.lesson_date, l.time, l.topic, l.comment, l.recording_link, l.payment_status
    FROM lessons l
    LEFT JOIN lesson_students ls ON l.id = ls.lesson_id
    WHERE (l.student_id = ? OR ls.student_id = ?)
      AND YEAR(l.lesson_date) = ? AND MONTH(l.lesson_date) = ?
    GROUP BY l.id
    ORDER BY l.lesson_date, l.time
");
$stmt->execute([$student_id, $student_id, $year, $month]);
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