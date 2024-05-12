const express = require('express');
const User = require('../models/User');
const Reviewer = require('../models/Reviewer');
const dbm = require('../dbm');




// Kayıt sayfası
function registerPage(req, res) {
    res.render('register');
}



function registerHandler(req, res) {
    const { username, email, password, role, expertise } = req.body;
    let newUser = new User(username, email, password, role, expertise);
    
    let exp =  dbm.addUser(newUser)
    if(!exp){
        userRoles[email] = role; // Kullanıcı rolünü kaydet
        
        // Eğer kullanıcı tipi "reviewer" ise, reviewers tablosuna ekle
        if (role === 'reviewer') {
            let newReviewer = new Reviewer(username, email, expertise)
            dbm.addReviewer(newReviewer);
        }
        res.redirect('/login');
    }
}



module.exports = registerController;