
const connection = require('./mysqlConf');



const {
  User,
  Reviewer,
  ReviewerPapers,
  Reviews,
  Papers,
  Conference
} = require('./models');

class dbm {
  static addUser(user) {
    const query = `
    INSERT INTO users (username, email, password, role, expertise)
    VALUES (?, ?, ?, ?, ?)
    `;
    const values = [user.username, user.email, user.password, user.role, user.expertise];
    return new Promise((resolve, reject) => {
    connection.query(query, values, (err, results) => {
      if (err) {
      console.error(err);
      reject(1); // Reject with 1 if there is an error.
      } else {
      console.log('User added to the database.');
      resolve(0); // Resolve with 0 if successful.
      }
    });
    });
  }
  static addReviewer(reviewer) {
    const query = `
    INSERT INTO reviewers (username, email, expertise)
    VALUES (?, ?, ?)
    `;
    const values = [reviewer.username, reviewer.email, reviewer.expertise];
    return new Promise((resolve, reject) => {
    connection.query(query, values, (err, results) => {
      if (err) {
      console.error(err);
      reject(1); // Reject with 1 if there is an error.
      } else {
      console.log('Reviewer added to the database.');
      resolve(0); // Resolve with 0 if successful.
      }
    });
    });
  }

  static authenticateUser(req, callback) {
    const { email, password } = req.body;

    // SQL sorgusu oluştur
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;

    // Parametre değerlerini ayarla
    const values = [email, password];

    // Veritabanından kullanıcıyı sorgula
    connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Kullanıcı sorgulanırken bir hata oluştu: ' + err.stack);
      callback(err, null);
    } else {
      // Sorgu sonuçları var mı kontrol et
      if (results.length > 0) {
      const usr = results[0]; // İlk kullanıcıyı al
      callback(null, usr);
      } else {
      callback(null, null);
      }
    }
    });
  }
  static addConference(conference) {
    const query = `
    INSERT INTO conferences (title, description, venue, date, schedule)
    VALUES (?, ?, ?, ?, ?)
    `;
    const values = [conference.title, conference.description, conference.venue, conference.date, conference.schedule];
    
    return new Promise((resolve, reject) => {
    connection.query(query, values, (err, results) => {
      if (err) {
      console.error(err);
      reject(1); // Reject with 1 if there is an error.
      } else {
      console.log('Conference added to the database.');
      resolve(0); // Resolve with 0 if successful.
      }
    });
    });
  }
    static findConference(conferenceId, callback) {
      const query = `
      SELECT * FROM conferences WHERE id = ?
      `;
      const values = [conferenceId];
      connection.query(query, values, (err, results) => {
        if (err) {
          console.error(err);
          callback(err, null);
        } else {
          if (results.length > 0) {
            const conference = results[0];
            callback(null, conference);
          } else {
            callback(null, null);
          }
        }
      });
    }
    static editConference(conferenceId, updatedConference) {
      const query = `
      UPDATE conferences
      SET title = ?, description = ?, venue = ?, date = ?, schedule = ?
      WHERE id = ?
      `;
      const values = [updatedConference.title, updatedConference.description, updatedConference.venue, updatedConference.date, updatedConference.schedule, conferenceId];

      return new Promise((resolve, reject) => {
        connection.query(query, values, (err, results) => {
          if (err) {
            console.error(err);
            reject(1); // Reject with 1 if there is an error.
          } else {
            console.log('Conference updated in the database.');
            resolve(0); // Resolve with 0 if successful.
          }
        });
      });
    }
  static getAllConferences(callback) {
    const query = `
    SELECT * FROM conferences
    `;
    connection.query(query, (err, results) => {
      if (err) {
        console.error(err);
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  }

  static addPaper(paper) {
    const query = `
    INSERT INTO papers (title, abstract, keywords, filename, status, expertise)
    VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [paper.title, paper.abstract, paper.keywords, paper.filename, 'submitted', paper.expertise];
    return new Promise((resolve, reject) => {
      connection.query(query, values, (err, result) => {
        if (err) {
          console.error('An error occurred while adding the paper: ' + err.stack);
          reject(1); // Reject with 1 if there is an error.
        } else {
          console.log('New paper added to the database.');
          paper.id = result.insertId; // Set the id of the paper
          resolve(paper); // Resolve with the created paper object.
        }
      });
    });
  }

  static getAllPapers(callback) {
    const query = `
    SELECT * FROM papers
    `;
    connection.query(query, (err, results) => {
      if (err) {
        console.error(err);
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  }
  static getAllReviewers(callback) {
    const query = `
    SELECT * FROM reviewers
    `;
    connection.query(query, (err, results) => {
      if (err) {
        console.error(err);
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  }

  static addReviewerPaper(reviewerPaper) {
    const query = `
    INSERT INTO reviewer_papers (reviewer_name, paper_id)
    VALUES (?, ?)
    `;
    const values = [reviewerPaper.reviewerName, reviewerPaper.paperId];
    return new Promise((resolve, reject) => {
      connection.query(query, values, (err, result) => {
        if (err) {
          console.error('An error occurred while adding the reviewer paper: ' + err.stack);
          reject(1); // Reject with 1 if there is an error.
        } else {
          console.log('Reviewer paper added to the database.');
          resolve(0); // Resolve with 0 if successful.
        }
      });
    });
  }
  static reviewPapers(reviewerId) {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT papers.id, papers.title, papers.status
      FROM papers
      JOIN reviews ON papers.id = reviews.paper_id
      WHERE reviews.reviewer_id = ?
      `;
      connection.query(query, reviewerId, (err, results) => {
        if (err) {
          console.error('An error occurred while fetching papers for review: ' + err.stack);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

    static saveReview(review) {
      const query = `
      INSERT INTO reviews (reviewer_id, paper_id, score, comments)
      VALUES (?, ?, ?, ?)
      `;
      const values = [review.reviewerId, review.paperId, review.score, review.comments];
      return new Promise((resolve, reject) => {
        connection.query(query, values, (err, result) => {
          if (err) {
            console.error('An error occurred while saving the review: ' + err.stack);
            reject(1); // Reject with 1 if there is an error.
          } else {
            console.log('Review saved to the database.');
            resolve(0); // Resolve with 0 if successful.
          }
        });
      });
    }




  
}
  module.exports = dbm;