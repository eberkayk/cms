const express = require('express');
const session = require('express-session');
const connection = require('./mysqlConf');
const bodyParser = require('body-parser');
const multer = require('multer'); // multer modülünü dahil et
const path = require('path');
const e = require('express');
const exp = require('constants');

const IndexModel = require('./models/indexModel');
const IndexController = require('./controllers/indexController');

const indexModel = new IndexModel();
const indexController = new IndexController(indexModel);

// Use indexController.handleRequest wherever you need to handle a request


const app = express();
const port = 3000;



// Oturum yönetimini yapılandırma
app.use(session({
    secret: 'your-secret-key', // Oturum verilerini şifrelemek için kullanılacak gizli anahtar
    resave: false,
    saveUninitialized: true
}));

// Middleware'leri kullanma
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Dosya yüklemeleri için public klasörünü kullan
app.set('view engine', 'ejs');

// Dosya yükleme için ayarlar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Dosyaların yükleneceği klasörü belirle
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Yüklenecek dosyanın adını belirle
    }
});

const upload = multer({ storage: storage });

// Basit bir veritabanı simülasyonu
let users = [];
let conferences = [];
let userRoles = {}; // Kullanıcı rolleri için bir obje: { email: role }

// createDummyData();

// Middleware'ler
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Dosya yüklemeleri için public klasörünü kullan
app.set('view engine', 'ejs');

// Ana sayfa
app.get('/', (req, res) => {
    res.render('index');
});

// Kayıt sayfası
app.get('/register', (req, res) => {
    res.render('register');
});

// Kayıt işlemi
app.post('/register', (req, res) => {
    const { username, email, password, role, expertise } = req.body;
    
    // SQL sorgusu oluştur
    const sql = `INSERT INTO users (username, email, password, role, expertise) VALUES (?, ?, ?, ?, ?)`;
    
    // Parametre değerlerini ayarla
    const values = [username, email, password, role, expertise];
    
    // Veritabanına sorguyu gönder
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Veritabanına kayıt eklenirken hata oluştu: ' + err.stack);
            res.send('Kayıt sırasında bir hata oluştu.');
        } else {
            console.log('Yeni kullanıcı veritabanına eklendi.');
            userRoles[email] = role; // Kullanıcı rolünü kaydet
            

            res.redirect('/login');
        }
    });
});




// Giriş sayfası
app.get('/login', (req, res) => {
    res.render('login');
});

// Kullanıcı girişi işlemi
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // SQL sorgusu oluştur
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;

    // Parametre değerlerini ayarla
    const values = [email, password];

    // Veritabanından kullanıcıyı sorgula
    connection.query(sql, values, (err, results) => {
        if (err) {
            console.error('Kullanıcı sorgulanırken bir hata oluştu: ' + err.stack);
            res.send('Kullanıcı sorgulanırken bir hata oluştu.');
        } else {
            // Sorgu sonuçları var mı kontrol et
            if (results.length > 0) {
                const user = results[0]; // İlk kullanıcıyı al
                req.session.user = user; // Kullanıcı oturumunu oluştur
                userRoles[email] = user.role; // Kullanıcı rolünü güncelle
                res.redirect('/'); // Anasayfaya yönlendir
            } else {
                res.send('Geçersiz kullanıcı adı veya şifre.');
            }
        }
    });
});

assignPapersToReviewers(); // Bildirileri hakemlere atama işlemini gerçekleştir

// Ana sayfa
app.get('/', (req, res) => {
    const user = req.session.user; // Oturumda bulunan kullanıcı bilgisini al
    if (user) {
        res.send(`Hoş geldiniz, ${user.username}!`);
    } else {
        res.render('index');
    }
});

// Konferanslar için basit bir veritabanı simülasyonu

// Benzersiz kimlik oluşturmak için yardımcı fonksiyon
function generateUniqueId() {
    // Benzersiz kimlik oluşturmak için uygun bir yöntem kullan
    // Şu anda basit bir zaman damgası kullanılmıştır
    return Date.now().toString();
}

