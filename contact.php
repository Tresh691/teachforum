<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

// --------------------------------------------------
// 1. Проверяем, что запрос отправлен методом POST
// --------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Неверный метод запроса']);
    exit;
}

// --------------------------------------------------
// 2. Простейшая защита от спама (скрытое поле)
// --------------------------------------------------
if (!empty($_POST['website'])) {
    echo json_encode(['success' => false, 'message' => 'Спам-запрос отклонён']);
    exit;
}

// --------------------------------------------------
// 3. Получаем и очищаем данные из формы
// --------------------------------------------------
$name    = trim(strip_tags($_POST['name'] ?? ''));
$email   = trim(strip_tags($_POST['email'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));

// --------------------------------------------------
// 4. Валидация
// --------------------------------------------------
$errors = [];
if (empty($name)) {
    $errors[] = 'Имя обязательно';
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Введите корректный email';
}
if (empty($message)) {
    $errors[] = 'Сообщение не может быть пустым';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
    exit;
}

// --------------------------------------------------
// 5. Подготовка письма
// --------------------------------------------------
$to      = 'teachforum@mail.ru';                // Кому отправляем
$subject = 'Сообщение из формы обратной связи TeachBoard';
$body    = "Имя: $name\nEmail: $email\n\nСообщение:\n$message";

// --------------------------------------------------
// 6. Отправка через SMTP Яндекса с помощью PHPMailer
// --------------------------------------------------
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

$mail = new PHPMailer(true);

try {
    // Настройки SMTP-сервера Яндекса
    $mail->isSMTP();
    $mail->Host       = 'smtp.mail.ru';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'teacher-sender691@mail.ru';       // ← Замените на ваш реальный ящик на Яндексе
    $mail->Password   = 'BHYZtsJ5IpQR38RKiWjM';    // ← Пароль приложения (не обычный пароль!)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Используем SSL
    $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    // Отправитель (должен совпадать с Username)
    $mail->setFrom('teacher-sender691@mail.ru', 'TeachBoard');
    // Указываем, кому отвечать (на адрес пользователя, заполнившего форму)
    $mail->addReplyTo($email, $name);

    // Получатель
    $mail->addAddress($to);

    // Тема и тело письма
    $mail->Subject = $subject;
    $mail->Body    = $body;

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Сообщение отправлено! Мы свяжемся с вами в ближайшее время.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка отправки: ' . $mail->ErrorInfo]);
}