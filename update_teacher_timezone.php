<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$timezone = trim($_POST['timezone'] ?? '');

$valid_timezones = DateTimeZone::listIdentifiers();
if (!in_array($timezone, $valid_timezones)) {
    echo json_encode(['success' => false, 'error' => 'Некорректный часовой пояс']);
    exit;
}

$stmt = $pdo->prepare("UPDATE teachers SET timezone = ? WHERE id = ?");
$stmt->execute([$timezone, $teacher_id]);

$_SESSION['user']['timezone'] = $timezone;

echo json_encode(['success' => true]);