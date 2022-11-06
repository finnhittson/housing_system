const express = require('express');
const admin_edit = require('./admin_edit.js');

const columns = [
	{header: 'General Information', attrs: {
		Number: 'Room Number',
		BuildingName: 'BuildingName'
	}},
	{header: 'Room Details', attrs: {
		Capacity: 'Room Capacity',
		Floor: 'Room Floor',
		Price: 'Room Price',
	}},
	{header: 'Room Size', attrs: {
		DimWidth: 'Width',
		DimLength: 'Length',
		DimHeight: 'Height'
	}},
	{header: 'Furniture', attrs: {
		BedWidth: 'Bed Width',
		BedLength: 'Bed Length',
		BedHeight: 'Bed Height',
		FurnitureDesc: 'Furniture Description'
	}}
];

const primaryKeys = {
	'BuildingName': 'Building Name',
	'Number': 'Room Number'
};

var router = express.Router();

admin_edit.setPage(router, 'Room', 'room', 'Room', primaryKeys, columns);

module.exports = router;
