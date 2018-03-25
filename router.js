const AuthenticationController = require('./controllers/userController'),
    express = require('express');


module.exports = function (app) {
    // Initializing route groups
    const apiRoutes = express.Router(),
        authRoutes = express.Router();

    //=========================
    // Auth Routes
    //=========================
    // Set auth routes as subgroup/middleware to apiRoutes
    apiRoutes.use('/auth', authRoutes);
    // Registration route
    authRoutes.post('/register', AuthenticationController.register);
    // Login route
    authRoutes.post('/login', AuthenticationController.login);

    // Set url for API group routes
    app.use('/api/v1/', apiRoutes);





};