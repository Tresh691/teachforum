<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$type = $_GET['type'] ?? 'lecture';
$section_id = $_GET['section_id'] ?? null;

$sql = "SELECT id, name, section_id FROM blocks WHERE teacher_id = ? AND type = ?";
$params = [$teacher_id, $type];

if ($section_id !== null && $section_id !== '') {
    $sql .= " AND section_id = ?";
    $params[] = (int)$section_id;
} else {
    $sql .= " ORDER BY sort_order ASC";
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));