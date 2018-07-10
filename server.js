import express from 'express';
import path from 'path';

const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/errors/404.html'));
})