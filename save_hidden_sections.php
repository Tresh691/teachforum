<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$hidden_sections = trim($_POST['hidden_sections'] ?? '');

$decoded = json_decode($hidden_sections, true);
if (!is_array($decoded)) {
    $decoded = [];
}

$allowed = ['lectures', 'cheatsheets'];
$decoded = array_values(array_intersect($decoded, $allowed));

$stmt = $pdo->prepare("UPDATE teachers SET hidden_sections = ? WHERE id = ?");
$stmt->execute([json_encode($decoded), $teacher_id]);

$_SESSION['user']['hidden_sections'] = $decoded;

echo json_encode(['success' => true]);