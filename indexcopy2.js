const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Kullanıcı verisi için basit bir veritabanı simülasyonu
let users = [];

// Middleware'ler
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
//app.use(bodyParser.json())

/* app.use(function (req, res, next) {
  res.setHeader('Content-Type', 'application/json')
    next()
}) */
app.set('view engine', 'ejs');

// Ana sayfa
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/list-users', (req, res) => {
    return res.send(JSON.stringify(users));
});

app.get('/register', (req, res) => {
    res.render('register');
});

// Kayıt işlemi
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const user={ username, email, password };
    users.push(user);
 //   return res.send(`Kayıt işlemi başarılı! Kullanıcı adı: ${user.username}, e-posta: ${user.email}`);
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// Giriş işlemi
app.post('/login', (req, res) => {
    const { email, password } = req.body;
   // const user = users.find(u => u.email === email && u.password === password);
   let user;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
            user = users[i];
            break;
        }
    }

    if (user) {
        res.send(`Hoş geldiniz, ${user.username}!`);
    } else {
        res.send('Geçersiz kullanıcı adı veya şifre.');
    }
});

// Konferanslar için basit bir veritabanı simülasyonu
let conferences = [];

// Konferans oluşturma sayfası
app.get('/create-conference', (req, res) => {
    res.render('create-conference');
});

// Konferans oluşturma işlemi
app.post('/create-conference', (req, res) => {
    const { title, description, venue, date } = req.body;
    conferences.push({ title, description, venue, date });
    res.redirect('/conferences');
});

// Tüm konferansları listeleme
app.get('/conferences', (req, res) => {
    res.render('conferences', { conferences });
});


// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
