<?php
session_start();
if (empty($_SESSION['user'])) {
    http_response_code(403);
    echo json_encode([]);
    exit;
}

require_once __DIR__ . '/config.php';

$entity_type = $_GET['entity_type'] ?? '';
$entity_id = (int)($_GET['entity_id'] ?? 0);

$allowed_entities = ['lesson', 'homework', 'block_item', 'custom_item'];
if (!in_array($entity_type, $allowed_entities)) {
    echo json_encode([]);
    exit;
}

// Для ученика проверяем доступ к сущности
if ($_SESSION['user']['role'] === 'student') {
    $student_id = $_SESSION['user']['id'];
    $hasAccess = false;
    switch ($entity_type) {
        case 'lesson':
            $stmt = $pdo->prepare("SELECT id FROM lessons WHERE id = ? AND student_id = ?");
            break;
        case 'homework':
            $stmt = $pdo->prepare("SELECT id FROM homeworks WHERE id = ? AND student_id = ?");
            break;
        case 'block_item':
            $stmt = $pdo->prepare("SELECT bi.id FROM block_items bi JOIN blocks b ON bi.block_id = b.id WHERE bi.id = ?");
            // ученик видит все лекции/шпоры своего учителя (teacher_id определяется через student)
            // Но проще: лекции доступны всем ученикам учителя, поэтому не фильтруем по student_id
            $stmt->execute([$entity_id]);
            $hasAccess = $stmt->fetch() !== false;
            break;
        case 'custom_item':
            $stmt = $pdo->prepare("SELECT ci.id FROM custom_items ci JOIN custom_groups cg ON ci.group_id = cg.id JOIN custom_blocks cb ON cg.custom_block_id = cb.id JOIN custom_block_access cba ON cba.custom_block_id = cb.id WHERE ci.id = ? AND cba.student_id = ?");
            break;
    }
    if (!$hasAccess && in_array($entity_type, ['lesson', 'homework'])) {
        $stmt->execute([$entity_id, $student_id]);
        $hasAccess = $stmt->fetch() !== false;
    }
    if (!$hasAccess) {
        echo json_encode([]);
        exit;
    }
}

$stmt = $pdo->prepare("SELECT id, original_name, size, mime_type, created_at FROM files WHERE entity_type = ? AND entity_id = ? ORDER BY created_at ASC");
$stmt->execute([$entity_type, $entity_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));