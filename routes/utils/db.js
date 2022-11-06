const _async = require('async');
const mysql2 = require('mysql2');
const assert = require('assert');

var pool = mysql2.createPool({
	connectionLimit : 100,
	host		: 'localhost',
	user		: '341User',
	password	: 'Ay18ih2brx[)@4bM)yfm',
	database	: 'CSDS341',
	port		: 3306
});

function execQuery(query, args, callback) {
    pool.query(query, args, function(err, rows, fields) {
		if (err) {
			console.log(`Error Executing SQL Query: ${query}`);
	        console.log(err);
		} else {
			callback(rows);
		}
	});
}

function execQueries(queries, args, callback) {
	assert(queries.length === args.length,
		'Error Executing SQL Queries: unequal number of SQL queries and arguments');
	var pairs = queries.map(function(query, idx) {
		return [query, args[idx]];
	});
	pool.getConnection(function(err, connection) {
		_async.map(pairs, function(pair, callback) {
			connection.query(pair[0], pair[1], callback);
		}, function(err, res) {
			connection.release();
			if (err) {
				console.log(`Error Executing SQL Queries: ${queries.join(', ')}`);
				console.log(err);
			} else {
				callback(res);
			}
		});
	});
}

function getVal(dict, key, def_val) {
	var res = dict[key];
	return (typeof res === 'undefined' || res === null) ? def_val : res;
}

const BUILDING_NAME_MATCH = "[a-zA-Z%20]+";
exports.BUILDING_NAME_MATCH = BUILDING_NAME_MATCH;

const ROOM_NAME_MATCH = "[0-9a-zA-Z]+";
exports.ROOM_NAME_MATCH = ROOM_NAME_MATCH;

const ALPHABETIC_MATCH = "[a-zA-Z]+";
exports.ALPHABETIC_MATCH = ALPHABETIC_MATCH;

exports.execQuery = execQuery;
exports.execQueries = execQueries;
exports.getVal = getVal;
