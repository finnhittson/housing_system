const express = require('express');
const db = require('./utils/db.js');
const login = require('./utils/login.js');
const strings = require('./utils/strings.js');

const editPages = [
	{path: 'student', name: 'Student'},
	{path: 'room', name: 'Room'},
	{path: 'suite', name: 'Suite'},
	{path: 'building', name: 'Building'},
	{path: 'community', name: 'Residential Community'}
];

const procedurePages = [
	{ path: 'generate_rooms', name: 'Generate Building Rooms' }
]

class Admin {
	constructor(aid) {
		this.aid = aid;
		this.firstName = this.lastName = this.email = this.phone = "";
	}

	render(res) {
		res.render('admin', {
			name: strings.name(this.firstName, this.lastName),
			aid: this.aid,
			phone: strings.phone(this.phone),
			email: this.email,
			editPages: editPages,
			procedurePages: procedurePages,
			loggedIn: login.adminLoggedIn(this.aid)
		});
	}

	update(callback) {
		db.execQuery('SELECT * FROM Admin A WHERE A.AID = ?', [this.aid], (rows) => {
			this.updateVals(rows);
			callback(rows);
		});
	}

	updateVals(rows) {
		if (rows.length === 0) {
			return;
		}
		const data = rows[0];
		this.firstName = db.getVal(data, 'NameFirst', '');
		this.lastName = db.getVal(data, 'NameLast', '');
		this.email = db.getVal(data, 'Email', '');
		this.phone = db.getVal(data, 'Phone', '');
	}
}

var router = express.Router();
router.get('/:aid([0-9]+)', function(req, res, next) {
	console.log('admin: ' + req.params.aid);
	var admin = new Admin(req.params.aid);
	admin.update(function(rows) {
		admin.render(res);
	});
});

module.exports = router;
