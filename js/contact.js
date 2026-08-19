document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const messageDiv = document.getElementById('formMessage');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Собираем данные
        const formData = new FormData(form);
        const data = new URLSearchParams(formData);

        // Показываем индикатор загрузки
        messageDiv.style.display = 'block';
        messageDiv.textContent = 'Отправка...';
        messageDiv.className = '';
        messageDiv.style.color = 'var(--text-secondary)';

        fetch('contact.php', {
            method: 'POST',
            body: data
        })
        .then(res => res.json())
        .then(response => {
            messageDiv.style.display = 'block';
            if (response.success) {
                messageDiv.textContent = '✅ ' + response.message;
                messageDiv.style.color = '#065F46';
                messageDiv.style.background = '#D1FAE5';
                messageDiv.style.padding = '12px';
                messageDiv.style.borderRadius = '8px';
                form.reset();
            } else {
                messageDiv.textContent = '❌ ' + response.message;
                messageDiv.style.color = '#991B1B';
                messageDiv.style.background = '#FEE2E2';
                messageDiv.style.padding = '12px';
                messageDiv.style.borderRadius = '8px';
            }
        })
        .catch(error => {
            messageDiv.style.display = 'block';
            messageDiv.textContent = '❌ Ошибка сети, попробуйте позже.';
            messageDiv.style.color = '#991B1B';
            messageDiv.style.background = '#FEE2E2';
            messageDiv.style.padding = '12px';
            messageDiv.style.borderRadius = '8px';
        });
    });
});