// Konferans oluşturma sayfası
app.get('/create-conference', (req, res) => {
    const user = req.session.user; // Oturumda bulunan kullanıcı bilgisini al
    if (user && userRoles[user.email] === 'organizer') {
        res.render('create-conference');
    } else {
        res.send('Yetkiniz yok.');
    }
});

// Konferans oluşturma işlemi
app.post('/create-conference', (req, res) => {
    const user = req.session.user; // Oturumda bulunan kullanıcı bilgisini al
    if (user && userRoles[user.email] === 'organizer') {
        const { title, description, venue, date, schedule } = req.body;
        const id = generateUniqueId(); // Konferansa benzersiz bir kimlik oluştur
        conferences.push({id, title, description, venue, date, schedule});
        res.redirect('/conferences');
    } else {
        res.send('Yetkiniz yok.');
    }
});

// Kullanıcı giriş yapmadan konferans oluşturma sayfasına erişimi engelleme
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Kullanıcı rolünün 'organizer' olup olmadığını kontrol eden middleware
function requireOrganizer(req, res, next) {
    const userRole = userRoles[req.session.user.email]; // Kullanıcının rolünü al
    if (userRole && userRole === 'organizer') {
        return next();
    } else {
        res.send('Yetkiniz yok.');
    }
}

// Konferans oluşturma sayfasına sadece giriş yapmış ve 'organizer' rolüne sahip kullanıcıların erişmesini sağlama
app.get('/create-conference', requireLogin, requireOrganizer, (req, res) => {
    res.render('create-conference');
});

// Konferans detayları için görüntüleme
app.get('/conference/:id', (req, res) => {
    const conferenceId = req.params.id;

    // SQL sorgusu oluştur
    const sql = `SELECT * FROM conferences WHERE id = ?`;

    // Parametre değerlerini ayarla
    const values = [conferenceId];

    // Veritabanından konferansı sorgula
    connection.query(sql, values, (err, results) => {
        if (err) {
            console.error('Konferans alınırken bir hata oluştu: ' + err.stack);
            res.send('Konferans alınırken bir hata oluştu.');
        } else {
            // Sonuçları kontrol et ve şablonla birlikte gönder
            if (results.length > 0) {
                const conference = results[0];
                res.render('conference-details', { conference });
            } else {
                res.send('Konferans bulunamadı.');
            }
        }
    });
});


// Konferans düzenleme sayfası
app.get('/edit-conference/:id', requireLogin, requireOrganizer, (req, res) => {
    const conferenceId = req.params.id;
    const conference = conferences.find(conf => conf.id === conferenceId);
    if (conference) {
        res.render('edit-conference', { conferenceId, conference });
    } else {
        res.send('Konferans bulunamadı.');
    }
});


// Konferans düzenleme işlemi
app.post('/edit-conference/:id', (req, res) => {
    const conferenceId = req.params.id;
    const { title, description, venue, date, schedule } = req.body;
    conferences[conferenceId] = { title, description, venue, date, schedule };
    res.redirect('/conferences');
});

// Konferansları veritabanından almak için
app.get('/conferences', (req, res) => {
    // SQL sorgusu oluştur
    const sql = `SELECT * FROM conferences`;

    // Veritabanından konferansları sorgula
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Konferanslar alınırken bir hata oluştu: ' + err.stack);
            res.send('Konferanslar alınırken bir hata oluştu.');
        } else {
            // Sonuçları şablonla birlikte gönder
            res.render('conferences', { conferences: results });
        }
    });
});


// Kullanıcı girişi gerektiren bir middleware
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Kullanıcı rolünün 'author' olup olmadığını kontrol eden middleware
function requireAuthor(req, res, next) {
    const userRole = userRoles[req.session.user.email]; // Oturumda bulunan kullanıcı rolünü al
    if (userRole && userRole === 'author') {
        return next();
    } else {
        res.send('Yetkiniz yok.');
    }
}

