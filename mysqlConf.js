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
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      venue VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      schedule TEXT NOT NULL
    )
  `;
  const createPapersTable = `
  CREATE TABLE IF NOT EXISTS papers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    abstract TEXT,
    keywords VARCHAR(255),
    filename VARCHAR(255),
    status VARCHAR(20),
    expertise VARCHAR(50)
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
  connection.query(createPapersTable, (err, results) => {
    if (err) throw err;
    console.log('papers table has been created.');
  });
  
});



module.exports = connection;
