const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer'); // multer modülünü dahil et
const path = require('path');
const e = require('express');
const exp = require('constants');
const app = express();
const port = 3000;



const connection = require('./mysqlConf');
const { register } = require('module');
const dbm = require('./dbm');
const fs = require('fs');
const {
    User,
    Reviewer,
    ReviewerPapers,
    Reviews,
    Papers,
    Conference
} = require('./models');




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
    let newUser = new User(username, email, password, role, expertise);
          
    // Eğer kullanıcı tipi "reviewer" ise, reviewers tablosuna ekle
    dbm.addUser(newUser)
        .then(() => {
            // Eğer kullanıcı tipi "reviewer" ise, reviewers tablosuna ekle
            if (role === 'reviewer') {
                let newReviewer = new Reviewer(username, email, expertise);
                dbm.addReviewer(newReviewer);
            }
            res.redirect('/login');
        })
        .catch((err) => {
            console.error(err);
            // Handle the error here
        });
});




// Giriş sayfası
app.get('/login', (req, res) => {
    res.render('login');
});

// Kullanıcı girişi işlemi
app.post('/login', (req, res) => {
    let err = 0;
    var usr = 'A';
    dbm.authenticateUser(req, (err, usr) =>{
    // Veritabanından kullanıcıyı sorgula

        if (!err) {
            
            if (usr && usr !=='A') {
                req.session.user = usr; // Kullanıcı oturumunu oluştur
                console.log(usr);
                userRoles[usr.email] = usr.role;
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
    const usr = req.session.user; // Oturumda bulunan kullanıcı bilgisini al
    console.log(user);
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
    const usr = req.session.user; // Oturumda bulunan kullanıcı bilgisini al
    if (usr && usr.role  === 'organizer') {
        res.render('create-conference');
    } else {
        res.send('Yetkiniz yok.');
    }
});
// Konferans oluşturma işlemi
app.post('/create-conference', (req, res) => {
    const user = req.session.user; // Oturumda bulunan kullanıcı bilgisini al
    if (user && user.role  === 'organizer') {
        const { title, description, venue, date, schedule } = req.body;
        const id = generateUniqueId(); // Konferansa benzersiz bir kimlik oluştur
        dbm.addConference(new Conference(title, description, venue, date, schedule));
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
    const uRole = userRoles[req.session.user.email]; // Kullanıcının rolünü al
    if (uRole && uRole === 'organizer') {
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

    dbm.findConference(conferenceId, (err, conference) => {
        if (err) {
            console.error(err);
            res.send('Hata oluştu.');
        } else {
            if (conference) {
                res.render('edit-conference', { conferenceId, conference });
            } else {
                res.send('Konferans bulunamadı.');
            }
        }
    });
});


// Konferans düzenleme sayfası
app.get('/edit-conference/:id', requireLogin, requireOrganizer, (req, res) => {
    const conferenceId = req.params.id;
    dbm.findConference(conferenceId, (err, conference) => {
        if (err) {
            console.error(err);
            res.send('Hata oluştu.');
        } else {
            if (conference) {
                res.render('edit-conference', { conferenceId, conference });
            } else {
                res.send('Konferans bulunamadı.');
            }
        }
    });

});


// Konferans düzenleme işlemi
app.post('/edit-conference/:id', (req, res) => {
    const conferenceId = req.params.id;
    console.log(req.body)
    dbm.editConference(conferenceId, req.body );

    res.redirect('/conferences');
});

// Konferansları veritabanından almak için
app.get('/conferences', (req, res) => {
    dbm.getAllConferences((err, results) => {
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
    const newPaper = new Papers(null, title, abstract, keywords, file.filename, 'submitted', expertise);
    
    // Dosya yükleme işlemi başarılıysa
    if (file) {
        dbm.addPaper(newPaper)
            .then( () => {
                res.send('Bildiri başarıyla gönderildi.');
                assignPapersToReviewers(); // Bildirileri hakemlere atama işlemini gerçekleştir
            })
            .catch(() => {
                res.send('Bildiri gönderilirken bir hata oluştu.');
            });
    } else {
        res.send('Dosya yükleme işlemi başarısız.');
    }

    assignPapersToReviewers();
});


// Bildiriler ve hakemler arasındaki ilişkiyi tutacak nesne
let paperReviewAssignments = {};

// Kağıtları inceleme sayfası
app.get('/review-papers', requireLogin, requireReviewer, (req, res) => {
    reviewerId = req.session.user.id;
    dbm.reviewPapers(reviewerId)
        .then((assignedPapers) => {
            res.render('review-papers', { assignedPapers });
        })
        .catch((err) => {
            console.error('An error occurred while fetching papers for review: ' + err.stack);
            res.send('An error occurred while fetching papers for review.');
        });
});

// Bildirileri görüntüleme
app.get('/show-papers', (req, res) => {
    dbm.getAllPapers((err, papers) => {
        if (err) {
            console.error('An error occurred while fetching papers: ' + err.stack);
            res.send('An error occurred while fetching papers.');
        } else {
            res.render('show-papers', { papers });
        }
    });
});

// İnceleme gönderme işlemi
app.post('/submit-review/:id', requireLogin, requireReviewer, (req, res) => {
    const paperId = req.params.id;
    const { score, feedback } = req.body;
    const review = new review( req.session.user.id, paperId, score, feedback)
    dbm.saveReview(review)
        .then(() => {
            console.log('New review added to the database.');
            res.redirect('/review-papers');
        })
        .catch((err) => {
            console.error('An error occurred while submitting the review: ' + err.stack);
            res.send('An error occurred while submitting the review.');
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
    dbm.getAllPapers((err, papers) => {
        if (err) {
            console.error('Kağıtlar alınırken bir hata oluştu: ' + err.stack);
            return;
        }
        
        // Tüm hakemleri al
        dbm.getAllReviewers((err, reviewers) => {
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

                if (assignedReviewer) {
                    // Kağıda hakemi atama
                    const reviewerPaper = new ReviewerPapers(assignedReviewer, paperId);

                    dbm.addReviewerPaper(reviewerPaper)
                        .then(() => {
                            console.log(`Kağıt (${paper.title}) hakeme (${assignedReviewer}) atandı.`);
                            // Atanan kağıdı assignedPapers dizisine ekle
                            assignedPapers.push({ paperId, title: paper.title, status: paper.status, reviewer: assignedReviewer });
                            console.log(assignedPapers);
                        })
                        .catch((error) => {
                            console.error('Kağıda hakem atanırken bir hata oluştu: ' + error);
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
    const filePath = path.join(__dirname, 'public/uploads/', filename); // Dosya yolu oluştur

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


// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
