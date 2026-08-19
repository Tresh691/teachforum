<?php
session_start();
require_once __DIR__ . '/config.php';

// Если пользователь уже в сессии — сразу в кабинет
if (!empty($_SESSION['user'])) {
    if ($_SESSION['user']['role'] === 'teacher') {
        header('Location: teacher.php');
        exit;
    } elseif ($_SESSION['user']['role'] === 'student') {
        header('Location: student.php');
        exit;
    }
}

// Если сессии нет, но есть кука "remember_token"
if (empty($_SESSION['user']) && isset($_COOKIE['remember_token'])) {
    // Проверяем учителей
    $stmt = $pdo->prepare("SELECT id, login FROM teachers WHERE remember_token = ?");
    $stmt->execute([$_COOKIE['remember_token']]);
    $teacher = $stmt->fetch();
    if ($teacher) {
        $_SESSION['user'] = [
            'id'    => $teacher['id'],
            'login' => $teacher['login'],
            'role'  => 'teacher'
        ];
        // Ротация токена
        $newToken = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare("UPDATE teachers SET remember_token = ? WHERE id = ?");
        $stmt->execute([$newToken, $teacher['id']]);
        setcookie('remember_token', $newToken, time() + 60*60*24*30, '/', '', false, true);
        header('Location: teacher.php');
        exit;
    }

    // Проверяем учеников
    $stmt = $pdo->prepare("SELECT id, login, first_name, last_name FROM students WHERE remember_token = ?");
    $stmt->execute([$_COOKIE['remember_token']]);
    $student = $stmt->fetch();
    if ($student) {
        $_SESSION['user'] = [
            'id'    => $student['id'],
            'login' => $student['login'],
            'name'  => $student['first_name'] . ' ' . ($student['last_name'] ?? ''),
            'role'  => 'student'
        ];
        $newToken = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare("UPDATE students SET remember_token = ? WHERE id = ?");
        $stmt->execute([$newToken, $student['id']]);
        setcookie('remember_token', $newToken, time() + 60*60*24*30, '/', '', false, true);
        header('Location: student.php');
        exit;
    }
}
// Если ничего не подошло — показываем главную страницу (HTML ниже)
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="TeachForum — платформа для репетиторов. Расписание, домашние задания, библиотека, учёт оплат. Всё для продуктивных занятий.">
    <meta name="keywords" content="репетитор, платформа для репетитора, расписание, домашние задания, личный кабинет ученика, учёт оплат, TeachForum, тичфорум, теачфорум, теучфорум">
    <title>TeachForum — платформа для репетиторов</title>
    <link rel="stylesheet" href="css/style2.css">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>
    <header class="header">
        <div class="container header__inner">
            <a href="#" class="logo">
                <svg class="logo__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                TeachForum
            </a>
            <nav class="nav">
                <a href="#features" class="nav__link">Возможности</a>
                <a href="#how" class="nav__link">Как работает</a>
                <a href="#pricing" class="nav__link">Тарифы</a>
                <a href="#reviews" class="nav__link">Отзывы</a>
                <a href="#faq" class="nav__link">FAQ</a>
            </nav>
            <button class="btn btn--primary" id="openLoginBtn">Войти</button>
        </div>
    </header>

    <main>
        <!-- Hero -->
        <section class="hero">
            <div class="container">
                <h1 class="hero__title">Образование на новом уровне</h1>
                <p class="hero__subtitle">Расписание, домашки, оплаты и материалы — всё в одной платформе, без лишних заморочек</p>
                <button class="btn btn--white btn--lg" id="heroLoginBtn">Попробовать бесплатно</button>
                <div class="hero__illustration">
                    <div class="hero__mockup">
                        <div class="mockup__dots"><span></span><span></span><span></span></div>
                        <div class="mockup__line"></div>
                        <div class="mockup__line short"></div>
                        <div class="mockup__card"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Возможности -->
        <section id="features" class="section">
            <div class="container">
                <h2 class="section__title">Что внутри</h2>
                <div class="features-grid">
                    <div class="feature-card" data-animate>
                        <div class="feature-card__icon">📅</div>
                        <h3 class="feature-card__title">Расписание и календарь</h3>
                        <p class="feature-card__text">Уроки всегда перед глазами. Добавляйте, редактируйте, следите за статусами оплат. Смотрите по дням, неделям или на целый месяц вперёд.</p>
                    </div>
                    <div class="feature-card" data-animate>
                        <div class="feature-card__icon">📝</div>
                        <h3 class="feature-card__title">Домашние задания</h3>
                        <p class="feature-card__text">Создавайте задания сами или берите из библиотеки. Разложите всё по темам и сразу видно, что задано, а что уже выполнено.</p>
                    </div>
                    <div class="feature-card" data-animate>
                        <div class="feature-card__icon">📚</div>
                        <h3 class="feature-card__title">Библиотека заданий</h3>
                        <p class="feature-card__text">Храните типовые задания, чтобы не набирать заново. Назначайте целые блоки сразу нескольким ученикам.</p>
                    </div>
                    <div class="feature-card" data-animate>
                        <div class="feature-card__icon">📎</div>
                        <h3 class="feature-card__title">Файлы и материалы</h3>
                        <p class="feature-card__text">К урокам и лекциям можно прикрепить PDF, картинки, документы. Ученики скачивают в один клик.</p>
                    </div>
                    <div class="feature-card" data-animate>
                        <div class="feature-card__icon">💰</div>
                        <h3 class="feature-card__title">Учёт оплат</h3>
                        <p class="feature-card__text">Отмечайте, оплачен урок или нет. За месяц видно общую картину — ничего не потеряется.</p>
                    </div>
                    <div class="feature-card" data-animate>
                        <div class="feature-card__icon">📌</div>
                        <h3 class="feature-card__title">Свои разделы</h3>
                        <p class="feature-card__text">Создавайте персональные разделы в боковом меню под разные предметы или группы. Порядок на ваших условиях.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Как работает -->
        <section id="how" class="section section--alt">
            <div class="container">
                <h2 class="section__title">Три шага, чтобы начать</h2>
                <div class="steps">
                    <div class="step" data-animate>
                        <div class="step__number">1</div>
                        <h4>Регистрируетесь</h4>
                        <p>Создайте аккаунт учителя за минуту. Подтвердите email — и вы в кабинете.</p>
                    </div>
                    <div class="step" data-animate>
                        <div class="step__number">2</div>
                        <h4>Добавляете учеников</h4>
                        <p>Создайте профили, настройте часовые пояса и предметы.</p>
                    </div>
                    <div class="step" data-animate>
                        <div class="step__number">3</div>
                        <h4>Ведёте занятия</h4>
                        <p>Заполняйте календарь, выдавайте домашки, загружайте материалы. Ученики всё видят в своём кабинете.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Тарифы -->
        <section id="pricing" class="section">
            <div class="container">
                <h2 class="section__title">Тариф</h2>
                <p class="pricing-subtitle">Пробный период — 7 дней бесплатно</p>

                <div class="pricing-grid">
                    <!-- Месяц -->
                    <div class="pricing-card" data-animate>
                        <h3>Месяц</h3>
                        <div class="price">399 ₽</div>
                        <p style="color: var(--text-secondary);">в месяц</p>
                        <ul>
                            <li>Неограниченное число учеников</li>
                            <li>Лекции, шпоры, библиотека заданий</li>
                            <li>Записи уроков и файлы</li>
                        </ul>
                        <a href="contact.html"><button class="btn btn--outline btn--full">Начать бесплатно</button></a>
                    </div>
                    <!-- Полгода -->
                    <div class="pricing-card pricing-card--popular" data-animate>
                        <span class="popular-badge">Выгодно</span>
                        <h3>Полгода</h3>
                        <div class="price">349 ₽</div>
                        <p style="color: var(--text-secondary);">в месяц</p>
                        <ul>
                            <li>Неограниченное число учеников</li>
                            <li>Лекции, шпоры, библиотека заданий</li>
                            <li>Записи уроков и файлы</li>
                            <li>Скидка 10%</li>
                        </ul>
                        <a href="contact.html"><button class="btn btn--white btn--full">Выбрать</button></a>
                    </div>
                    <!-- Год -->
                    <div class="pricing-card" data-animate>
                        <h3>Год</h3>
                        <div class="price">299 ₽</div>
                        <p style="color: var(--text-secondary);">в месяц</p>
                        <ul>
                            <li>Неограниченное число учеников</li>
                            <li>Лекции, шпоры, библиотека заданий</li>
                            <li>Записи уроков и файлы</li>
                            <li>Скидка 20%</li>
                        </ul>
                        <a href="contact.html"><button class="btn btn--outline btn--full">Выбрать</button></a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Отзывы -->
        <section id="reviews" class="section section--alt">
            <div class="container">
                <h2 class="section__title">Отзывы</h2>
                <div class="reviews-carousel" id="reviewsCarousel">
                    <div class="reviews-track" id="reviewsTrack">
                        <!-- 15 отзывов живым языком -->
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Всё расписание перед глазами, ученикам очень удобно."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #0D7C3D, #A3E635);">Н</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Наталья К.</div>
                                    <small>Репетитор математики</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Наконец-то нашёл, где хранить материалы и задания. Рекомендую!"</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #A3E635, #0D7C3D);">С</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Сергей Л.</div>
                                    <small>Преподаватель английского</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Интуитивно понятный интерфейс и всё нужное в одном месте."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #0D7C3D, #A3E635);">Е</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Елена В.</div>
                                    <small>Репетитор физики</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Больше не нужно сто заметок в телефоне, всё в одном месте."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #A3E635, #0D7C3D);">М</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Марина П.</div>
                                    <small>Репетитор химии</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Библиотека заданий — просто огонь. Назначаю целый блок за пару кликов."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #0D7C3D, #A3E635);">А</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Алексей Д.</div>
                                    <small>Репетитор информатики</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Учёт оплат — просто спасение. Раньше путался, теперь всё чётко."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #A3E635, #0D7C3D);">В</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Виктор С.</div>
                                    <small>Репетитор истории</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Ученики довольны, что видят расписание и могут скачать файлы."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #0D7C3D, #A3E635);">К</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Карина М.</div>
                                    <small>Репетитор английского</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Создаю свои разделы под разные группы — очень гибко."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #A3E635, #0D7C3D);">Д</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Дмитрий Ф.</div>
                                    <small>Репетитор физики</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Интерфейс простой, разобрался за 5 минут."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #0D7C3D, #A3E635);">О</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Ольга Н.</div>
                                    <small>Репетитор обществознания</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Пользуюсь уже месяц — всё работает стабильно."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #A3E635, #0D7C3D);">Р</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Руслан Г.</div>
                                    <small>Репетитор математики</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Советую коллегам, удобно следить за оплатами."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #0D7C3D, #A3E635);">Ю</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Юлия В.</div>
                                    <small>Репетитор биологии</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Нравится, что можно прикреплять файлы к урокам."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #A3E635, #0D7C3D);">И</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Игорь П.</div>
                                    <small>Репетитор географии</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Платформа развивается, приятно пользоваться."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #0D7C3D, #A3E635);">Т</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Татьяна С.</div>
                                    <small>Репетитор литературы</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"До этого вёл таблицы, теперь всё в одном окне."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #A3E635, #0D7C3D);">Б</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Борис К.</div>
                                    <small>Репетитор химии</small>
                                </div>
                            </div>
                        </div>
                        <div class="review-card">
                            <div class="review-card__stars">★★★★★</div>
                            <p>"Поддержка отвечает быстро, платформа растёт."</p>
                            <div class="review-card__author-block">
                                <div class="review-card__avatar" style="background: linear-gradient(135deg, #0D7C3D, #A3E635);">Л</div>
                                <div class="review-card__author-info">
                                    <div class="review-card__author">Лариса Е.</div>
                                    <small>Репетитор начальных классов</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ (расширенный) -->
        <section id="faq" class="section">
            <div class="container">
                <h2 class="section__title">Часто спрашивают</h2>
                <div class="faq-list">
                    <div class="faq-item">
                        <button class="faq-question">Как добавить ученика?</button>
                        <div class="faq-answer">В личном кабинете перейдите в раздел «Ученики» и нажмите «Добавить ученика». Система сгенерирует логин и пароль.</div>
                    </div>
                    <div class="faq-item">
                        <button class="faq-question">Могут ли ученики сами регистрироваться?</button>
                        <div class="faq-answer">Нет, регистрация учеников происходит только через преподавателя, что обеспечивает безопасность.</div>
                    </div>
                    <div class="faq-item">
                        <button class="faq-question">Как восстановить пароль?</button>
                        <div class="faq-answer">На странице входа нажмите «Забыли пароль?» и введите email. Мы пришлём ссылку для восстановления.</div>
                    </div>
                    <div class="faq-item">
                        <button class="faq-question">Как изменить тариф?</button>
                        <div class="faq-answer">Напишите нам через форму обратной связи или на почту, и мы поменяем тариф вручную.</div>
                    </div>
                    <div class="faq-item">
                        <button class="faq-question">Есть ли ограничения по количеству учеников?</button>
                        <div class="faq-answer">На профессиональном тарифе количество учеников не ограничено. Вы можете добавить столько, сколько нужно.</div>
                    </div>
                    <div class="faq-item">
                        <button class="faq-question">Можно ли загружать свои файлы?</button>
                        <div class="faq-answer">Да, к урокам и лекциям можно прикреплять PDF, картинки и другие файлы, а ученики смогут их скачать.</div>
                    </div>
                    <div class="faq-item">
                        <button class="faq-question">Как следить за оплатами?</button>
                        <div class="faq-answer">В карточке каждого урока есть статус оплаты. Вы можете переключать его вручную и видеть сводку за месяц.</div>
                    </div>
                    <div class="faq-item">
                        <button class="faq-question">Как создать свою структуру разделов?</button>
                        <div class="faq-answer">В настройках меню (кнопка ⚙️) можно добавить кастомные разделы и настроить, какие ученики их видят.</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="cta section">
            <div class="container" style="text-align:center;">
                <h2>Готовы начать?</h2>
                <p style="margin-bottom:24px;">Присоединяйтесь к преподавателям, которые уже управляют своими занятиями через TeachForum.</p>
                <button class="btn btn--primary btn--lg" id="ctaLoginBtn">Войти в систему</button>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p class="footer__text">© 2026 TeachForum · <a href="contact.html" class="footer__link">teachforum@mail.ru</a> · <a href="privacy.php" class="footer__link">Политика конфиденциальности</a></p>
        </div>
    </footer>

    <!-- Модальное окно входа -->
    <div class="modal-overlay" id="loginModal">
        <div class="modal">
            <button class="modal__close" id="closeModalBtn">&times;</button>
            <h2 class="modal__title">Вход в TeachForum</h2>
            <div id="loginError" style="color: red; display: none; margin-bottom: 12px;"></div>
            <div style="display: flex; margin-bottom: 20px; background: #F3F4F6; border-radius: 10px; padding: 4px;">
                <button type="button" id="roleTeacherBtn" class="role-switch-btn active"
                        style="flex:1; padding: 10px 16px; border: none; background: white; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    🧑‍🏫 Я учитель
                </button>
                <button type="button" id="roleStudentBtn" class="role-switch-btn"
                        style="flex:1; padding: 10px 16px; border: none; background: transparent; border-radius: 8px; font-weight: 500; cursor: pointer; transition: 0.2s;">
                    🎓 Я ученик
                </button>
            </div>
            <div id="studentHint" style="display: none; background: #FEF3C7; padding: 10px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #92400E;">
                💡 Ваш аккаунт должен создать преподаватель. Если вы ученик, обратитесь к своему преподавателю для получения логина и пароля.
            </div>
            <form class="login-form" id="loginForm" action="login.php" method="POST">
                <input type="hidden" name="role" id="loginRole" value="teacher">
                <div class="form-group">
                    <label for="username" class="form-label">Логин или Email</label>
                    <input type="text" id="username" name="login" class="form-input" placeholder="Введите логин или email" required>
                </div>
                <div class="form-group">
                    <label for="password" class="form-label">Пароль</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" class="form-input" placeholder="Введите пароль" required>
                        <button type="button" class="password-toggle" id="togglePassword" aria-label="Показать пароль">👁️</button>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <input type="checkbox" id="rememberMe" name="remember_me" value="1" checked>
                    <label for="rememberMe" style="font-size: 14px; color: var(--text-secondary); cursor: pointer;">Запомнить меня</label>
                </div>
                <button type="submit" class="btn btn--primary btn--full">Войти</button>
                <div style="text-align: center; margin-top: 12px;">
                    <a href="forgot.php" style="font-size: 14px; color: var(--text-secondary);">Забыли пароль?</a>
                </div>
                <div style="text-align: center; margin-top: 8px;">
                    <span style="font-size: 14px; color: var(--text-secondary);">Нет аккаунта?</span>
                    <a href="register.php" style="font-size: 14px; color: var(--primary); margin-left: 4px;">Зарегистрироваться</a>
                </div>
                <p style="font-size:12px; text-align:center; margin-top:8px;">
                    Нажимая «Войти», вы соглашаетесь с нашей <a href="privacy.php" target="_blank">политикой конфиденциальности</a>
                </p>
            </form>
        </div>
    </div>

    <script src="js/script2.js"></script>
</body>
</html>