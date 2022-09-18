var express = require('express');
const path = require('path');
const {use} = require("express/lib/router");
var router = express.Router();

var session = require('express-session');
const Cookies = require('cookies');
const keys = ['keyboard cat']

const db = require('../models');
const {Model} = require("sequelize");

var app = express();
app.use('/searchImages/images', express.static('public'))

router.use(session({ secret:'somesecretkey', cookie: { maxAge: 60*1000}}))

function isEmailUnique (mail) {
    return db.Users.count({ where: { email: mail } })
        .then(count => {
            if (count !== 0) {
                return false;
            }
            return true;
        });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.logIn &&req.session.logIn===true)
        req.session.logIn=false;
    res.render('login', { title: 'Login', errorMail: '',registerMsg:''});
});
/* POST home page. */
router.post('/', function(req, res, next) {
    const cook = new Cookies(req, res, {keys: keys})
    if(req.session.logIn &&req.session.logIn===true)
        req.session.logIn=false;
    const registerCookie = cook.get('RegisterCookie', {signed: true});

    if (!registerCookie) {
        req.session.registerSuccess = false;
        res.render('login', {
            title: 'Login',
            errorMail: '',
            registerMsg: 'Registration failed. Please try again faster'
        })
    } else {
        db.Users.findOrCreate(
            {where: {email: req.body.email.trim()},
                    defaults:{firstName:req.body.firstName.trim(),
                    lastName:req.body.lastName.trim(),
                    password:req.body.password.trim()}})
            .then((created) => {
                if(created[1])
                    res.render('login', {title: 'Login', errorMail:'', registerMsg: 'registration succeeded'})
                else
                    res.render('login', {title: 'Login', errorMail:'', registerMsg: 'your email in use please try again'})
            }).catch(function(error) {
                res.render('login', {title: 'Login', errorMail:'', registerMsg: 'An error occurred during registration. please try again'})
            });
    }
});

router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Register',errorMail:'' });
});

router.post('/register', function(req, res, next) {
    res.render('register', { title: 'Register',errorMail:'' });
});

router.post('/enterPassword', function(req, res,next){
    const cookies = new Cookies(req, res, { keys: keys })
    let mail = req.body.email.trim();
    isEmailUnique(mail).then(isUnique => {
        if (isUnique) {
            req.session.registerSuccess =true;
            cookies.set('RegisterCookie',new Date().toISOString(), {maxAge:  60*1000 })
            res.render('enterPassword', {title: 'Choose a password', mail: mail, email: mail, firstName: req.body.firstName, lastName: req.body.lastName});
        }
        let registerCookie = cookies.get('RegisterCookie', {signed: false})
        req.session.registerSuccess = false;
        res.render('register', {title: 'Register', errorMail: 'this email is already in use, please choose another one'});
    });
});

router.get('/enterPassword', function(req, res,next) {
    res.render('login', {title: 'Login', errorMail:'', registerMsg: 'An error occurred during registration. please try again'});
});

router.post('/nasaPage', function(req, res, next){


    return db.Users.findOne({where: {email: req.body.email, password: req.body.password}}).then((uname)=>{
        req.session.email=req.body.email.trim();
        req.session.logIn=true;
        res.render('nasaPage',{title:'', userName: uname.firstName, email: uname.email});
    }).catch((err)=>{
        res.render('login', { title: 'Login', errorMail: '',registerMsg:'Mail or password incorrect'});
    });
});

router.get('/nasaPage', function(req, res, next){
    res.render('login', { title: 'Login', errorMail: '',registerMsg:''});

});

module.exports = router;
