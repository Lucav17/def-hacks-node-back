const mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt-nodejs'),
    User = require("../models/User"),
    config = require("../configs/config");

function generateToken(user) {
    return jwt.sign(user, config.SECRET_KEY, {
        expiresIn: 2628000 // in seconds
    });
};

// Set user info from request
function setUserInfo(request) {
    return {
        _id: request._id,
        email: request.email
    };
};

exports.register = function (req, res) {
    const email = req.body.user;
    const password = req.body.password;

    // Return error if no user provided
    if (!email) {
        return res.status(422).send({ error: 'You must enter an email address.' });
    }

    // Return error if no password provided
    if (!password) {
        return res.status(422).send({ error: 'You must enter a password.' });
    }

    User.findOne({ email: email }, function (err, existingUser) {
        if (err) {
            res.send(400).json({ "error": err });
        }
        // If user is not unique, return error
        if (existingUser) {
            return res.status(422).send({ error: 'That user address is already in use.' });
        }

        // If user is unique and password was provided, create account
        let newUser = new User({
            user: user,
            password: password,
        });

        newUser.save(function (err, user) {
            if (err) {
                return res.send(400).json({ "error": err });
            }
            let userInfo = setUserInfo(user);
            return res.status(201).json({
                token: "JWT " + generateToken(userInfo),
                user: userInfo
            });
        });
    });
};

exports.login = function (req, res) {
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed. User not found.' });
        } else if (user) {
            user.comparePassword(req.body.password, (err, isMatch) => {
                if (!isMatch) {
                    return res.status(401).json({ message: 'Authentication failed. Wrong password.' });
                }
                let userInfo = setUserInfo(user);
                return res.json({
                    token: "JWT " + generateToken(userInfo),
                });
            });
        }
    });
};

exports.loginRequired = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({ message: 'Unauthorized user!' });
    }
};
