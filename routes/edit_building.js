const express = require('express');
const admin_edit = require('./admin_edit.js');

const columns = [
	{header: 'General Information', attrs: {
		Name: 'Name',
		Address: 'Address',
		NumFloors: 'Number of Floors'
	}},
	{header: 'Building Details', attrs: {
		UtilDesc: 'Utilities Description',
		BuildingDesc: 'BuildingDescription',
		FloorPlanFile: 'Attach File'
	}},
];

const primaryKeys = {
	'Name': 'Building Name'
};

var router = express.Router();

admin_edit.setPage(router, 'Building', 'building', 'Building', primaryKeys, columns);

module.exports = router;
