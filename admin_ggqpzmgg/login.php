<?php
session_start();
if (isset($_SESSION['admin'])) {
    header('Location: index.php');
    exit;
}
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit;
}
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_POST['login'] === 'admin' && $_POST['password'] === 'admin') {
        $_SESSION['admin'] = true;
        header('Location: index.php');
        exit;
    } else {
        $error = 'Неверный логин или пароль';
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Админка</title>
    <link rel="stylesheet" href="../css/style2.css">
</head>
<body>
    <div class="card" style="max-width: 400px; margin: 80px auto; padding: 24px;">
        <h2>Вход</h2>
        <?php if ($error) echo "<p style='color:red'>$error</p>"; ?>
        <form method="POST">
            <label>Логин</label><br>
            <input type="text" name="login" required class="form-input"><br><br>
            <label>Пароль</label><br>
            <input type="password" name="password" required class="form-input"><br><br>
            <button type="submit" class="btn btn--primary">Войти</button>
        </form>
    </div>
</body>
</html>