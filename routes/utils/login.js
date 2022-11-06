const db = require('./db.js');

var curStudent = '';

const s_exists = 'SELECT S.SID FROM Student S WHERE S.SID = ? AND S.Password = ?;';
exports.loginStudent = function(sid, pwd, callback) {
	db.execQuery(s_exists, [sid, pwd], (rows) => {
		if (rows.length === 0) {
			curStudent = '';
			callback(false);
		} else {
			curStudent = sid;
			callback(true);
		}
	});
}

exports.studentLoggedIn = function(sid) {
	return curStudent !== '' && curStudent === sid;
}

exports.logoutStudent = function() {
	curStudent = '';
}

exports.getCurrentStudent = function() {
	return curStudent;
}

var curAdmin = '';

const a_exists = 'SELECT A.AID FROM Admin A WHERE A.AID = ? AND A.Password = ?;';
exports.loginAdmin = function(aid, pwd, callback) {
	db.execQuery(a_exists, [aid, pwd], (rows) => {
		if (rows.length === 0) {
			curAdmin = '';
			callback(false);
		} else {
			curAdmin = aid;
			callback(true);
		}
	});
}

exports.adminLoggedIn = function(aid) {
	return curAdmin !== '' && curAdmin === aid;
}

exports.logoutAdmin = function() {
	curAdmin = '';
}

exports.getCurrentAdmin = function() {
	return curAdmin;
}
