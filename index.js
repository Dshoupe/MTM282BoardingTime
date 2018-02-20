var express = require('express');
var pug = require('pug');
var path = require('path');
var config = require('./menu');
var bodyParser = require('body-parser');

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
        passHash: req.body.passhash,
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

app.listen(3000);