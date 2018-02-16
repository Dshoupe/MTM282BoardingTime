var express = require('express');
var pug = require('pug');
var path = require('path');
var config = require('./menu');
var bodyParser = require('body-parser');

var app = express();

app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);
app.use(express.static(path.join(`${__dirname}/public`)));

var urlencodedParser = bodyParser.urlencoded({
    extended: true
});

app.get('/', function (req, res) {
    res.render('title', {
        title: 'Home',
        "config": config
    })
});

app.listen(3000);