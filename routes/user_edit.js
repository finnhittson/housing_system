const express = require('express');
const db = require('./utils/db.js');
const login = require('./utils/login.js');

function update(attrs, table, pkey, pkeyVal, callback) {
	var attrList = Object.keys(attrs);
	// [table] + [attr1, val1, attr2, val2, ...] + [pkey, pkeyVal]
	var args = [table];
	var numUpdateAttrs = 0;
	attrList.forEach(function(key) {
		if (key !== pkey && attrs[key] !== null) {
			args.push(key);
			args.push(attrs[key]);
			numUpdateAttrs++;
		}
	});
	args.push(pkey);
	args.push(pkeyVal);

	if (numUpdateAttrs == 0) {
		callback();
		return;
	}

	// Placefolders for args
	var assignQuestions = Array(numUpdateAttrs).fill('??=?').join(',');

	var update_query = `UPDATE ?? SET ${assignQuestions} WHERE ??=?;`;
	db.execQuery(update_query, args, function(rows) {
		console.log(`Updated: ${pkey} = ${pkeyVal} in ${table}`);
		callback();
	});
}

function setPage(router, userType, columns) {
	var pkey = '';
	var pkeyPretty = '';
	var entity = '';
	var table = '';
	var path = '';
	switch (userType) {
		case 'Student':
			pkey = 'SID';
			pkeyPretty = 'Student ID';
			entity = 'Student';
			table = 'Student';
			path = 'student';
			break;
		case 'Admin':
			pkey = 'AID';
			pkeyPretty = 'Admin ID';
			entity = 'Admin';
			table = 'Admin';
			path = 'admin';
			break;
		default:
			return;
	}

	var sqlAttrs = [];
	columns.forEach(function(col) {
		sqlAttrs = sqlAttrs.concat(Object.keys(col.attrs));
	});

	var htmlArgs = {
		entity: entity,
		path: path,
		columns: columns,
		pkey: pkey,
		pkeyVal: '',
		initialVals: {},
		errMsg: ''
	}


	router.get('/search', function(req, res, next) { // Viewing student
		htmlArgs['initialVals'] = {};
		htmlArgs['errMsg'] = '';

		// Check loggedIn
		var pkeyVal = db.getVal(req.query, pkey, '');
		if (userType === 'Student' && !login.studentLoggedIn(pkeyVal)) {
			res.redirect(`/student/${pkeyVal}`);
			return;
		} else if (userType === 'Admin' && !login.adminLoggedIn(pkeyVal)) {
			res.redirect(`/admin/${pkeyVal}`);
			return;
		}
		htmlArgs['pkeyVal'] = pkeyVal;

		var get_data = `SELECT * FROM ?? WHERE ??=?;`;
		db.execQuery(get_data, [table, pkey, pkeyVal], function(rows) {
			if (rows.length !== 0) {
				var dict = rows[0];
				Object.keys(dict).forEach(function(key) {
					if (dict[key] !== null) {
						htmlArgs['initialVals'][key] = String(dict[key]);
					}
				});
				if (req.query.success) {
					htmlArgs['errMsg'] = 'Updated';
				}
			} else {
				htmlArgs['initialVals'] = req.query;
				htmlArgs['errMsg'] = `${entity} Not Found`;
			}
			res.render('user_edit', htmlArgs);
		});
	});

	router.get('/', function(req, res, next) { // Not viewing student, perform operation
		htmlArgs['initialVals'] = {};
		htmlArgs['errMsg'] = '';
		var vals = {};
		var missingKeys = [];

		var pkeyVal = db.getVal(req.query, pkey, '');
		if (pkeyVal.length === 0) { // Missing primary key
			htmlArgs['initialVals'] = req.query;
			if (Object.keys(req.query).length !== 0) {
				htmlArgs['errMsg'] = `Missing: ${pkeyPretty}`;
			}
			res.render('user_edit', htmlArgs);
		} else { // Have all primary keys
			// Get SQL attributes from http request
			for (let i = 0; i < sqlAttrs.length; i++) {
				var val = db.getVal(req.query, sqlAttrs[i], '');
				vals[sqlAttrs[i]] = val.length === 0 ? null : val;
			}
			// Check loggedIn
			if (userType === 'Student' && !login.studentLoggedIn(pkeyVal)) {
				res.redirect(`/student/${pkeyVal}`);
			} else if (userType === 'Admin' && !login.adminLoggedIn(pkeyVal)) {
				res.redirect(`/admin/${pkeyVal}`);
			} else { // Update entity
				update(vals, table, pkey, pkeyVal, function() {
					res.redirect(`/user-edit/${path}/search?success=1&${pkey}=${pkeyVal}`);
				});
			}
		}
	});
}

exports.setPage = setPage;
