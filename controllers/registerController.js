const mysql = require('connection');
const user = require('User');
const User = require('../models/user');
const Reviewer = require('../models/reviewer');
// Kayıt sayfası
app.get('/register', (req, res) => {
    res.render('register');
});

// Kayıt işlemi
app.post('/register', (req, res) => {
    const { username, email, password, role, expertise } = req.body;
    
    let newUser =  new User(username, email, password, role, expertise);
    if(createuser(user) == 0){
        console.log('Yeni kullanıcı veritabanına eklendi.');
        if (role === 'reviewer') {
    let newUser =  new User(username, email, password, role, expertise);
            Reviewer.createReviewer(username, email,expertise)
        }
    }
    
    // Veritabanına sorguyu gönder
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Veritabanına kayıt eklenirken hata oluştu: ' + err.stack);
            res.send('Kayıt sırasında bir hata oluştu.');
        } else {
            console.log('Yeni kullanıcı veritabanına eklendi.');
            userRoles[email] = role; // Kullanıcı rolünü kaydet
                        // Eğer kullanıcı tipi "reviewer" ise, reviewers tablosuna ekle
                        if (role === 'reviewer') {
                            const reviewerSql = `INSERT INTO reviewers (name, email, expertise) VALUES (?, ?, ?)`;
                            const reviewerValues = [username, email, expertise];
                            connection.query(reviewerSql, reviewerValues, (err, result) => {
                                if (err) {
                                    console.error('Reviewer eklenirken bir hata oluştu: ' + err.stack);
                                } else {
                                    console.log('Yeni reviewer veritabanına eklendi.');
                                }
                            });
                        }
            

            res.redirect('/login');
        }
    });
});


