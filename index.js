var express = require('express');
var pug = require('pug');
var path = require('path');
var config = require('./menu');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');

var app = express();

app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);
app.use(express.static(path.join(`${__dirname}/public`)));

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/data');

var mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error:'));
mdb.once('open', function (callback) {

});

var personSchema = mongoose.Schema({
    username: String,
    avatarImg: String,
    passHash: String,
    userLevel: String,
    email: String,
    age: Number
});

var Person = mongoose.model('People_Collection', personSchema);

var length;
var query = Person.find({
    'username': 'admin'
});
query.select('username');
query.exec(function (err, res) {
    if (err) throw err;
    if (res.length === 0) {
        var person = new Person({
            username: 'admin',
            avatarImg: 'https://api.adorable.io/avatars/face/eyes4/nose3/mouth7/8e8895',
            passHash: bcrypt.hashSync('pass'),
            userLevel: 'admin',
            email: 'admin@admin.com',
            age: 51
        });
        person.save(function (err, person) {
            if (err) return console.error(err);
            console.log('Admin added');
        });
    }
})

var urlencodedParser = bodyParser.urlencoded({
    extended: true
});

app.get('/', function (req, res) {
    res.render('title', {
        title: 'Forum Website',
        "config": config
    })
});

app.get('/register', function (req, res) {
    res.render('register', {
        title: 'Register',
        "config": config
    })
});

app.post('/submit', urlencodedParser, function (req, res) {
    var person = new Person({
        username: req.body.username,
        avatarImg: req.body.imageurl,
        passHash: bcrypt.hashSync(req.body.passHash),
        userLevel: 'user',
        email: req.body.email,
        age: req.body.age
    });
    person.save(function (err, person) {
        if (err) return console.error(err);
        console.log(req.body.username + ' added');
    });
    res.redirect('/');
});

app.get('/login', urlencodedParser, function (req, res) {

});

app.listen(3000);