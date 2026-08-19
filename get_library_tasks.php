<?php
require_once __DIR__ . '/check_plan.php';
require_once __DIR__ . '/config.php';
$teacher_id = $_SESSION['user']['id'];

// 1 запрос: все разделы учителя
$sections = $pdo->query("SELECT id, name, sort_order FROM library_sections WHERE teacher_id = $teacher_id ORDER BY sort_order ASC")->fetchAll(PDO::FETCH_ASSOC);

// 2 запрос: все блоки (сразу для всех разделов + без раздела)
$blocks = $pdo->query("SELECT id, name, section_id, sort_order FROM library_blocks WHERE teacher_id = $teacher_id ORDER BY sort_order ASC")->fetchAll(PDO::FETCH_ASSOC);

// 3 запрос: все задания для всех блоков
$blockIds = array_column($blocks, 'id');
$tasks = [];
if (!empty($blockIds)) {
    $ids = implode(',', $blockIds);
    $tasks = $pdo->query("SELECT id, block_id, title, text, links, sort_order FROM library_tasks WHERE block_id IN ($ids) ORDER BY sort_order ASC")->fetchAll(PDO::FETCH_ASSOC);
}

// Группируем задания по блокам
$tasksByBlock = [];
foreach ($tasks as $task) {
    $tasksByBlock[$task['block_id']][] = $task;
}

// Привязываем задания к блокам
foreach ($blocks as &$block) {
    $block['tasks'] = $tasksByBlock[$block['id']] ?? [];
}
unset($block);

// Распределяем блоки по разделам + негруппированные
$sectionsWithBlocks = [];
$ungroupedBlocks = [];
foreach ($blocks as $block) {
    if ($block['section_id'] !== null) {
        $sectionsWithBlocks[$block['section_id']][] = $block;
    } else {
        $ungroupedBlocks[] = $block;
    }
}
foreach ($sections as &$section) {
    $section['blocks'] = $sectionsWithBlocks[$section['id']] ?? [];
}
unset($section);

// 4 запрос: задания без блока
$ungroupedTasks = $pdo->query("SELECT id, title, text, links FROM library_tasks WHERE block_id IS NULL AND (teacher_id = $teacher_id OR teacher_id IS NULL) ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'sections' => $sections,
    'ungrouped_blocks' => $ungroupedBlocks,
    'ungrouped_tasks' => $ungroupedTasks
]);