// Bildiri gönderme sayfası
app.get('/submit-paper', requireLogin, requireAuthor, (req, res) => {
    res.render('submit-paper');
});

// Bildiri gönderme işlemi
app.post('/submit-paper', requireLogin, requireAuthor, upload.single('file'), (req, res) => {
    const { title, abstract, keywords, expertise } = req.body;
    const file = req.file;
    // Dosya yükleme işlemi başarılıysa
    if (file) {
        // Dosya adını al
        const filename = file.filename;

        // SQL sorgusu oluştur
        const sql = `INSERT INTO papers (title, abstract, keywords, filename, status, expertise) VALUES (?, ?, ?, ?, ?, ?)`;

        // Parametre değerlerini ayarla
        const values = [title, abstract, keywords, filename, 'submitted', expertise];

        // Veritabanına sorguyu gönder
        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Bildiri gönderilirken bir hata oluştu: ' + err.stack);
                res.send('Bildiri gönderilirken bir hata oluştu.');
            } else {
                console.log('Yeni bildiri veritabanına eklendi.');
                res.send('Bildiri başarıyla gönderildi.');
            }
        });
    } else {
        res.send('Dosya yüklenemedi.');
    }
    assignPapersToReviewers(); // Bildirileri hakemlere atama işlemini gerçekleştir
    
});


// Bildiriler ve hakemler arasındaki ilişkiyi tutacak nesne
let paperReviewAssignments = {};

// Kağıtları inceleme sayfası
app.get('/review-papers', requireLogin, requireReviewer, (req, res) => {
    const reviewerId = req.session.user.id; // Oturumdaki kullanıcının kimliğini al
    // SQL sorgusu oluştur
    const sql = `SELECT papers.id, papers.title, papers.status FROM papers JOIN reviews ON papers.id = reviews.paper_id WHERE reviews.reviewer_id = ?`;

    // Veritabanından sorguyu gönder
    connection.query(sql, [reviewerId], (err, results) => {
        if (err) {
            console.error('Bildirilere ulaşırken bir hata oluştu: ' + err.stack);
            res.send('Bildirilere ulaşırken bir hata oluştu.');
        } else {
            const assignedPapers = results;
            res.render('review-papers', { assignedPapers });
        }
    });
});

// İnceleme gönderme işlemi
app.post('/submit-review', requireLogin, requireReviewer, (req, res) => {
    const { paperId, score, feedback } = req.body;

    // SQL sorgusu oluştur
    const sql = `INSERT INTO reviews (paper_id, reviewer_id, score, feedback) VALUES (?, ?, ?, ?)`;

    // Parametre değerlerini ayarla
    const values = [paperId, req.session.user.id, score, feedback];

    // Veritabanına sorguyu gönder
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('İnceleme gönderilirken bir hata oluştu: ' + err.stack);
            res.send('İnceleme gönderilirken bir hata oluştu.');
        } else {
            console.log('Yeni inceleme veritabanına eklendi.');
            res.redirect('/review-papers');
        }
    });
});

// Bildirilere puan verme ve geri bildirim sağlama işlemi
app.post('/review-papers', requireLogin, requireReviewer, (req, res) => {
    const reviewerId = req.session.user.id; // Oturumdaki kullanıcının kimliğini al
    const { paperId, score, feedback } = req.body;
    // Puan verme ve geri bildirim sağlama işlemleri
    // ...
    res.send('Bildiri değerlendirildi ve geri bildirim sağlandı.');
});

// Kullanıcı girişi gerektiren bir middleware
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Kullanıcının 'author' rolünde olup olmadığını kontrol eden middleware
function requireAuthor(req, res, next) {
    const userRole = userRoles[req.session.user.email]; // Oturumdaki kullanıcının rolünü al
    if (userRole && userRole === 'author') {
        return next();
    } else {
        res.send('Yetkiniz yok.');
    }
}

