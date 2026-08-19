<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Доступ запрещён']);
    exit;
}

require_once __DIR__ . '/config.php';

$teacher_id = $_SESSION['user']['id'];
$entity_type = $_POST['entity_type'] ?? '';
$entity_id = (int)($_POST['entity_id'] ?? 0);

$allowed = ['lesson', 'homework', 'block_item', 'custom_item'];
if (!in_array($entity_type, $allowed)) {
    echo json_encode(['success' => false, 'error' => 'Недопустимый тип']);
    exit;
}

// Проверка, что сущность принадлежит учителю
switch ($entity_type) {
    case 'lesson':
        $stmt = $pdo->prepare("SELECT id FROM lessons WHERE id = ? AND teacher_id = ?");
        break;
    case 'homework':
        $stmt = $pdo->prepare("SELECT id FROM homeworks WHERE id = ? AND teacher_id = ?");
        break;
    case 'block_item':
        $stmt = $pdo->prepare(
            "SELECT bi.id FROM block_items bi
             JOIN blocks b ON bi.block_id = b.id
             WHERE bi.id = ? AND b.teacher_id = ?"
        );
        break;
    case 'custom_item':
        $stmt = $pdo->prepare(
            "SELECT ci.id FROM custom_items ci
             JOIN custom_groups cg ON ci.group_id = cg.id
             JOIN custom_blocks cb ON cg.custom_block_id = cb.id
             WHERE ci.id = ? AND cb.teacher_id = ?"
        );
        break;
}
$stmt->execute([$entity_id, $teacher_id]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Нет прав или сущность не найдена']);
    exit;
}

if (empty($_FILES['files'])) {
    echo json_encode(['success' => false, 'error' => 'Нет файлов']);
    exit;
}

// Нормализация: приводим к единому массиву загрузок
$normalizedFiles = [];
if (is_array($_FILES['files']['name'])) {
    foreach ($_FILES['files']['name'] as $i => $name) {
        $normalizedFiles[] = [
            'name'     => $name,
            'type'     => $_FILES['files']['type'][$i],
            'tmp_name' => $_FILES['files']['tmp_name'][$i],
            'error'    => $_FILES['files']['error'][$i],
            'size'     => $_FILES['files']['size'][$i],
        ];
    }
} else {
    $normalizedFiles[] = [
        'name'     => $_FILES['files']['name'],
        'type'     => $_FILES['files']['type'],
        'tmp_name' => $_FILES['files']['tmp_name'],
        'error'    => $_FILES['files']['error'],
        'size'     => $_FILES['files']['size'],
    ];
}

$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$maxSize = 50 * 1024 * 1024; // 50 МБ
$uploaded = [];

foreach ($normalizedFiles as $file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE   => 'Файл превышает допустимый размер сервера',
            UPLOAD_ERR_FORM_SIZE  => 'Файл превышает допустимый размер формы',
            UPLOAD_ERR_PARTIAL    => 'Файл загружен частично',
            UPLOAD_ERR_NO_FILE    => 'Файл не был загружен',
            UPLOAD_ERR_NO_TMP_DIR => 'Отсутствует временная папка',
            UPLOAD_ERR_CANT_WRITE => 'Ошибка записи файла на диск',
        ];
        $msg = $errorMessages[$file['error']] ?? 'Неизвестная ошибка';
        echo json_encode(['success' => false, 'error' => $msg . ' (' . $file['name'] . ')']);
        exit;
    }

    if ($file['size'] > $maxSize) {
        echo json_encode(['success' => false, 'error' => "Файл '{$file['name']}' слишком большой"]);
        exit;
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $storedName = bin2hex(random_bytes(16)) . '.' . $ext;
    $dest = $uploadDir . $storedName;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        echo json_encode(['success' => false, 'error' => "Не удалось сохранить '{$file['name']}'"]);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO files (teacher_id, entity_type, entity_id, original_name, stored_name, size, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $teacher_id,
        $entity_type,
        $entity_id,
        $file['name'],
        $storedName,
        $file['size'],
        $file['type']
    ]);

    $uploaded[] = [
        'id'            => (int)$pdo->lastInsertId(),
        'original_name' => $file['name'],
        'size'          => $file['size']
    ];
}

echo json_encode(['success' => true, 'files' => $uploaded]);