<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}

require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$date = trim($_POST['date'] ?? '');
$time = trim($_POST['time'] ?? '');
$topic = trim($_POST['topic'] ?? '');
$teacher_timezone = $_POST['teacher_timezone'] ?? 'Europe/Moscow';

// Определяем список учеников
$student_ids = [];

if (!empty($_POST['student_ids'])) {
    // Если пришёл JSON массив
    $decoded = json_decode($_POST['student_ids'], true);
    if (is_array($decoded)) {
        $student_ids = array_map('intval', $decoded);
    } else {
        // Если пришёл через запятую
        $student_ids = array_filter(array_map('intval', explode(',', $_POST['student_ids'])));
    }
} elseif (!empty($_POST['student_id'])) {
    $student_ids = [(int)$_POST['student_id']];
}

if (empty($student_ids)) {
    http_response_code(400);
    echo json_encode(['error' => 'Не выбран ни один ученик']);
    exit;
}

if (!$date || !$time) {
    http_response_code(400);
    echo json_encode(['error' => 'Дата и время обязательны']);
    exit;
}

// Конвертация времени в московское
if ($teacher_timezone !== 'Europe/Moscow') {
    try {
        $dt = new DateTime("2024-01-01 $time", new DateTimeZone($teacher_timezone));
        $dt->setTimezone(new DateTimeZone('Europe/Moscow'));
        $time = $dt->format('H:i');
    } catch (Exception $e) {}
}

// Проверяем, что все ученики принадлежат учителю
$placeholders = implode(',', array_fill(0, count($student_ids), '?'));
$stmt = $pdo->prepare("SELECT id FROM students WHERE id IN ($placeholders) AND teacher_id = ?");
$params = array_merge($student_ids, [$teacher_id]);
$stmt->execute($params);
$allowed_students = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (count($allowed_students) !== count(array_unique($student_ids))) {
    http_response_code(403);
    echo json_encode(['error' => 'Один или несколько учеников не найдены']);
    exit;
}

// Создаём урок, student_id = первый (основной)
$main_student_id = $student_ids[0];
$stmt = $pdo->prepare("INSERT INTO lessons (teacher_id, student_id, lesson_date, time, topic) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$teacher_id, $main_student_id, $date, $time, $topic]);
$lesson_id = $pdo->lastInsertId();

// Добавляем всех участников в lesson_students
$insertStmt = $pdo->prepare("INSERT INTO lesson_students (lesson_id, student_id) VALUES (?, ?)");
foreach ($student_ids as $sid) {
    $insertStmt->execute([$lesson_id, $sid]);
}

echo json_encode(['success' => true, 'lesson_id' => $lesson_id]);