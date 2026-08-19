<?php
session_start();
date_default_timezone_set('Europe/Moscow');
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login    = trim($_POST['login'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $plan     = $_POST['plan'] ?? 'basic';
    $agree    = $_POST['agree_privacy'] ?? '';

    // Разрешённые тарифы для выбора
    if (!in_array($plan, ['basic','pro'])) {
        $plan = 'basic';
    }

    // Проверка согласия с политикой конфиденциальности
    if (empty($agree)) {
        $error = 'Необходимо согласиться с политикой конфиденциальности';
    } elseif (empty($login) || empty($email) || empty($password)) {
        $error = 'Все поля обязательны';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Некорректный email';
    } elseif (strlen($password) < 6) {
        $error = 'Пароль должен содержать минимум 6 символов';
    } else {
        // Проверяем уникальность логина
        $stmt = $pdo->prepare("SELECT id FROM teachers WHERE login = ?");
        $stmt->execute([$login]);
        if ($stmt->fetch()) {
            $error = 'Логин уже занят';
        } else {
            // Проверяем уникальность email
            $stmt = $pdo->prepare("SELECT id FROM teachers WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $error = 'Email уже зарегистрирован';
            } else {
                $code = bin2hex(random_bytes(16));
                $hash = password_hash($password, PASSWORD_BCRYPT);
                $verification_expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
                $expires_at = date('Y-m-d H:i:s', strtotime('+7 days'));

                $stmt = $pdo->prepare(
                    "INSERT INTO teachers (login, password_hash, email, activated, plan, verification_code, verification_code_expires, expires_at)
                     VALUES (?, ?, ?, 0, ?, ?, ?, ?)"
                );
                $stmt->execute([$login, $hash, $email, $plan, $code, $verification_expires, $expires_at]);

                // Ссылка подтверждения
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                $host = $_SERVER['HTTP_HOST'];
                $link = "$protocol://$host/verify.php?code=$code";

                // Тема письма
                $subject = "Добро пожаловать в TeachForum!";

                // HTML-тело письма
                $body = '
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
                        .header { background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 30px 20px; text-align: center; color: white; }
                        .header h1 { margin: 0; font-size: 26px; }
                        .content { padding: 30px 25px; color: #333; line-height: 1.6; }
                        .btn { display: inline-block; margin: 20px 0; padding: 14px 32px; background: #7C3AED; color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; }
                        .btn:hover { background: #6D28D9; }
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
                            <h2>Здравствуйте!</h2>
                            <p>Вы зарегистрировались на платформе <strong>TeachForum</strong> — вашем помощнике в организации учебного процесса.</p>
                            <p>Для активации аккаунта нажмите кнопку ниже (действительно 1 час):</p>
                            <p style="text-align:center;">
                                <a href="' . $link . '" class="btn">Подтвердить email</a>
                            </p>
                            <p>Или скопируйте эту ссылку в адресную строку браузера:<br>
                                <a href="' . $link . '">' . $link . '</a>
                            </p>
                            <p>После подтверждения вы получите полный доступ к своему кабинету и 7 дней бесплатного использования выбранного тарифа.</p>
                            <p>Если вы не регистрировались на TeachForum, просто проигнорируйте это письмо.</p>
                        </div>
                        <div class="footer">
                            С уважением, команда TeachForum<br>
                            <a href="mailto:Teachforum@mail.ru">Teachforum@mail.ru</a> | 
                            <a href="https://' . $_SERVER['HTTP_HOST'] . '/privacy.php">Политика конфиденциальности</a>
                        </div>
                    </div>
                </body>
                </html>';

                if (sendEmail($email, $subject, $body)) {
                    $success = 'Письмо с подтверждением отправлено на вашу почту.';
                } else {
                    $stmt = $pdo->prepare("DELETE FROM teachers WHERE login = ?");
                    $stmt->execute([$login]);
                    $error = 'Не удалось отправить письмо. Попробуйте позже.';
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Регистрация — TeachForum</title>
    <link rel="stylesheet" href="css/style2.css">
</head>
<body>
    <div class="card" style="max-width:450px; margin:80px auto; padding:24px;">
        <h2>Регистрация</h2>
        <p style="text-align:center; color: var(--text-secondary); margin-bottom:16px;">
            Пробный период — 7 дней бесплатно на любом тарифе
        </p>
        <?php if ($error): ?>
            <p style="color:red;"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        <?php if ($success): ?>
            <p style="color:green;"><?= htmlspecialchars($success) ?></p>
            <p style="text-align:center;"><a href="index.php">← На главную</a></p>
        <?php else: ?>
        <form method="post">
            <div class="form-group">
                <label class="form-label">Логин</label>
                <input type="text" name="login" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" name="email" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">Пароль (минимум 6 символов)</label>
                <input type="password" name="password" class="form-input" required minlength="6">
            </div>

            <!-- Выбор тарифа -->
            <div class="form-group">
                <label class="form-label">Тариф</label>
                <div id="planSelector" style="display:flex; gap:12px; margin-top:8px;">
                    <label class="plan-option active" data-plan="pro" style="flex:1; display:block; border:2px solid var(--primary); border-radius:12px; padding:12px; cursor:pointer; text-align:center; background:var(--primary-light);">
                        <div style="font-weight:600;">Профессиональный</div>
                        <div style="font-size:13px; color:var(--text-secondary);">₽499/мес</div>
                    </label>
                </div>
                <input type="hidden" name="plan" id="planInput" value="pro">
            </div>

            <!-- Чекбокс согласия с политикой -->
            <div class="form-group">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" name="agree_privacy" value="1" required>
                    <span style="font-size:14px;">Я согласен с <a href="privacy.php" target="_blank">политикой конфиденциальности</a></span>
                </label>
            </div>

            <button type="submit" class="btn btn--primary btn--full">Зарегистрироваться</button>
        </form>
        <p style="text-align:center; margin-top:12px;"><a href="index.php">← На главную</a></p>
        <?php endif; ?>
    </div>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const options = document.querySelectorAll('.plan-option');
        const planInput = document.getElementById('planInput');
        options.forEach(opt => {
            opt.addEventListener('click', function() {
                options.forEach(o => {
                    o.classList.remove('active');
                    o.style.borderColor = 'var(--border)';
                    o.style.background = 'white';
                });
                this.classList.add('active');
                this.style.borderColor = 'var(--primary)';
                this.style.background = 'var(--primary-light)';
                planInput.value = this.getAttribute('data-plan');
            });
        });
    });
    </script>
</body>
</html>