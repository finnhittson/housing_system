const express = require('express');
const login = require('./utils/login.js');

var router = express.Router();
router.get('/', function(req, res, next) {
	console.log('index');
	login.logoutStudent();
	login.logoutAdmin();
	res.render('index');
});

module.exports = router;
