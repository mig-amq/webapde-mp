const express = require('express');
const path = require('path');
const mongo = require('./classes/mongo');
const hbs = require('hbs');
const bps = require('body-parser');
const multer = require('multer');

var memeStorage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, path.join(__dirname, 'pages/public/img/uploads/')) },
    filename : (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname))}
});

const multiform = multer({storage: memeStorage});
const app = express();
const urlencoded = bps.urlencoded({
    extended: false
});

hbs.registerPartials(path.join(__dirname, 'pages/template'));
hbs.registerHelper("getContext", (data, opt) => {
    return opt.fn(JSON.parse(data));
});

// Initialize DB
(new mongo()).initialize();
app.set('view engine', 'html');
app.set('views', [path.join(__dirname, 'pages')]);
app.use(express.static(path.join(__dirname, 'pages/public')));

// Start server
app.listen(3000);

app.get('/', urlencoded, (req, res) => {
    res.render('index.hbs');
});

app.post('/upload', multiform.any(), (req, res) => {
    let data = req.file;
    console.log(data);
    res.sendStatus(200);
});

app.get('/account', urlencoded, (req, res) => {
    res.render('account.hbs');
});

app.use('*', urlencoded, (req, res) => {
    res.sendStatus(404).render('errors/404.hbs');
});