const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

const keywords = {
    новости: [
        'https://news.ycombinator.com/',
        'https://www.bbc.com/news',
    ],
    технологии: [
        'https://techcrunch.com/',
        'https://www.theverge.com/',
    ],
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/get-urls', (req, res) => {
    const { keyword } = req.body;

    if (keywords[keyword]) {
        res.json({ urls: keywords[keyword] });
    } else {
        res.status(404).json({ error: 'Ключевое слово не найдено' });
    }
});

app.post('/download', async (req, res) => {
    const { url } = req.body;

    try {
        const response = await axios.get(url, { responseType: 'stream' });

        const totalSize = response.headers['content-length'];
        let downloaded = 0;

        res.writeHead(200, { 'Content-Type': 'text/plain' });

        response.data.on('data', (chunk) => {
            downloaded += chunk.length;
            const progress = ((downloaded / totalSize) * 100).toFixed(2);
            res.write(`Progress: ${progress}%\n`);
        });

        response.data.on('end', () => {
            res.end('Download complete!');
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при скачивании контента' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
