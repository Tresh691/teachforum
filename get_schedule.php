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

// Получаем все уроки, в которых участвует ученик (как основной или как участник группы)
$stmt = $pdo->prepare("
    SELECT l.id, l.lesson_date, l.time, l.topic, l.comment, l.recording_link, l.payment_status,
           l.student_id AS main_student_id
    FROM lessons l
    LEFT JOIN lesson_students ls ON l.id = ls.lesson_id
    WHERE l.teacher_id = ?
      AND (ls.student_id = ? OR l.student_id = ?)
      AND YEAR(l.lesson_date) = ? AND MONTH(l.lesson_date) = ?
    GROUP BY l.id
    ORDER BY l.lesson_date, l.time
");
$stmt->execute([$teacher_id, $student_id, $student_id, $year, $month]);
$lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($lessons as &$lesson) {
    // Конвертация времени
    if ($lesson['time']) {
        try {
            $date = new DateTime("2024-01-01 {$lesson['time']}", new DateTimeZone('Europe/Moscow'));
            $date->setTimezone(new DateTimeZone($timezone));
            $lesson['time'] = $date->format('H:i');
        } catch (Exception $e) {}
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
        // Если записей в lesson_students нет (на случай старых данных), используем основного ученика
        $stmt = $pdo->prepare("
            SELECT id AS student_id, payment_status, first_name, last_name, rate
            FROM students
            WHERE id = ?
        ");
        $stmt->execute([$lesson['main_student_id']]);
        $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Устанавливаем payment_status из урока для совместимости
        foreach ($participants as &$p) {
            $p['payment_status'] = $lesson['payment_status'];
        }
        unset($p);
    }

    $lesson['students'] = $participants;
}
unset($lesson);

echo json_encode($lessons);