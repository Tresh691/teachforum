<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$timezone   = $_GET['timezone'] ?? 'Europe/Moscow';   // ← новый параметр

if (isset($_GET['start_date']) && isset($_GET['end_date'])) {
    $start = $_GET['start_date'];
    $end   = $_GET['end_date'];
    $stmt  = $pdo->prepare("
        SELECT l.id, l.lesson_date, l.time, l.topic, l.comment, l.recording_link, l.payment_status,
               s.first_name, s.last_name, s.id AS student_id
        FROM lessons l
        JOIN students s ON l.student_id = s.id
        WHERE l.teacher_id = ? AND l.lesson_date BETWEEN ? AND ?
        ORDER BY l.lesson_date ASC, l.time ASC
    ");
    $stmt->execute([$teacher_id, $start, $end]);
} else {
    $date  = $_GET['date'] ?? date('Y-m-d');
    $stmt  = $pdo->prepare("
        SELECT l.id, l.lesson_date, l.time, l.topic, l.comment, l.recording_link, l.payment_status,
               s.first_name, s.last_name, s.id AS student_id
        FROM lessons l
        JOIN students s ON l.student_id = s.id
        WHERE l.teacher_id = ? AND l.lesson_date = ?
        ORDER BY l.time ASC
    ");
    $stmt->execute([$teacher_id, $date]);
}

$lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Конвертируем время каждого урока в часовой пояс учителя
foreach ($lessons as &$lesson) {
    if ($lesson['time']) {
        $lesson['time'] = convertTimeForResponse($lesson['time'], $timezone);
    }
}
unset($lesson);

echo json_encode($lessons);

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