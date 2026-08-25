<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$id = (int)($_POST['id'] ?? 0);
$time = trim($_POST['time'] ?? '');
$topic = trim($_POST['topic'] ?? '');
$comment = trim($_POST['comment'] ?? '');
$recording_link = trim($_POST['recording_link'] ?? '');
$teacher_timezone = $_POST['teacher_timezone'] ?? 'Europe/Moscow';

// Конвертация времени
if ($time && $teacher_timezone !== 'Europe/Moscow') {
    try {
        $dt = new DateTime("2024-01-01 $time", new DateTimeZone($teacher_timezone));
        $dt->setTimezone(new DateTimeZone('Europe/Moscow'));
        $time = $dt->format('H:i');
    } catch (Exception $e) {}
}

// Обновляем основные поля урока
$stmt = $pdo->prepare("UPDATE lessons SET time = ?, topic = ?, comment = ?, recording_link = ? WHERE id = ? AND teacher_id = ?");
$stmt->execute([$time, $topic, $comment, $recording_link, $id, $teacher_id]);

// Обработка индивидуальных статусов
if (isset($_POST['student_payments'])) {
    $payments = json_decode($_POST['student_payments'], true);
    if (is_array($payments)) {
        $updateStmt = $pdo->prepare("UPDATE lesson_students SET payment_status = ? WHERE lesson_id = ? AND student_id = ?");
        $allStatuses = [];
        foreach ($payments as $sid => $status) {
            $sid = (int)$sid;
            $status = in_array($status, ['none','paid','unpaid','pending']) ? $status : 'none';
            $updateStmt->execute([$status, $id, $sid]);
            $allStatuses[] = $status;
        }
        // Обновляем общий payment_status в lessons для совместимости
        if (in_array('unpaid', $allStatuses)) {
            $overall = 'unpaid';
        } elseif (in_array('pending', $allStatuses)) {
            $overall = 'pending';
        } elseif (count(array_unique($allStatuses)) === 1 && $allStatuses[0] === 'paid') {
            $overall = 'paid';
        } elseif (empty($allStatuses)) {
            $overall = 'none';
        } else {
            // Если смешанные, ставим unpaid как самый проблемный
            $overall = 'unpaid';
        }
        $stmt = $pdo->prepare("UPDATE lessons SET payment_status = ? WHERE id = ?");
        $stmt->execute([$overall, $id]);
    }
}

echo json_encode(['success' => true]);