const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'Mehmet-Coskun',
  user: 'newuser',
  password: 'password',
  database: 'NEWPROJECT'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL server.');

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      expertise VARCHAR(255) NOT NULL
    )
  `;

  const createReviewersTable = `
    CREATE TABLE IF NOT EXISTS reviewers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      expertise VARCHAR(255) NOT NULL
    )
  `;

  const createConferencesTable = `
    CREATE TABLE IF NOT EXISTS conferences (
      id INT AUTO_INCREMENT PRIMARY KEY
    )
  `;

  connection.query(createUsersTable, (err, results) => {
    if (err) throw err;
    console.log('users table has been created.');
  });

  connection.query(createReviewersTable, (err, results) => {
    if (err) throw err;
    console.log('reviewers table has been created.');
  });

  connection.query(createConferencesTable, (err, results) => {
    if (err) throw err;
    console.log('conferences table has been created.');
  });
});

module.exports = connection;