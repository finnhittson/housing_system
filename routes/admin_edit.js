const express = require('express');
const db = require('./utils/db.js');
const login = require('./utils/login.js');

function update(attrs, table, primaryKeys, callback) {
	var attrList = Object.keys(attrs);
	var numAttrs = attrList.length;
	// [table] + [attr1, attr2, ...] + [val1, val2, ...] + [attr1, val1, attr2, val2, ...]
	var args = Array(attrList.length * 2 + 1);
	args[0] = table;
	attrList.forEach(function(key, i) {
		args[i + 1] = key;
		args[numAttrs + i + 1] = attrs[key];
	});
	var numUpdateAttrs = 0;
	attrList.forEach(function(key) {
		if (!(key in primaryKeys) && attrs[key] !== null) {
			args.push(key);
			args.push(attrs[key]);
			numUpdateAttrs++;
		}
	});

	// Placefolders for args
	var valQuestions = Array(numAttrs).fill('?').join(',');
	var attrQuestions = Array(numAttrs).fill('??').join(',');
	var assignQuestions = Array(numUpdateAttrs).fill('??=?').join(',');

	var update_query = `INSERT INTO ?? (${attrQuestions}) VALUES (${valQuestions}) ON DUPLICATE KEY UPDATE ${assignQuestions}`;
	db.execQuery(update_query, args, function(rows) {
		keyStr = '';
		primaryKeys.forEach(function(key, i) {
			if (i !== 0) {
				keyStr += ', ';
			}
			keyStr += `${key} = ${db.getVal(attrs, key, '')}`;
		});
		console.log(`Updated: ${keyStr} in ${table}`);
		callback();
	});
}

function remove(attrs, table, primaryKeys, callback) {
	var primaryVals = Array(primaryKeys.length);
	var predicate = Array(primaryKeys.length).fill('??=?').join(' AND ');
	var args = Array(primaryKeys.length * 2 + 1);
	args[0] = table;
	primaryKeys.forEach(function(key, i) {
		args[2*i + 1] = key;
		args[2*i + 2] = db.getVal(attrs, key, null);
	});
	var remove_query = `DELETE FROM ?? WHERE ${predicate};`;
	db.execQuery(remove_query, args, function(rows) {
		keyStr = '';
		primaryKeys.forEach(function(key, i) {
			if (i !== 0) {
				keyStr += ', ';
			}
			keyStr += `${key} = ${db.getVal(attrs, key, '')}`;
		});
		console.log(`Removed: ${keyStr} from ${table}`);
		callback();
	});
}

function setPage(router, entity, path, table, primaryKeys, columns) {
	var sqlAttrs = [];
	columns.forEach(function(col) {
		sqlAttrs = sqlAttrs.concat(Object.keys(col.attrs));
	});

	var pKeys = Object.keys(primaryKeys);

	var htmlArgs = {
		entity: entity,
		path: path,
		searches: primaryKeys,
		columns: columns,
		initialVals: {},
		errMsg: '',
		aid: ''
	}

	router.get('/search', function(req, res, next) { // Viewing student
		var aid = db.getVal(req.query, 'AID', '');
		if (!login.adminLoggedIn(aid)) {
			res.redirect(`/admin/${aid}`);
			return;
		}

		htmlArgs['aid'] = aid;
		htmlArgs['initialVals'] = {};
		htmlArgs['errMsg'] = '';
		predicate = Array(pKeys.length).fill('??=?').join(' AND ');
		args = Array(pKeys.length * 2 + 1);
		args[0] = table;
		pKeys.forEach(function(key, i) {
			args[2*i + 1] = key;
			args[2*i + 2] = req.query[key];
		});
		var get_data = `SELECT * FROM ?? WHERE ${predicate};`;
		db.execQuery(get_data, args, function(rows) {
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
			res.render('admin_edit', htmlArgs);
		});
	});

	router.get('/', function(req, res, next) { // Not viewing student, perform operation
		var aid = db.getVal(req.query, 'AID', '');
		if (!login.adminLoggedIn(aid)) {
			res.redirect(`/admin/${aid}`);
			return;
		}

		htmlArgs['aid'] = aid;
		htmlArgs['initialVals'] = {};
		htmlArgs['errMsg'] = '';
		var vals = {};
		var missingKeys = [];
		pKeys.forEach(function(key) {
			if (db.getVal(req.query, key, '').length === 0) {
				missingKeys.push(primaryKeys[key]);
			}
		});
		if (missingKeys.length !== 0) { // Missing primary key
			htmlArgs['initialVals'] = req.query;
			if (Object.keys(req.query).length !== 0) {
				htmlArgs['errMsg'] = `Missing: ${missingKeys.join(', ')}`
			}
			res.render('admin_edit', htmlArgs);
		} else { // Have all primary keys
			// Get SQL attributes from http request
			for (let i = 0; i < sqlAttrs.length; i++) {
				var val = db.getVal(req.query, sqlAttrs[i], '');
				vals[sqlAttrs[i]] = val.length === 0 ? null : val;
			}
			if (req.query.rm === 'true') { // Remove entity
				remove(vals, table, pKeys, function() {
					htmlArgs['initialVals'] = req.query;
					htmlArgs['errMsg'] = 'Removed';
					res.render('admin_edit', htmlArgs);
				});
			} else { // Update entity
				update(vals, table, pKeys, function() {
					pathArgs = '';
					pKeys.forEach(function(key, i) {
						if (i !== 0) {
							pathArgs += '&'
						}
						pathArgs += `${key}=${vals[key]}`;
					});
					res.redirect(`/admin-edit/${path}/search?success=1&${pathArgs}`);
				});
			}
		}
	});

}

exports.setPage = setPage;
