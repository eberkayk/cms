const mysql = require('connection');


class Reviewer {
    constructor(username, email, expertise) {
        this.username = username;

    }



    static createReviewer(username, email, expertise) {
        const newReviewer = new ReviewerModel(username, email, expertise);
        // Eğer kullanıcı tipi "reviewer" ise, reviewers tablosuna ekle
    
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
}
module.exports = Reviewer;