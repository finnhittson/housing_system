const express = require('express');
const user_edit = require('./user_edit.js');

const columns = [
	{header: 'Basic Information', attrs: {
		Password: 'Password',
		NameFirst: 'First Name',
		NameLast: 'Last Name',
		Phone: 'Phone Number',
		Email: 'Email'
	}}
];

var router = express.Router();

user_edit.setPage(router, 'Admin', columns);

module.exports = router;
