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
hbs.registerHelper("getUserDetails", (data, opt) => {
    for (var i = 0; i < jsonUsers.length; i++)
        if (data === jsonUsers[i].id)
            return opt.fn(jsonUsers[i]);
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

var jsonUsers = [
    {id: 1, username: 'migq', password: 'hehehe', name: 'Miguel Quiambao'},
    {id: 2, username: 'ernestogo', password: 'hahaha', name: 'Ernie Go'},
    {id: 3, username: 'mBONG', password: 'hihihi', name: 'Mitchell Ong'}
];

var jsonArray = [
    {title: 'Is This Loss???', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/sample.jpg', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: 'I did it to...', user: 2, likes: 1000, dislikes: 123, post: 'img/uploads/Wut.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'zelda', 'wut']}, 
    
    {title: 'Executioner', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/WiiGuy.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'wii', 'games']}, 
    
    {title: 'Vacuum invention', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/Vaccum.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'yes', 'wow', 'lewd']}, 
    
    {title: 'Suicide Prevention', user: 2, likes: 9001, dislikes: 123, post: 'img/uploads/suicideprevention.png', 
    tags: ['wut', 'death', 'suicide', 'murder', 'crime']}, 
    
    {title: 'Where did you come form?', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/Pokemonspeech.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'yes', 'games']}, 
    
    {title: 'Overclocked', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/Overclocked.png', 
    tags: ['comedy', 'hahahaha', 'lol']}, 
    
    {title: 'Ourainum', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/Ouranium.png', 
    tags: ['comedy', 'hahahaha', 'lol']},
    
    {title: 'Not a cop', user: 2, likes: 9001, dislikes: 123, post: 'img/uploads/Notacop.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'crime']}, 
    
    {title: 'Civilization players will know this', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/MAXTECH.png', 
    tags: ['wut', 'civ', 'lol', 'games']}, 
    
    {title: 'Lets a go', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/LetsGo.png',
    tags: ['comedy', 'hahahaha', 'lol', 'mario']},
    
    {title: 'IT interview', user: 2, likes: 9001, dislikes: 123, post: 'img/uploads/ITInterview.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'wow']}, 
    
    {title: 'Half-life', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/HalfLife.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'facebook', 'games']}, 
    
    {title: 'CS-GO', user: 1, likes: 9001, dislikes: 123, post: 'img/uploads/CSGO.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'wut', 'games']}, 
    
    {title: 'Cake', user: 2, likes: 9001, dislikes: 123, post: 'img/uploads/cake.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'wut']}, 
    
    {title: 'Babies', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/Babypowder.png', 
    tags: ['comedy', 'hahahaha', 'lol', 'lewd', 'yes']}, 
    
    {title: 'Emiya', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/emiya.jpg', 
    tags: ['comedy', 'hahahaha', 'lol', 'anime', 'wut']}, 
    
    {title: 'Boy Scouts', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads/boy.jpg', 
    tags: ['comedy', 'hahahaha', 'lol', 'yes', 'savage']}, 
    
    {title: 'Ded', user: 3, likes: 9001, dislikes: 123, post: 'img/uploads//ded.jpg', 
    tags: ['comedy', 'hahahaha', 'lol', 'murder', 'crime', 'suicide']}, 
]

app.get('/', urlencoded, (req, res) => {
    var account = null;
    if (req.session.id)
        account = getUser(req.session.id);

    res.render("index.hbs", {
        account: account,
        post: jsonArray
    });
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
    let body = req.body;

    var meme = {
        'title': body.memeName,
        'tags': body.memeTags.split(' '),
        'user': 1,
        'file': data.path,
        'likes': 0,
        'dislikes': 0,
    }

    jsonArray.push(meme);

    res.sendStatus(200);
});

app.get('/account', urlencoded, (req, res) => {
    res.render('account.hbs');
});

app.get('/tag/:tag', (req, res) => {
    let tag = req.params.tag;
    res.render('index.hbs', {
        post: filterTags(tag)
    });
});

app.get('/search', (req, res) => {
    let query = req.query.q;
})

app.use('*', urlencoded, (req, res) => {
    res.render('errors/404.hbs');
});

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

function filterTags (tag) {
    var posts = [];

    for (var i = 0; i < jsonArray.length; i++)
        if (jsonArray[i].tags.indexOf(tag) != -1)
            posts.push(jsonArray[i]);

    return posts;
}