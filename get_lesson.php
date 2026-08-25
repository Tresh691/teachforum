<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(null);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = (int)$_SESSION['user']['id'];
$student_id = (int)($_GET['student_id'] ?? 0);
$date = $_GET['date'] ?? '';
$timezone = $_GET['timezone'] ?? 'Europe/Moscow';

// Ищем урок, где ученик либо основной, либо участник группового урока
$stmt = $pdo->prepare("
    SELECT l.id, l.lesson_date, l.time, l.topic, l.comment, l.recording_link, l.payment_status,
           l.student_id AS main_student_id
    FROM lessons l
    LEFT JOIN lesson_students ls ON l.id = ls.lesson_id
    WHERE l.teacher_id = ?
      AND l.lesson_date = ?
      AND (l.student_id = ? OR ls.student_id = ?)
    GROUP BY l.id
    ORDER BY l.time ASC
    LIMIT 1
");
$stmt->execute([$teacher_id, $date, $student_id, $student_id]);
$lesson = $stmt->fetch(PDO::FETCH_ASSOC);

if ($lesson) {
    // Конвертация времени
    if ($lesson['time']) {
        $lesson['time'] = convertTimeForResponse($lesson['time'], $timezone);
    }

    // Получаем всех участников урока и их статусы
    $stmt = $pdo->prepare("
        SELECT ls.student_id, ls.payment_status, s.first_name, s.last_name, s.rate
        FROM lesson_students ls
        JOIN students s ON ls.student_id = s.id
        WHERE ls.lesson_id = ?
    ");
    $stmt->execute([$lesson['id']]);
    $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($participants)) {
        // Если записей в lesson_students нет, используем основного ученика
        $stmt = $pdo->prepare("
            SELECT id AS student_id, payment_status, first_name, last_name, rate
            FROM students
            WHERE id = ?
        ");
        $stmt->execute([$lesson['main_student_id']]);
        $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($participants as &$p) {
            $p['payment_status'] = $lesson['payment_status'];
        }
        unset($p);
    }

    $lesson['students'] = $participants;
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