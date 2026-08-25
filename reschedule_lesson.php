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
$id = (int)($_POST['id'] ?? 0);
$new_date = trim($_POST['new_date'] ?? '');
$new_time = trim($_POST['new_time'] ?? '');
$teacher_timezone = $_POST['teacher_timezone'] ?? 'Europe/Moscow';

if (!$id || !$new_date || !$new_time) {
    http_response_code(400);
    echo json_encode(['error' => 'Не переданы обязательные поля']);
    exit;
}

// Проверка формата даты
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $new_date)) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверный формат даты']);
    exit;
}

// Конвертация времени в московское, если нужно
if ($new_time && $teacher_timezone !== 'Europe/Moscow') {
    try {
        $dateTime = new DateTime("2024-01-01 $new_time", new DateTimeZone($teacher_timezone));
        $dateTime->setTimezone(new DateTimeZone('Europe/Moscow'));
        $new_time = $dateTime->format('H:i');
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный часовой пояс']);
        exit;
    }
}

$stmt = $pdo->prepare("UPDATE lessons SET lesson_date = ?, time = ? WHERE id = ? AND teacher_id = ?");
$stmt->execute([$new_date, $new_time, $id, $teacher_id]);

if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'Урок не найден или не был изменён']);
}