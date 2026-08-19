<?php
$file = __DIR__ . '/js/teacher.js';
$content = file_get_contents($file);

// Удаляем BOM (UTF-8)
if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
    $content = substr($content, 3);
}

// Удаляем все непечатные символы в начале файла (если остались)
$content = ltrim($content);

file_put_contents($file, $content);
echo "Файл teacher.js очищен. Обнови страницу кабинета.";