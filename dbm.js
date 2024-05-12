const connection = require('./mysqlConf');

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
  
  static getUsers(callback) {
    const query = `
    SELECT * FROM users
    `;
    connection.query(query, (err, results) => {
    if (err) throw err;
    callback(results);
    });
  }
  }

  module.exports = dbm;