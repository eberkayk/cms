const mysql = require('connection');


class User {
    constructor(username, email, password, role, expertise) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.expertise = expertise;
    }

    static createUser(user) {
        connection.connect();
        const query = `INSERT INTO users (username, email, password, role, expertise) VALUES (?, ?, ?, ?, ?)`;
        const values = [user.username, user.email, user.password, user.role, user.expertise];

        connection.query(query, values, (error, results) => {
            if (error) {
                console.error(error);
                return error; // Return an error code
            }
            console.log('User created successfully');
            return 0; // Return a success code
        });
    }

}

module.exports = User;