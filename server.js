// Importing Node modules and initializing Express
const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    config = require('./configs/config'),
    jsonwebtoken = require('jsonwebtoken');
    //router = require("./router");

mongoose.connect(config.DATABASE, function(err, db) {
    if (err) {
        console.log(err);
    } else {
        console.log("connected to db");
    }

});

// Setting up basic middleware for all Express requests
app.use(express.static(__dirname + "/public"));
app.use(morgan('dev')); // Log requests to API using morgan

// Enable CORS from client-side
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
//


app.use(bodyParser.urlencoded({ limit: '5mb', extended: true, parameterLimit: 100000, keepExtensions: true }));
app.use(bodyParser.json());
//app.use(bodyParser({ limit: '50mb' }));

app.use(function(req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === "JWT") {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], config.SECRET_KEY, function(err, decode) {
            if (err) {
                req.user = undefined;
                next();
            }
            req.user = decode;
            next();
        })
    } else {
        req.user = undefined;
        next();
    }
})

//router(app);

// Start the server
const server = app.listen(config.PORT, function(err, db) {
    if (err) {
        console.log(err)
    }
});
console.log('Your server is running on port ' + config.PORT + '.');
