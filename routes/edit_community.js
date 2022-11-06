const express = require('express');
const admin_edit = require('./admin_edit.js');

const columns = [
	{header: 'General Information', attrs: {
		Name: 'Name'
	}},
	{header: 'Office Information', attrs: {
		OfficePhone: 'Office Phone Number',
		OfficeEmail: 'Office Email',
		OfficeAddress: 'Office Address'
	}},
	{header: 'Director Information', attrs: {
		DirectorFName: 'Director First Name',
		DirectorLName: 'Director Last Name',
		DirectorPhone: 'Director Phone'
	}}
];

const primaryKeys = {
	'Name': 'Residential Community Name'
};

var router = express.Router();

admin_edit.setPage(router, 'Residential Community', 'community', 'ResidentialCommunity', primaryKeys, columns);

module.exports = router;
