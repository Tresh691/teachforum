<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$lesson_id = (int)($_POST['lesson_id'] ?? 0);
$student_id = (int)($_POST['student_id'] ?? 0);
$status = $_POST['status'] ?? 'none';

if ($lesson_id <= 0 || $student_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Неверные параметры']);
    exit;
}

// Проверяем, что урок принадлежит учителю и ученик в нём участвует
$stmt = $pdo->prepare("SELECT l.id FROM lessons l WHERE l.id = ? AND l.teacher_id = ?");
$stmt->execute([$lesson_id, $teacher_id]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Урок не найден']);
    exit;
}

$stmt = $pdo->prepare("UPDATE lesson_students SET payment_status = ? WHERE lesson_id = ? AND student_id = ?");
$stmt->execute([$status, $lesson_id, $student_id]);

// Пересчитываем общий статус урока (для совместимости с подсветками)
$stmt = $pdo->prepare("SELECT payment_status FROM lesson_students WHERE lesson_id = ?");
$stmt->execute([$lesson_id]);
$statuses = $stmt->fetchAll(PDO::FETCH_COLUMN);

$overall = 'none';
if (in_array('unpaid', $statuses)) $overall = 'unpaid';
elseif (in_array('pending', $statuses)) $overall = 'pending';
elseif (count(array_unique($statuses)) === 1 && $statuses[0] === 'paid') $overall = 'paid';

$stmt = $pdo->prepare("UPDATE lessons SET payment_status = ? WHERE id = ?");
$stmt->execute([$overall, $lesson_id]);

echo json_encode(['success' => true, 'overall_status' => $overall]);