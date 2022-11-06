const express = require('express');
const rand_name = require('random-name');
const rand = require('./utils/rand');
const db = require('./utils/db.js');

const alpha = Array.from(Array(26)).map((e, i) => i+65);
const alphabet = alpha.map((x) => String.fromCharCode(x));

const majors = ['Computer Science', 'Physics', 'Chemistry', 'Biology', 'Electrical Engineering'];
const musics = ['N/A', 'None', 'Pop', 'Rock', 'Jazz', 'Funk', 'Reggae'];
const bedtimes = [10, 11, 12, 1, 2];
const cleans = ['Clean', 'Lived-In', 'Messy'];
function randStudent() {
	var sid = rand.randInt(10000);
	var password = rand_name.place();
	var name_first = rand_name.first();
	var name_last = rand_name.last();
	var phone = rand.randPhone();
	var email = name_first.substring(0,1) + name_last + rand.randInt(1000).toString() + '@gmail.com';
	var isRA = rand.randInt(100) === 0;
	var year = rand.randInt(100) == 0 ? 5 : rand.randRange(1, 4);
	var major = rand.randChoice(majors);
	var pref_music = rand.randChoice(musics);
	var pref_bedtime = rand.randChoice(bedtimes);
	var pref_clean = rand.randChoice(cleans);

	var query = 'INSERT INTO Student VALUES (?,?,?,?,?,?,?,?,?,?,?,?);';
	var queryArgs = [sid, password, name_first, name_last, phone, email,
		isRA, year, major, pref_music, pref_bedtime, pref_clean];
	db.execQuery(query, queryArgs, function(rows) {
		console.log(`Added: ${name_first} ${name_last}`);
	});
}

const dims = [[], [115, 119, 100], [122, 193, 100]];
function randRoom() {
	var num = rand.randInt(10000);
	var suiteNum = null;
	var cap = rand.randRange(1, 2);
	var price = rand.randRange(4000, 7500);
	var dimW, dimL, dimH;
	[dimW, dimL, dimH] = dims[cap];
	var furnDesc = 'Couches.';
	var bedW = 100, bedL = 33, bedH = 50;

	var buildingQuery = 'SELECT B.Name, B.NumFloors FROM Building B;';
	db.execQuery(buildingQuery, [], function(rows) {
		if (rows.length > 0) {
			var dict = rand.randChoice(rows);
			var bname = db.getVal(dict, 'Name', '');
			var floor = rand.randRange(1, db.getVal(dict, 'NumFloors', 0));
			var query = 'INSERT INTO Room VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);';
			var queryArgs = [num, bname, suiteNum, cap, floor, price,
				dimW, dimL, dimH, furnDesc, bedW, bedL, bedH];
			db.execQuery(query, queryArgs, function(rows) {
				console.log(`Added: ${bname} ${num}`);
			});
		}
	});
}

function randSuiteRoom(snum, rnum, bname, floor) {
	var cap = rand.randRange(1, 2);
	var price = rand.randRange(4000, 7500);
	var dimW, dimL, dimH;
	[dimW, dimL, dimH] = dims[cap];
	var furnDesc = 'Sleep on the floor.';
	var bedW = 100, bedL = 33, bedH = 50;

	var query = 'INSERT INTO Room VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);';
	var queryArgs = [rnum, bname, snum, cap, floor, price,
		dimW, dimL, dimH, furnDesc, bedW, bedL, bedH];
	db.execQuery(query, queryArgs, function(rows) {});
}

function randSuite() {
	var num = rand.randInt(10000);
	var hasKitchen = rand.randInt(1) == 0 ? false : true;
	var commonAreaDesc = 'TV is brroken.';
	var bathDesc = 'Two showers, no toilets.';

	var buildingQuery = 'SELECT B.Name, B.NumFloors FROM Building B;';
	db.execQuery(buildingQuery, [], function(rows) {
		if (rows.length > 0) {
			var dict = rand.randChoice(rows);
			var bname = db.getVal(dict, 'Name', '');
			var query = 'INSERT INTO Suite VALUES (?,?,?,?,?);';
			var queryArgs = [num, bname, hasKitchen, commonAreaDesc, bathDesc];
			db.execQuery(query, queryArgs, function(rows) {
				var floor = rand.randRange(1, db.getVal(dict, 'NumFloors', 0));
				var ub = rand.randRange(3, 9);
				for (let i = 0; i < ub; i++) {
					randSuiteRoom(num, `${num}${alphabet[i]}`, bname, floor);
				}
				console.log(`Added: ${bname} ${num}`);
			});
		}
	});

}

function randBuilding() {
	var name = rand_name.place();
	var address = rand.randAddress();
	var numFloors = rand.randRange(8, 13);
	var utilDesc = 'Sink is partially clogged.';
	var buildingDesc = 'Massive common area.';
	var floorPlan = `${name}_floorplan.txt`;

	var query = 'INSERT INTO Building VALUES (?,?,?,?,?,?);';
	var queryArgs = [name, address, numFloors, utilDesc, buildingDesc, floorPlan];
	db.execQuery(query, queryArgs, function(rows) {
		console.log(`Added: ${name}`);
	});
}

function randCommunity() {
	var name = rand_name.place();
	var dirFName = rand_name.first();
	var dirLName = rand_name.last();
	var dirPhone = rand.randPhone();
	var officePhone = rand.randPhone();
	var officeEmail = `${name}@gmail.com`;
	var officeAddr = rand.randAddress();

	var query = 'INSERT INTO ResidentialCommunity VALUES (?,?,?,?,?,?,?);';
	var queryArgs = [name, dirFName, dirLName, dirPhone, officePhone, officeEmail, officeAddr];
	db.execQuery(query, queryArgs, function(rows, field) {
		console.log(`Added: ${name}`);
	});
}

