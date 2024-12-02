document.getElementById('search').addEventListener('click', async () => {
    const keyword = document.getElementById('keyword').value;
    const urlsDiv = document.getElementById('urls');
    const progressDiv = document.getElementById('progress');

    urlsDiv.innerHTML = '';
    progressDiv.innerHTML = '';

    try {
        const response = await fetch('/get-urls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword }),
        });

        if (!response.ok) throw new Error('Ключевое слово не найдено');

        const { urls } = await response.json();
        urlsDiv.innerHTML = '<h2>Доступные URL:</h2>';
        urls.forEach((url, index) => {
            const button = document.createElement('button');
            button.textContent = `Скачать (${index + 1})`;
            button.onclick = () => downloadContent(url);
            urlsDiv.appendChild(document.createElement('p')).textContent = url;
            urlsDiv.appendChild(button);
        });
    } catch (error) {
        urlsDiv.textContent = error.message;
    }
});

async function downloadContent(url) {
    const progressDiv = document.getElementById('progress');
    progressDiv.textContent = 'Загрузка...';

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            content += decoder.decode(value, { stream: true });
            progressDiv.textContent = content;
        }

        localStorage.setItem(url, content);
        progressDiv.innerHTML += '<p>Контент сохранен в LocalStorage!</p>';
    } catch (error) {
        progressDiv.textContent = 'Ошибка загрузки контента.';
    }
}
