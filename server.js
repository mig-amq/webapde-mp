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
app.use(session({
    name: "user-session",
    resave: true,
    saveUninitialized: true,
    secret: "top secret"
}))

// Start server
app.listen(process.env.PORT || 3000);

app.get('/', urlencoded, (req, res) => {
    var account;
    if (req.session.id)
        account = getUser(req.session.id);

    res.render('index.hbs', {account: account});
});

app.post('/login', urlencoded, (req, res) => {
    var user;

    if (user = userExists(req.body.uname, req.body.pass)) {
        req.session.id = user.id;
    }

    res.redirect('/');
});

app.post('/logout', urlencoded, (req, res) => {
    req.session.destroy((err) => {
        if(err) console.log(err);
    });

    res.redirect('/');
});

app.post('/register', multiform.any(), (req, res) => {

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
    {id: 1, username: 'migq', password: 'hehehe', name: 'Miguel Quiambao', photo : 'img/upload/sample_profile.jpg'},
    {id: 2, username: 'ernestogo', password: 'hahaha', name: 'Ernie Go', photo: 'img/upload/sample_profile.jpg'},
    {id: 3, username: 'mBONG', password: 'hihihi', name: 'Mitchell Ong', photo: 'img/upload/sample_profile.jpg'}
];

var jsonArray = [
    {title: 'Is This Loss???', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/sample.jpg', 
    tags: ['comedy', 'hahahaha', 'lol']},
    {}
]

function userExists (username, password) {
    var user;

    for (let i = 0; i < jsonUsers.length; i++) {
        if (username === jsonUsers[i].username) {
            user = jsonUsers[i];
            break;
        }
    }

    if (user != null && user.password === password) {
        return user;
    }

    return null;
}

function getUser(id) {
    for (let i = 0; i < jsonUsers.length; i++) {
        if (jsonUsers[i].id === id)
            return jsonUsers[i];
    }

    return null;
}

function getUser(id) {

}