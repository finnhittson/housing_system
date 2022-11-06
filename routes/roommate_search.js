const express = require('express');

const db = require('./utils/db.js');

const validName = 'SELECT * FROM Student s WHERE s.SID != ? AND NOT EXISTS(SELECT * FROM LivesIn l WHERE l.sid = s.sid)';
const scoreQuery = 'SELECT * FROM Student s WHERE s.SID = ?';
var roomlessStudents = [];

var router = express.Router();
router.get('/:sid([0-9]+)', async function(req, res, next) {
	var ejsArgs = {
		header: 'Available Roomates',
		fields: [
			{id: 'bname', name: 'Building Name', type: 'test'}
		],
		dest: '/roommate-search',
		enterMsg: 'Search',
		errMsg: 'Invalid Query'
	};

	db.execQueries([validName, scoreQuery], [[req.params.sid], [req.params.sid]], function(rows) {
	  if (rows[0].length === 0 || rows[1].length === 0) {
			res.redirect(`/student/${req.params.sid}`);
			return;
		}
		this.roomlessStudents = [];
		var myMusicPref = db.getVal(rows[1][0], "PrefMusic", ' ');
		var myCleanPref = db.getVal(rows[1][0], "PrefCleanliness", ' ');
		var myPrefBedtime = db.getVal(rows[1][0], "PrefBedtime", -1);

	  rows[0].forEach((data) => {
			var score = 0;

			if (myMusicPref === db.getVal(data, "PrefMusic", '')) {
				score++;
			}
			if (myCleanPref === db.getVal(data, "PrefCleanliness", '')) {
				score++;
			}
			if (myPrefBedtime === db.getVal(data, "PrefBedtime", 0)) {
				score++;
			}

			this.roomlessStudents.push({
	      sid: db.getVal(data, 'SID', 0),
				name: `${db.getVal(data, 'NameFirst', 0)} ${db.getVal(data, 'NameLast', 0)}`,
				score: score
	    });
			//console.log(this.roomlessStudents[this.roomlessStudents.length - 1]["name"]);
		});
		this.roomlessStudents.sort(function(a, b) {
			return a.score < b.score ? 1 : b.score < a.score ? -1 : 0;
		});
		this.roomlessStudents.splice(30);
		res.render("roommate_search", {
			sid: req.params.sid
		});
	});
});

module.exports = router;