function randLivesIn() {
	var getLivesIn = `SELECT R1.Number FROM Room R1, LivesIn L1 WHERE L1.SID = S.SID AND L1.RoomNum = R1.Number
		AND L1.BuildingName = R1.BuildingName`;
	var getOccupancy = `SELECT count(S2.SID) FROM Student S2, LivesIn L2 WHERE L2.SID = S2.SID AND L2.RoomNum = R.Number
		AND L2.BuildingName = R.BuildingName`;
	var randQuery = `SELECT S.NameFirst, S.NameLast, S.SID, R.Number, R.BuildingName FROM Student S, Room R WHERE NOT EXISTS (${getLivesIn})
		AND (${getOccupancy}) < R.Capacity;`;
	db.execQuery(randQuery, [], function(rows) {
		if (rows.length > 0) {
			var dict = rand.randChoice(rows);
			var name = `${db.getVal(dict, 'NameFirst', '')} ${db.getVal(dict, 'NameLast', '')}`;
			var sid = db.getVal(dict, 'SID', 0);
			var rnum = db.getVal(dict, 'Number', 0);
			var bname = db.getVal(dict, 'BuildingName', '');
			var query = 'INSERT INTO LivesIn VALUES (?,?,?);';
			var queryArgs = [sid, rnum, bname];
			db.execQuery(query, queryArgs, function(rows) {
				console.log(`Added: ${name} in ${bname} ${rnum}`);
			});
		}
	});
}

function randMemberOf() {
	var getMemberOf = 'SELECT M1.BuildingName FROM MemberOf M1 WHERE M1.BuildingName = B.Name';
	var randBuilding = `SELECT B.Name FROM Building B WHERE NOT EXISTS (${getMemberOf});`;
	var randComm = 'SELECT RC.Name FROM ResidentialCommunity RC;'
	db.execQueries([randBuilding, randComm], [[], []], function(res) {
		if (res[0].length > 0 && res[1].length > 0) {
			var dict = rand.randChoice(res[0]);
			var bname = db.getVal(dict, 'Name', '');
			dict = rand.randChoice(res[1]);
			var cname = db.getVal(dict, 'Name', '');
			var query = 'INSERT INTO MemberOf VALUES (?,?);';
			var queryArgs = [bname, cname];
			db.execQuery(query, queryArgs, function(rows) {
				console.log(`Added: ${bname} into ${cname}`);
			});
		}
	});
}


var router = express.Router();
router.get('/', function(req, res, next) {
	if (req.query.what !== undefined) {
		console.log(`test: ${req.query.what}`);
	}
	switch (req.query.what) {
		case 'add-rand-student':
			randStudent();
			res.redirect('/');
			break;
		case 'visit-rand-student':
    		db.execQuery('SELECT S.SID FROM Student S;', [], function(rows) {
				if (rows.length === 0) {
					res.redirect('/');
				} else {
	            	var sid = db.getVal(rand.randChoice(rows), 'SID', 0);
	            	res.redirect(`/student/${sid}`);
				}
        	});
			break;
		case 'add-rand-room':
			randRoom();
			res.redirect('/');
			break;
		case 'visit-rand-room':
			db.execQuery('SELECT R.Number, R.BuildingName FROM Room R;', [], function(rows) {
				if (rows.length === 0) {
					res.redirect('/');
				} else {
					var dict = rand.randChoice(rows);
					var rnum = db.getVal(dict, 'Number', 0);
					var bname = db.getVal(dict, 'BuildingName', '');
					res.redirect(`/room/${bname}-${rnum}`);
				}
			});
			break;
		case 'add-rand-suite':
			randSuite();
			res.redirect('/');
			break;
		case 'visit-rand-suite':
			db.execQuery('SELECT S.Number, S.BuildingName FROM Suite S;', [], function(rows) {
				if (rows.length === 0) {
					res.redirect('/');
				} else {
					var dict = rand.randChoice(rows);
					var snum = db.getVal(dict, 'Number', 0);
					var bname = db.getVal(dict, 'BuildingName', '');
					res.redirect(`/suite/${bname}-${snum}`);
				}
			})
			break;
		case 'add-rand-building':
			randBuilding();
			res.redirect('/');
			break;
		case 'visit-rand-building':
			db.execQuery('SELECT B.Name FROM Building B;', [], function(rows) {
				if (rows.length === 0) {
					res.redirect('/');
				} else {
					var bname = db.getVal(rand.randChoice(rows), 'Name', '');
					res.redirect(`/building/${bname}`);
				}
			});
			break;
		case 'add-rand-community':
			randCommunity();
			res.redirect('/');
			break;
		case 'visit-rand-community':
			db.execQuery('SELECT RC.Name FROM ResidentialCommunity RC;', [], function(rows) {
				if (rows.length === 0) {
					res.redirect('/');
				} else {
					var rcname = db.getVal(rand.randChoice(rows), 'Name', '');
					res.redirect(`/community/${rcname}`);
				}
			});
			break;
		case 'add-rand-livesin':
			randLivesIn();
			res.redirect('/');
			break;
		case 'add-rand-memberof':
			randMemberOf();
			res.redirect('/');
			break;
		default:
			res.redirect('/');
			break;
	};
});

module.exports = router;
