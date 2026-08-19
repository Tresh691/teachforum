<?php
// mailer.php — отправка писем (локально — логирование, продакшен — SMTP Mail.ru)

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendEmail($to, $subject, $body) {
    // Локальный сервер — просто логируем письмо и возвращаем успех
    if ($_SERVER['SERVER_NAME'] === 'teachboard.local') {
        $log = "=== Новое письмо ===\n";
        $log .= "Кому: $to\n";
        $log .= "Тема: $subject\n";
        $log .= "Тело:\n$body\n\n";
        file_put_contents(__DIR__ . '/mail_log.txt', $log, FILE_APPEND);
        return true;
    }

    // Продакшен — SMTP Mail.ru
    require_once __DIR__ . '/PHPMailer/Exception.php';
    require_once __DIR__ . '/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/PHPMailer/SMTP.php';

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.mail.ru';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'teachforum@mail.ru';          // твой ящик
        $mail->Password   = 'QRBDo9IGlQddhl0sEVpg';    // твой пароль приложения
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        $mail->CharSet    = 'UTF-8';

        // === ВКЛЮЧАЕМ HTML-ПИСЬМА ===
        $mail->isHTML(true);
        $mail->Body    = $body;
        // Текстовый вариант для почтовых клиентов, не поддерживающих HTML
        $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $body));

        $mail->setFrom('teachforum@mail.ru', 'TeachForum');
        $mail->addAddress($to);
        $mail->Subject = $subject;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Mail error: " . $mail->ErrorInfo);
        return false;
    }
}