// Kullanıcının 'reviewer' rolünde olup olmadığını kontrol eden middleware
function requireReviewer(req, res, next) {
    const userRole = userRoles[req.session.user.email]; // Oturumdaki kullanıcının rolünü al
    if (userRole && userRole === 'reviewer') {
        return next();
    } else {
        res.send('Yetkiniz yok.');
    }
}

// Atanan kağıtları saklamak için boş bir dizi oluştur
let assignedPapers = [];

// Kağıtları atama işlemi
function assignPapersToReviewers() {
    // Tüm kağıtları al
    connection.query("SELECT * FROM papers WHERE status = 'submitted'", (err, papers) => {
        if (err) {
            console.error('Kağıtlar alınırken bir hata oluştu: ' + err.stack);
            return;
        }
        
        // Tüm hakemleri al
        connection.query("SELECT * FROM reviewers", (err, reviewers) => {
            if (err) {
                console.error('Hakemler alınırken bir hata oluştu: ' + err.stack);
                return;
            }
            
            // Her bir kağıt için uygun hakemi bul
            papers.forEach(paper => {
                const paperId = paper.id;
                let paperExpertise = paper.expertise; // Kağıdın uzmanlık alanları
                if (!Array.isArray(paperExpertise)) {
                    paperExpertise = [paperExpertise]; // Uzmanlık alanını diziye dönüştür
                }
                let assignedReviewer = null;

                // Her bir hakemi döngüye al
                reviewers.forEach(reviewer => {
                    const reviewerName = reviewer.name;
                    let reviewerExpertise = reviewer.expertise; // Hakemin uzmanlık alanları
                    if (!Array.isArray(reviewerExpertise)) {
                        reviewerExpertise = [reviewerExpertise]; // Uzmanlık alanını diziye dönüştür
                    }
                    
                    // Hakem ve kağıdın uzmanlık alanlarını karşılaştır
                    const commonExpertise = paperExpertise.filter(area => reviewerExpertise.includes(area));
                    
                    // Eğer en az bir ortak uzmanlık alanı varsa, bu hakemi atanmış hakem olarak belirle
                    if (commonExpertise.length > 0) {
                        assignedReviewer = reviewerName;
                        return; // En uygun hakemi bulduğumuz için döngüyü sonlandır
                    }
                });

                // Kağıda hakemi atama
                if (assignedReviewer) {
                    // SQL sorgusu oluştur
                    const assignSql = `INSERT INTO reviewers_papers (reviewer_name, paper_id) VALUES (?, ?)`;
                    // Parametre değerlerini ayarla
                    const assignValues = [assignedReviewer, paperId];
                    // Veritabanına sorguyu gönder
                    connection.query(assignSql, assignValues, (err, result) => {
                        if (err) {
                            console.error('Kağıda hakem atanırken bir hata oluştu: ' + err.stack);
                        } else {
                            console.log(`Kağıt (${paper.title}) hakeme (${assignedReviewer}) atandı.`);
                            // Atanan kağıdı assignedPapers dizisine ekle
                            assignedPapers.push({ paperId, title: paper.title, status: paper.status, reviewer: assignedReviewer });
                            console.log(assignedPapers);
                        }
                    });
                }
            });
        });
    });
}

// Assigned papers route
app.get('/assigned-papers', (req, res) => {
    res.render('review-papers', { assignedPapers });
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public/uploads', filename); // Dosya yolu oluştur

    // Dosyanın varlığını kontrol et
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Dosya bulunamazsa 404 hatası gönder
            res.status(404).send('Dosya bulunamadı.');
            return;
        }

        // Dosyayı indir
        res.download(filePath, (err) => {
            if (err) {
                // İndirme hatası olursa hata mesajını gönder
                res.status(500).send('Dosya indirilirken bir hata oluştu.');
            }
        });
    });
});

module.exports =app;


// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});


