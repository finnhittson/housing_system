const express = require('express');
const db = require('./utils/db.js');
const login = require('./utils/login.js');
const strings = require('./utils/strings.js');

class Room {
	constructor(number, bname) {
		this.num = number;
		this.bname = bname;
		this.suiteNum = -1;
		this.cap = this.floor = this.price = 0;
		this.dimW = this.dimL = this.dimH = 0;
		this.bedW = this.bedL = this.bedH = 0;
		this.furnDesc = '';
		this.canJoinRoom = false;
	}

	render(res) {
		console.log("render can join room: " + this.canJoinRoom);
		res.render('room', {
			canJoinRoom: this.canJoinRoom,
			notificationMsg: this.notificationMsg,
			num: this.num,
			bname: this.bname,
			suiteNum: this.suiteNum,
			cap: this.cap,
			floor: this.floor,
			price: this.price / 100.0,
			dimW: strings.inToFt(this.dimW),
			dimL: strings.inToFt(this.dimL),
			dimH: strings.inToFt(this.dimH),
			bedW: strings.inToFt(this.bedW),
			bedL: strings.inToFt(this.bedL),
			bedH: strings.inToFt(this.bedH),
			furnDesc: this.furnDesc
		});
	}
	
	updateRoom(rows) {
		if (rows.length === 0) {
			return;
		}
		const data = rows[0];
		this.suiteNum = db.getVal(data, 'SuiteNum', -1);
		this.cap = db.getVal(data, 'Capacity', 0);
		this.floor = db.getVal(data, 'Floor', 0);
		this.price = db.getVal(data, 'Price', 0);
		this.dimW = db.getVal(data, 'DimWidth', 0);
		this.dimL = db.getVal(data, 'DimLength', 0);
		this.dimH = db.getVal(data, 'DimHeight', 0);
		this.bedW = db.getVal(data, 'BedWidth', 0);
		this.bedL = db.getVal(data, 'BedLength', 0);
		this.bedH = db.getVal(data, 'BedHeight', 0);
		this.furnDesc = db.getVal(data, 'FurnitureDesc', '');
	}

	update(callback) {
		var getRoom = 'SELECT * FROM Room R WHERE R.Number = ? AND R.BuildingName = ?';
		var queryArgs = [this.num, this.bname];
		db.execQuery(getRoom, queryArgs, (rows) => {
			this.updateCanJoinRoom(() => {
				this.updateRoom(rows);
				callback(rows);
			});
		});
	}

	updateCanJoinRoom(callback){
		this.canJoinRoom = false;
		console.log("update can join room: " + this.canJoinRoom);
		if (login.studentLoggedIn(login.getCurrentStudent())){
			var getRoom = 'SELECT * FROM Room R WHERE R.BuildingName = ? AND R.Number = ? AND R.Capacity > (SELECT count(S.SID) FROM Student S, LivesIn L WHERE S.SID = L.SID AND L.RoomNum = R.Number AND L.BuildingName = R.BuildingName)';
			var queryArgs = [this.bname, this.num];
			db.execQuery(getRoom, queryArgs, (rows) => {
				if (rows.length > 0){ // if room exists past filter
					console.log(`room has enough capacity - ${rows.length} -- ${this.bname}, ${this.num}`);
					db.execQuery('SELECT * FROM livesin WHERE SID = ?;', [login.getCurrentStudent()], (rows) => {
						console.log("user rooms count: " + rows.length);
						this.canJoinRoom = rows.length == 0 && login.studentLoggedIn(login.getCurrentStudent());
						callback();
						return;
					});
				}
				else{
					callback();
				}
			});
		}
		else{
			callback();
		}
	}
}

var router = express.Router();
router.get(`/:bname(${db.BUILDING_NAME_MATCH})-:number(${db.ROOM_NAME_MATCH})`, function(req, res, next) {
	console.log(`room: ${req.params.bname} ${req.params.number}`);
	console.log(`current student: ${login.getCurrentStudent()}`);
	var room = new Room(req.params.number, req.params.bname);
	room.update(function(rows) {
		room.render(res);
	});
});

router.get(`/:bname(${db.BUILDING_NAME_MATCH})-:number(${db.ROOM_NAME_MATCH})/join`, function(req, res, next) {
	console.log(`join room: ${req.params.bname} ${req.params.number}`);
	if (login.studentLoggedIn(login.getCurrentStudent())){
		var room = new Room(req.params.number, req.params.bname);
		db.execQuery('INSERT INTO livesin (SID, BuildingName, RoomNum) values(?, ?, ?);', [login.getCurrentStudent(), req.params.bname, req.params.number], (rows) => {
			room.notificationMsg = "Successfully joined!";
			room.update(function(_) {
				room.render(res);
			});
		});
	}
});

module.exports = router;
