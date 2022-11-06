const express = require('express');
const db = require('./utils/db.js');
const login = require('./utils/login.js');
const strings = require('./utils/strings.js');

const YEAR = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Senior+'];

class Student{
	constructor(sid) {
		this.sid = sid;
		this.firstName = this.lastName = this.email = this.phone = "";
		this.major = this.prefMusic = this.prefClean = "";
		this.year = this.prefBed = 0;
		this.isRA = false;
		this.roomMates = [];
		this.roomCap = 0;
		this.bname = this.rnum = "";
	}

	render(res, backSID) {
		res.render('student', {
			loggedIn: login.studentLoggedIn(this.sid),
			name: strings.name(this.firstName, this.lastName) + (this.isRA ? ' [RA]' : ''),
			sid: this.sid,
			phone: strings.phone(this.phone),
			email: this.email,
			year: YEAR[Math.min(this.year - 1, 5)],
			major: this.major,
			pref_music: this.prefMusic,
			pref_clean: this.prefClean,
			pref_bed: this.prefBed + (this.prefBed >= 10 ? ":00PM" : ":00AM"),
			roommates: this.roomMates,
			bname: this.bname,
			rnum: this.rnum,
			roomCap: this.roomCap,
			backSID: backSID
		});
	}

	update(callback) {
		var thisStudent = 'SELECT * FROM Student S WHERE S.SID = ?';
		//var roommates = 'SELECT s.SID, s.NameFirst, s.NameLast FROM (SELECT l2.RoomNum, l2.BuildingName FROM LivesIn l2 WHERE l2.SID = ?) LIRoom, LivesIn l1, Student s WHERE LIRoom.RoomNum = l1.RoomNum AND LIRoom.BuildingName = l1.BuildingName AND l1.SID != ? AND S.sid = l1.SID';
		var roommates = 'SELECT roommate.SID, roommate.NameFirst, roommate.NameLast FROM LivesIn targetLivesIn, LivesIn roommateLivesIn, Student roommate WHERE targetLivesIn.SID = ? AND targetLivesIn.RoomNum = roommateLivesIn.RoomNum AND targetLivesIn.BuildingName = roommateLivesIn.BuildingName AND roommate.SID = roommateLivesIn.SID AND targetLivesIn.SID <> roommateLivesIn.SID'; // look how much cooler this query is than the one above 😎 - nested queries cause deaths in the millions each year.
//		var population = 'SELECT count(S1.SID) FROM Student S1, LivesIn L1 WHERE S1.SID = L1.SID AND L1.RoomNum = R.Number AND L1.BuildingName = R.BuildingName';
		var getRoom = `SELECT R.Number, R.BuildingName, R.Capacity FROM Room R, LivesIn L WHERE L.RoomNum = R.Number AND L.BuildingName = R.BuildingName AND L.SID = ?`;
		db.execQueries([thisStudent, roommates, getRoom],
			[[this.sid], [this.sid, this.sid], [this.sid]],
			(rows) => {
				this.updateVals(rows[0]);
				this.updateRoommates(rows[1]);
				this.updateRoom(rows[2])
				callback();
			}
		);
	}

	updateRoommates(rows) {
		if (rows.length === 0) {
			return;
		}
		this.roomMates = [];
		rows.forEach((data) => {
			this.roomMates.push({
				'sid':db.getVal(data, 'SID', 0),
				'name':db.getVal(data, 'NameFirst', '') + ' ' + db.getVal(data,'NameLast', '')
			});
			console.log(this.roomMates[this.roomMates.length - 1]["name"]);
		});
	}

	updateRoom(rows) {
		if (rows.length === 0) {
			this.bname = this.rnum = '';
			this.roomCap = 0;
			return;
		}
		var data = rows[0];
		this.bname = db.getVal(data, 'BuildingName', '');
		this.rnum = db.getVal(data, 'Number', '');
		this.roomCap = db.getVal(data, 'Capacity', 0);
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
		this.year = db.getVal(data, 'Year', '');
		this.major = db.getVal(data, 'Major', '');
		this.prefMusic = db.getVal(data, 'PrefMusic', '');
		this.prefClean = db.getVal(data, 'PrefCleanliness', '');
		this.prefBed = db.getVal(data, 'PrefBedtime', 0);
		this.isRA = db.getVal(data, 'IsRA', 0) != 0;
	}
}

var router = express.Router();
router.get('/:sid([0-9]+)', function(req, res, next) {
	console.log(`student: ${req.params.sid}`);
	var student = new Student(req.params.sid);
	student.update(function(results) {
		student.render(res, req.query ? req.query.backSID : undefined);
	});
});

module.exports = router;
