const express = require('express');
const path = require('path');
const mongo = require('./classes/mongo');
const hbs = require('hbs');
const bps = require('body-parser');
const multer = require('multer');
const session = require('express-session');

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
// (new mongo()).initialize();

// Initialize Handlebars
app.set('view engine', 'html');
app.set('views', [path.join(__dirname, 'pages')]);

// Initialize settings
app.use(express.static(path.join(__dirname, 'pages/public')));
// app.use(session({
//     name: "user-session",
//     resave: true,
//     saveUninitialized: true,
//     secret: "top secret"
// }))
// Start server
app.listen(process.env.PORT || 3000);

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

app.get('/tag/:tag', (req, res) => {
    let tag = req.params.tag;
});

app.get('/search', (req, res) => {
    let query = req.query.q;
})

app.use('*', urlencoded, (req, res) => {
    res.render('errors/404.hbs');
});

var jsonUsers = [
    {id: 1, username: 'migq', password: 'hehehe', name: 'Miguel Quiambao'},
    {id: 2, username: 'ernestogo', password: 'hahaha', name: 'Ernie Go'},
    {id: 3, username: 'mBONG', password: 'hihihi', name: 'Mitchell Ong'}
];

var jsonArray = [
    {title: 'Is This Loss???', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/sample.jpg', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 2, likes: 1000, dislikes: 123, post: 'img/uploads/Wut.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/Wii Guy.png, 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/Vaccum.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 2, likes: 9001, dislikes: 123, post: 'img/uploads/suicide prevention.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/Pokemon speech.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/Overclocked.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/Ouranium.png', 
    tags: ['comedy', 'hahahaha', 'lol']},
    
    {title: '', user: 2, likes: 9001, dislikes: 123, post: 'img/uploads/Not a cop.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/MAX TECH.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/Lets Go.png', 
    tags: ['comedy', 'hahahaha', 'lol']},
    
    {title: '', user: 2, likes: 9001, dislikes: 123, post: 'img/uploads/IT Interview.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/Half Life.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/CSGOpng', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 2, likes: 9001, dislikes: 123, post: 'img/uploads/sample.cake.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: '', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/sample.Baby powder.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
]