<?php
require_once __DIR__ . '/config.php';

$code = $_GET['code'] ?? '';
$error = '';
$success = '';

if (strlen($code) !== 32) {
    $error = 'Неверный код.';
} else {
    $stmt = $pdo->prepare("SELECT id FROM teachers WHERE verification_code = ? AND verification_code_expires > NOW()");
    $stmt->execute([$code]);
    $teacher = $stmt->fetch();

    if (!$teacher) {
        $error = 'Ссылка недействительна или устарела.';
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $password = $_POST['password'] ?? '';
        if (strlen($password) < 6) {
            $error = 'Пароль должен быть не менее 6 символов.';
        } else {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("UPDATE teachers SET password_hash = ?, verification_code = NULL, verification_code_expires = NULL WHERE id = ?");
            $stmt->execute([$hash, $teacher['id']]);
            $success = 'Пароль успешно изменён! Теперь вы можете <a href="index.php">войти</a>.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Новый пароль — TeachForum</title>
    <link rel="stylesheet" href="css/style2.css">
</head>
<body>
    <div class="card" style="max-width:400px; margin:80px auto; padding:24px;">
        <h2>Новый пароль</h2>
        <?php if ($error): ?>
            <p style="color:red;"><?= htmlspecialchars($error) ?></p>
            <p><a href="forgot.php">Запросить новую ссылку</a></p>
        <?php elseif ($success): ?>
            <p style="color:green;"><?= $success ?></p>
        <?php else: ?>
        <form method="post">
            <div class="form-group">
                <label class="form-label">Новый пароль (минимум 6 символов)</label>
                <input type="password" name="password" class="form-input" required minlength="6">
            </div>
            <button type="submit" class="btn btn--primary btn--full">Сохранить пароль</button>
        </form>
        <?php endif; ?>
        <p style="text-align:center; margin-top:12px;"><a href="index.php">← На главную</a></p>
    </div>
</body>
</html>