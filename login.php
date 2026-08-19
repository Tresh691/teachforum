<?php
session_start();
require_once __DIR__ . '/config.php';

$login    = trim($_POST['login'] ?? '');
$password = $_POST['password'] ?? '';
$role     = $_POST['role'] ?? 'teacher';

if ($login === '' || $password === '') {
    header('Location: index.php?error=empty');
    exit;
}

// === УЧЕНИК ===
if ($role === 'student') {
    $stmt = $pdo->prepare("SELECT id, login, password_hash, first_name, last_name, remember_token FROM students WHERE login = ?");
    $stmt->execute([$login]);
    $student = $stmt->fetch();

    if ($student && password_verify($password, $student['password_hash'])) {
        $_SESSION['user'] = [
            'id'    => $student['id'],
            'login' => $student['login'],
            'name'  => $student['first_name'] . ' ' . ($student['last_name'] ?? ''),
            'role'  => 'student'
        ];

        if (isset($_POST['remember_me'])) {
            $token = bin2hex(random_bytes(32));
            $stmt = $pdo->prepare("UPDATE students SET remember_token = ? WHERE id = ?");
            $stmt->execute([$token, $student['id']]);
            setcookie('remember_token', $token, time() + 60*60*24*30, '/', '', false, true);
        } else {
            $stmt = $pdo->prepare("UPDATE students SET remember_token = NULL WHERE id = ?");
            $stmt->execute([$student['id']]);
            setcookie('remember_token', '', time() - 3600, '/', '', false, true);
        }

        header('Location: student.php');
        exit;
    }
    header('Location: index.php?error=invalid');
    exit;
}

// === УЧИТЕЛЬ ===
$stmt = $pdo->prepare("SELECT id, login, password_hash, activated, email, email_verified, expires_at, remember_token, plan FROM teachers WHERE login = ? OR email = ?");
$stmt->execute([$login, $login]);
$teacher = $stmt->fetch();

if ($teacher && password_verify($password, $teacher['password_hash'])) {
    // Старый учитель без email → запросим email
    if (empty($teacher['email'])) {
        $_SESSION['user'] = [
            'id'    => $teacher['id'],
            'login' => $teacher['login'],
            'role'  => 'teacher',
            'plan'  => $teacher['plan'] ?? 'basic'
        ];
        header('Location: update_email.php');
        exit;
    }

    // Проверяем срок действия
    if (!empty($teacher['expires_at']) && strtotime($teacher['expires_at']) < time()) {
        $stmt = $pdo->prepare("UPDATE teachers SET activated = 0 WHERE id = ?");
        $stmt->execute([$teacher['id']]);
        $stmt = $pdo->prepare("UPDATE teachers SET remember_token = NULL WHERE id = ?");
        $stmt->execute([$teacher['id']]);
        setcookie('remember_token', '', time() - 3600, '/', '', false, true);
        header('Location: index.php?error=expired');
        exit;
    }

    // Проверяем активацию и подтверждение email
    if ($teacher['activated'] != 1 || $teacher['email_verified'] != 1) {
        $emailEncoded = urlencode($teacher['email'] ?? '');
        header("Location: index.php?error=not_verified&email=$emailEncoded");
        exit;
    }

    // Сохраняем сессию
    $_SESSION['user'] = [
        'id'    => $teacher['id'],
        'login' => $teacher['login'],
        'role'  => 'teacher',
        'plan'  => $teacher['plan'] ?? 'basic'
    ];

    // "Запомнить меня"
    if (isset($_POST['remember_me'])) {
        $token = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare("UPDATE teachers SET remember_token = ? WHERE id = ?");
        $stmt->execute([$token, $teacher['id']]);
        setcookie('remember_token', $token, time() + 60*60*24*30, '/', '', false, true);
    } else {
        $stmt = $pdo->prepare("UPDATE teachers SET remember_token = NULL WHERE id = ?");
        $stmt->execute([$teacher['id']]);
        setcookie('remember_token', '', time() - 3600, '/', '', false, true);
    }

    header('Location: teacher.php');
    exit;
}

// Неверный логин или пароль
header('Location: index.php?error=invalid');
exit;