<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$timezone   = $_GET['timezone'] ?? 'Europe/Moscow';

if (isset($_GET['start_date']) && isset($_GET['end_date'])) {
    $start = $_GET['start_date'];
    $end   = $_GET['end_date'];
    $stmt  = $pdo->prepare("
        SELECT l.id, l.lesson_date, l.time, l.topic, l.comment, l.recording_link, l.payment_status,
               s.first_name, s.last_name, s.id AS student_id, s.rate
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
               s.first_name, s.last_name, s.id AS student_id, s.rate
        FROM lessons l
        JOIN students s ON l.student_id = s.id
        WHERE l.teacher_id = ? AND l.lesson_date = ?
        ORDER BY l.time ASC
    ");
    $stmt->execute([$teacher_id, $date]);
}

$lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Для каждого урока получаем всех участников и их индивидуальные статусы
foreach ($lessons as &$lesson) {
    if ($lesson['time']) {
        $lesson['time'] = convertTimeForResponse($lesson['time'], $timezone);
    }
    $lesson['rate'] = (int)($lesson['rate'] ?? 0);

    $stmt = $pdo->prepare("
        SELECT ls.student_id, ls.payment_status, s.first_name, s.last_name, s.rate
        FROM lesson_students ls
        JOIN students s ON ls.student_id = s.id
        WHERE ls.lesson_id = ?
    ");
    $stmt->execute([$lesson['id']]);
    $lesson['students'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
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