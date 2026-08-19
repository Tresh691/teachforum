<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];
$id = $_POST['id'] ?? 0;
$stmt = $pdo->prepare("DELETE FROM library_tasks WHERE id=? AND (teacher_id=? OR teacher_id IS NULL)");
$stmt->execute([$id, $teacher_id]);
echo json_encode(['success' => true]);