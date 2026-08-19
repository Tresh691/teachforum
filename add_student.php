<?php
session_start();
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

$teacher_id = $_SESSION['user']['id'];
$first_name = trim($_POST['first_name'] ?? '');
$last_name  = trim($_POST['last_name'] ?? '');
$email      = trim($_POST['email'] ?? '');

if ($first_name === '') {
    echo json_encode(['error' => 'Имя обязательно']);
    exit;
}

// Проверка лимита учеников для базового тарифа
$stmt = $pdo->prepare("SELECT plan FROM teachers WHERE id = ?");
$stmt->execute([$teacher_id]);
$plan = $stmt->fetchColumn();
if ($plan === 'basic') {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM students WHERE teacher_id = ?");
    $stmt->execute([$teacher_id]);
    $count = $stmt->fetchColumn();
    if ($count >= 5) {
        echo json_encode(['success' => false, 'error' => 'В базовом тарифе можно добавить не более 5 учеников. Повысьте тариф.']);
        exit;
    }
}

// Валидация email, если указан
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Некорректный email']);
    exit;
}

// Проверка уникальности email среди учеников этого учителя
if ($email !== '') {
    $stmt = $pdo->prepare("SELECT id FROM students WHERE teacher_id = ? AND email = ?");
    $stmt->execute([$teacher_id, $email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Ученик с таким email уже существует']);
        exit;
    }
}

// Генерация логина и пароля
$login = 'student_' . bin2hex(random_bytes(3));
$password = bin2hex(random_bytes(4));
$password_hash = password_hash($password, PASSWORD_BCRYPT);

// Добавление ученика с email (может быть NULL)
$stmt = $pdo->prepare("INSERT INTO students (teacher_id, first_name, last_name, email, login, password_hash) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$teacher_id, $first_name, $last_name, $email ?: null, $login, $password_hash]);

// Отправка письма, если email указан
if ($email) {
    $subject = "Ваши данные для входа в TeachForum";
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $link = "$protocol://$host/index.php";
    
    $body = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
            .container { max-width: 500px; margin: 30px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 30px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 26px; }
            .content { padding: 30px 25px; color: #333; line-height: 1.6; }
            .credentials { background: #f0f0ff; padding: 15px 20px; border-radius: 10px; margin: 20px 0; font-size: 16px; }
            .credentials strong { display: block; margin-bottom: 5px; }
            .btn { display: inline-block; margin: 20px 0; padding: 12px 30px; background: #7C3AED; color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: bold; }
            .footer { padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
            a { color: #7C3AED; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>TeachForum</h1>
            </div>
            <div class="content">
                <h2>Здравствуйте, '.htmlspecialchars($first_name).'!</h2>
                <p>Преподаватель создал для вас аккаунт на платформе <strong>TeachForum</strong>.</p>
                <p>Ваши данные для входа:</p>
                <div class="credentials">
                    <strong>Логин:</strong> '.$login.'<br>
                    <strong>Пароль:</strong> '.$password.'
                </div>
                <p>Войти можно здесь:</p>
                <p style="text-align:center;">
                    <a href="'.$link.'" class="btn">Перейти к входу</a>
                </p>
                <p>После входа вы увидите своё расписание, домашние задания и материалы.</p>
            </div>
            <div class="footer">
                С уважением, команда TeachForum<br>
                <a href="mailto:Teachforum@mail.ru">Teachforum@mail.ru</a>
            </div>
        </div>
    </body>
    </html>';
    
    sendEmail($email, $subject, $body);
}

echo json_encode(['success' => true, 'login' => $login, 'password' => $password]);