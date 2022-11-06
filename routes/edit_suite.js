const express = require('express');
const admin_edit = require('./admin_edit.js');

const columns = [
	{header: 'General Information', attrs: {
		Number: 'Suite Number',
		BuildingName: 'BuildingName'
	}},
	{header: 'Suite Details', attrs: {
		HasKitchen: 'Suite Kitchen',
		CommonAreaDesc: 'Common Area Description',
		BathroomDesc: 'Bathroom Description'
	}}
];

const primaryKeys = {
	'BuildingName': 'Building Name',
	'Number': 'Suite Number'
};

var router = express.Router();

admin_edit.setPage(router, 'Suite', 'suite', 'Suite', primaryKeys, columns);

module.exports = router;
