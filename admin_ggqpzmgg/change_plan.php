<?php
session_start();
if (empty($_SESSION['admin'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../config.php';

$teacher_id = $_POST['teacher_id'] ?? 0;
$new_plan   = $_POST['plan'] ?? '';

if (!in_array($new_plan, ['basic','pro','team'])) {
    header('Location: index.php?error=invalid_plan');
    exit;
}

$stmt = $pdo->prepare("UPDATE teachers SET plan = ? WHERE id = ?");
$stmt->execute([$new_plan, $teacher_id]);

header('Location: index.php?plan_changed=1');
exit;