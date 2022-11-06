const express = require('express');
const db = require('./utils/db.js');

const searchQuery = ['SELECT R.Number FROM Room R WHERE R.Number = ? AND R.BuildingName = ?;',
                     'SELECT S.Number FROM Suite S WHERE S.Number = ? AND S.BuildingName= ?;'];

var router = express.Router();
router.get('/:searchType(room|suite)', function(req, res, next) {
	console.log(`${req.params.searchType}_search: ${req.query.bname}, ${req.query.num}`);

	var searchType = req.params.searchType === 'room' ? 0 : 1;
	var searchTypePretty = searchType === 0 ? 'Room' : 'Suite';

	var ejsArgs = {
		title: `${searchTypePretty} Search`,
		header: `Enter Building Name and ${searchTypePretty} Number`,
		fields: [
			{id: 'bname', name: 'Building Name', type: 'text'},
			{id: 'num', name: `${searchTypePretty} Number`, type: 'text'}
		],
		dest: `/search/${req.params.searchType}`,
		enterMsg: 'Search',
		errMsg: 'Invalid Query'
	};

	if (req.query.num === undefined || req.query.bname === undefined
		|| req.query.num === '' || req.query.bname === '') { // No Credentials
		if (req.query.num === undefined && req.query.bname === undefined) {
			ejsArgs['errMsg'] = '';
		}
		res.render('form', ejsArgs);
	} else {
		db.execQuery(searchQuery[searchType], [req.query.num, req.query.bname], function(rows) {
			if (rows.length === 0) { // Invalid Credentials
				res.render('form', ejsArgs);
			} else { // Valid Credentials
				res.redirect(`/${req.params.searchType}/${req.query.bname}-${req.query.num}`);
			}
		});
	}
});

module.exports = router;
