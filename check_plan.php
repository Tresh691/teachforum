<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}

// Берем план из сессии
$plan = $_SESSION['user']['plan'] ?? 'basic';

// Если план basic, проверим в БД — может, админ уже повысил, а сессия старая
if ($plan === 'basic' && isset($_SESSION['user']['id'])) {
    require_once __DIR__ . '/config.php';
    $stmt = $pdo->prepare("SELECT plan FROM teachers WHERE id = ?");
    $stmt->execute([$_SESSION['user']['id']]);
    $dbPlan = $stmt->fetchColumn();
    if ($dbPlan && $dbPlan !== 'basic') {
        $plan = $dbPlan;
        $_SESSION['user']['plan'] = $dbPlan; // обновим сессию
    }
}

if ($plan === 'basic') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}