document.addEventListener('DOMContentLoaded', () => {
    // ======================
    // Модальное окно входа
    // ======================
    const modal = document.getElementById('loginModal');
    const openButtons = document.querySelectorAll('#openLoginBtn, #heroLoginBtn, #ctaLoginBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    openButtons.forEach(btn => btn.addEventListener('click', () => {
        modal.classList.add('active');
        const rememberCheckbox = document.getElementById('rememberMe');
        if (rememberCheckbox) rememberCheckbox.checked = true;
        if (passwordInput) passwordInput.value = '';
    }));

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Показать ошибку входа, если вернулись с ?error=...
    const urlParams = new URLSearchParams(window.location.search);
    const errorType = urlParams.get('error');
    if (errorType === 'invalid' || errorType === 'empty' || errorType === 'not_verified' || errorType === 'expired') {
        modal.classList.add('active');
        const errDiv = document.getElementById('loginError');
        if (errDiv) {
            errDiv.style.display = 'block';
            if (errorType === 'not_verified') {
                const email = urlParams.get('email');
                if (email) {
                    errDiv.innerHTML = `Email (${email}) не подтверждён. <a href="resend_verification.php?email=${encodeURIComponent(email)}" style="color: var(--primary); text-decoration: underline;">Отправить код повторно</a>`;
                } else {
                    errDiv.innerHTML = `Email не подтверждён. <a href="resend_verification.php" style="color: var(--primary); text-decoration: underline;">Отправить код повторно</a>`;
                }
            } else if (errorType === 'expired') {
                errDiv.innerHTML = `Срок действия доступа истёк. Для продления доступа <a href="contact.html" style="color: var(--primary); text-decoration: underline;">свяжитесь с администратором</a>.`;
            } else {
                errDiv.textContent = 'Неверный логин или пароль';
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) modal.classList.remove('active');
    });

    // ======================
    // Переключатель ролей
    // ======================
    const roleTeacherBtn = document.getElementById('roleTeacherBtn');
    const roleStudentBtn = document.getElementById('roleStudentBtn');
    const loginRoleInput = document.getElementById('loginRole');
    const studentHint = document.getElementById('studentHint');

    if (roleTeacherBtn && roleStudentBtn) {
        roleTeacherBtn.addEventListener('click', function() {
            roleTeacherBtn.classList.add('active');
            roleTeacherBtn.style.background = 'white';
            roleTeacherBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            roleTeacherBtn.style.fontWeight = '600';
            roleStudentBtn.classList.remove('active');
            roleStudentBtn.style.background = 'transparent';
            roleStudentBtn.style.boxShadow = 'none';
            roleStudentBtn.style.fontWeight = '500';
            loginRoleInput.value = 'teacher';
            studentHint.style.display = 'none';
        });

        roleStudentBtn.addEventListener('click', function() {
            roleStudentBtn.classList.add('active');
            roleStudentBtn.style.background = 'white';
            roleStudentBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            roleStudentBtn.style.fontWeight = '600';
            roleTeacherBtn.classList.remove('active');
            roleTeacherBtn.style.background = 'transparent';
            roleTeacherBtn.style.boxShadow = 'none';
            roleTeacherBtn.style.fontWeight = '500';
            loginRoleInput.value = 'student';
            studentHint.style.display = 'block';
        });
    }

    // ======================
    // FAQ аккордеон с анимацией и ограничением одного открытого
    // ======================
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');

            // Закрываем все
            document.querySelectorAll('.faq-item').forEach(el => {
                el.classList.remove('active');
                const answer = el.querySelector('.faq-answer');
                if (answer) {
                    answer.style.maxHeight = '0px';
                    answer.style.opacity = '0';
                }
            });

            // Если кликнутый не был активен — открываем его
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                if (answer) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.style.opacity = '1';
                }
            }
        });
    });

    // Устанавливаем начальные стили для анимации faq-answer
    document.querySelectorAll('.faq-answer').forEach(answer => {
        answer.style.maxHeight = '0px';
        answer.style.opacity = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.4s ease, opacity 0.3s ease';
    });

    // ======================
    // Плавная прокрутка для якорных ссылок
    // ======================
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ======================
    // Анимация появления при скролле
    // ======================
    const animatedElements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ======================
    // Карусель отзывов (бесконечная плавная прокрутка)
    // ======================
    const track = document.getElementById('reviewsTrack');
    if (track) {
        const cards = track.querySelectorAll('.review-card');
        let current = 0;
        const cardWidth = 324; // ширина карточки + gap (300 + 24)
        const totalCards = cards.length;

        // Клонируем карточки для бесконечности
        const cloneCount = 3; // сколько копий добавить в начало и конец
        for (let i = 0; i < cloneCount; i++) {
            const firstClone = cards[i % totalCards].cloneNode(true);
            const lastClone = cards[totalCards - 1 - (i % totalCards)].cloneNode(true);
            track.appendChild(firstClone);
            track.insertBefore(lastClone, cards[0]);
        }

        // Начальное смещение
        current = cloneCount;
        track.style.transform = `translateX(-${current * cardWidth}px)`;

        // Автопрокрутка каждые 3 секунды
        setInterval(() => {
            current++;
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(-${current * cardWidth}px)`;

            // Сброс в начало, когда дошли до клонированных карточек
            if (current >= totalCards + cloneCount) {
                setTimeout(() => {
                    track.style.transition = 'none';
                    current = cloneCount;
                    track.style.transform = `translateX(-${current * cardWidth}px)`;
                }, 500);
            }
        }, 3000);
    }
});