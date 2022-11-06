const express = require('express');
const db = require('./utils/db.js');

var router = express.Router();
router.get('/', function(req, res, next) {
	console.log(`building_search: ${req.query.bname}`);

	var ejsArgs = {
		title: 'Building Search',
		header: 'Enter Building Name',
		fields: [
			{id: 'bname', name: 'Building Name', type: 'test'}
		],
		dest: '/building-search',
		enterMsg: 'Search',
		errMsg: 'Invalid Query'
	}; 

	if (req.query.bname === undefined || req.query.bname === '') { // No Credentials
		if (req.query.bname === undefined) {
			ejsArgs['errMsg'] = '';
		}
		res.render('form', ejsArgs);
	} else {
		var selectBuilding = 'SELECT * FROM Building B WHERE B.Name = ?;';
		db.execQuery(selectBuilding, [req.query.bname], function(rows) {
			if (rows.length === 0) { // Invalid Credentials
				res.render('form', ejsArgs);
			} else { // Valid Credentials
				res.redirect(`/building/${req.query.bname}`);
			}
		});
	}
});

module.exports = router;
