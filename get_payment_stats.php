<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$year = (int)($_GET['year'] ?? date('Y'));

// Инициализация месяцев
$months = [];
for ($m = 1; $m <= 12; $m++) {
    $months[$m] = ['paid' => 0, 'unpaid' => 0, 'pending' => 0];
}

$stmt = $pdo->prepare("
    SELECT l.lesson_date, ls.payment_status, s.rate
    FROM lessons l
    JOIN lesson_students ls ON l.id = ls.lesson_id
    JOIN students s ON ls.student_id = s.id
    WHERE l.teacher_id = ? AND YEAR(l.lesson_date) = ?
");
$stmt->execute([$teacher_id, $year]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($rows as $row) {
    $month = (int)date('m', strtotime($row['lesson_date']));
    $status = $row['payment_status'];
    if ($status === 'paid') $months[$month]['paid'] += (int)$row['rate'];
    elseif ($status === 'unpaid') $months[$month]['unpaid'] += (int)$row['rate'];
    elseif ($status === 'pending') $months[$month]['pending'] += (int)$row['rate'];
}

// Готовим ответ
$result = [];
$total = ['paid' => 0, 'unpaid' => 0, 'pending' => 0];
foreach ($months as $m => $sums) {
    $result[] = [
        'month' => $m,
        'paid' => $sums['paid'],
        'unpaid' => $sums['unpaid'],
        'pending' => $sums['pending']
    ];
    $total['paid'] += $sums['paid'];
    $total['unpaid'] += $sums['unpaid'];
    $total['pending'] += $sums['pending'];
}

echo json_encode(['months' => $result, 'total' => $total]);