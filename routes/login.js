const express = require('express');
const db = require('./utils/db.js');
const login = require('./utils/login.js');

var router = express.Router();
router.get('/:userType(student|admin)', function(req, res, next) {
	console.log(`${req.params.userType}_login`);

	var isStudent = req.params.userType === 'student' ? true : false;
	var userTypePretty = isStudent ? 'Student' : 'Administrator';

	var ejsArgs = {
		title: `${userTypePretty} Login`,
		header: 'Enter Credentials',
		fields: [
			{id: 'id', name: `${userTypePretty} ID`, type: 'number'},
            {id: 'pwd', name: 'Password', type: 'password'}
		],
		dest: `/login/${req.params.userType}`,
		enterMsg: 'Login',
		errMsg: 'Invalid Credentials'
	};

	if (req.query.id === undefined || req.query.pwd === undefined
	    || req.query.id === '' || req.query.pwd === '' // No Credentials
		|| isNaN(req.query.id)) { // ID not a number
		if (req.query.id === undefined && req.query.pwd === undefined) {
			ejsArgs['errMsg'] = '';
		}
		res.render('form', ejsArgs);
	} else {
		callback = function(success) {
			if (success) {
				res.redirect(`/${req.params.userType}/${req.query.id}`);
			} else {
				res.render('form', ejsArgs);
			}
		}
		if (isStudent) {
			login.loginStudent(req.query.id, req.query.pwd, callback);
		} else {
			login.loginAdmin(req.query.id, req.query.pwd, callback);
		}
	}
});

module.exports = router;
