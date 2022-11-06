const express = require('express');
const admin_edit = require('./admin_edit.js');

const columns = [
	{header: 'Login Information', attrs: {
		SID: 'Student ID',
		Password: 'Password'
	}},
	{header: 'Contact Information', attrs: {
		NameFirst: 'First Name',
		NameLast: 'Last Name',
		Email: 'School Email',
		Phone: 'Phone Number'
	}},
	{header: 'School Information', attrs: {
		Year: 'Year',
		Major: 'Major',
		IsRA: 'Resident Assistant'
	}},
	{header: 'Preferences', attrs: {
		PrefMusic: 'Music Preferences',
		PrefCleanliness: 'Room Cleanliness',
		PrefBedtime: 'Prefered Bedtime'
	}}
];

const primaryKeys = {
	'SID': 'Student ID'
};

var router = express.Router();

admin_edit.setPage(router, 'Student', 'student', 'Student', primaryKeys, columns);

module.exports = router;
