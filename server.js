const express = require('express');
const path = require('path');
const mongo = require('./classes/mongo');

const app = express();

// INITIALIZE
const eh = new mongo();
eh.connect();
app.use(express.static(path.join(__dirname, 'static')));
app.listen(3000);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/errors/404.html'));
});