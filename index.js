var express = require('express');
var pug = require('pug');
var path = require('path');
var config = require('./menu');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var expressSession = require('express-session');

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

var messageSchema = mongoose.Schema({
    message: String,
    user: String
});

var Person = mongoose.model('People_Collection', personSchema);
var Message = mongoose.model('Message_Collection', messageSchema);

var length;
var query = Person.find({
    'userLevel': 'admin'
});
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
});

var checkAuth = function (req, res, next) {
    if (req.session.user && req.session.user.isAuthenticated) {
        next();
    } else {
        res.redirect('/');
    }
}

var checkAuthAdmin = function (req, res, next) {
    if (req.session.user && req.session.user.isAuthenticated && req.session.user.userLevel == 'admin') {
        next();
    } else {
        res.redirect('/');
    }
}

app.use(expressSession({
    secret: 'BoardingTime',
    saveUninitialized: true,
    resave: true
}));

var urlencodedParser = bodyParser.urlencoded({
    extended: true
});

app.get('/', function (req, res) {
    if (req.session.user != null) {
        res.render('title', {
            title: 'Forum Website',
            "config": config,
            "isAuth": req.session.user.isAuthenticated,
            "name": req.session.user.username,
            "level": req.session.user.userLevel
        });
    } else {
        res.render('title', {
            title: 'Forum Website',
            "config": config
        });
    }
});

app.get('/register', function (req, res) {
    if (req.session.user != null) {
        res.render('register', {
            title: 'Register',
            "config": config,
            "isAuth": req.session.user.isAuthenticated,
            "name": req.session.user.username,
            "level": req.session.user.userLevel
        });
    } else {
        res.render('register', {
            title: 'Register',
            "config": config
        });
    }
});

app.post('/submit', urlencodedParser, function (req, res) {
    var person = new Person({
        username: req.body.username,
        avatarImg: "",
        passHash: bcrypt.hashSync(req.body.passhash),
        userLevel: 'user',
        email: req.body.email,
        age: req.body.age
    });
    person.save(function (err, person) {
        if (err) return console.error(err);
        console.log(req.body.username + ' added');
    });
    req.session.user = {
        isAuthenticated: true,
        username: req.body.username,
        userLevel: 'user'
    };
    res.redirect('/');
});

app.get('/login', function (req, res) {
    res.render('login', {
        title: 'Login',
        "config": config
    });
});

app.post('/submitL', urlencodedParser, function (req, res) {
    Person.findOne({
        'username': req.body.username
    }, function (err, person) {
        if (err) throw err;
        if (person != null) {
            bcrypt.compare(req.body.password, person.passHash, function (err, result) {
                if (err) console.log(err);
                if (result) {
                    req.session.user = {
                        isAuthenticated: true,
                        username: req.body.username,
                        userLevel: person.userLevel
                    };
                    res.redirect('/');
                } else {
                    res.redirect('/login');
                }
            });
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/users', checkAuthAdmin, function (req, res) {
    Person.find({}, function (err, all) {
        var allUsers = [];
        for (var i = 0; i < all.length; i++) {
            if (all[i].username != req.session.user.username) {
                allUsers.push(all[i]);
            }
        }
        if (req.session.user != null) {
            res.render('users', {
                title: 'User Control List',
                "config": config,
                "users": allUsers,
                "isAuth": req.session.user.isAuthenticated,
                "name": req.session.user.username,
                "level": req.session.user.userLevel
            });
        } else {
            res.render('users', {
                title: 'User Control List',
                "config": config,
                "users": allUsers
            });
        }
    });
});

app.post('/deleteUser', urlencodedParser, function (req, res) {
    Person.findOneAndRemove({
        'username': req.body.username
    }, function (err, person) {
        if (err) throw err;
        res.redirect('/users');
    })
});

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            throw err;
        } else {
            res.redirect('/');
        }
    })
});

app.listen(3000);