const express = require('express');
const user_edit = require('./user_edit.js');

const columns = [
	{header: 'General Information', attrs: {
		Password: 'Password',
		NameFirst: 'First Name',
		NameLast: 'Last Name',
		Phone: 'Phone Number'
	}},
	{header: 'Preferences', attrs: {
		PrefMusic: 'Music Preferences',
		PrefCleanliness: 'Room Cleanliness',
		PrefBedtime: 'Prefered Bedtime'
	}}
];

var router = express.Router();

user_edit.setPage(router, 'Student', columns);

module.exports = router;
