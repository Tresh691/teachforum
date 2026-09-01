<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$student_id = (int)($_GET['student_id'] ?? 0);

if ($student_id > 0) {
    // Проверка принадлежности ученика
    $stmt = $pdo->prepare("SELECT id FROM students WHERE id = ? AND teacher_id = ?");
    $stmt->execute([$student_id, $teacher_id]);
    if (!$stmt->fetch()) {
        echo json_encode(['error' => 'Ученик не найден']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT id, exam_name, subject, exam_date, score FROM exam_results WHERE teacher_id = ? AND student_id = ? ORDER BY exam_date DESC");
    $stmt->execute([$teacher_id, $student_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    // Возвращаем всех учеников с количеством пробников и средним баллом (для списка)
    $stmt = $pdo->prepare("
        SELECT s.id, s.first_name, s.last_name, 
               COUNT(er.id) AS exams_count,
               AVG(er.score) AS avg_score
        FROM students s
        LEFT JOIN exam_results er ON er.student_id = s.id AND er.teacher_id = s.teacher_id
        WHERE s.teacher_id = ?
        GROUP BY s.id
        ORDER BY s.first_name, s.last_name
    ");
    $stmt->execute([$teacher_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}