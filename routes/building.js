const express = require('express');
const db = require('./utils/db.js');

class Building{
	constructor(name) {
		this.name = name;
	    this.address = '';
	    this.numFloors = 0;
	    this.numRooms = 0;
	    this.capacity = 0;
	    this.utilitiesDescription = '';
	    this.buildingDescription = '';
	    this.floorPlanFName = '';
		this.residentialCommunity = '';
		this.RAs = [];
	}

	render(res, roomErr=false, suiteErr=false) {
		res.render('building', {
			name: this.name,
			address: this.address,
			numFloors: this.numFloors,
			numRooms: this.numRooms,
			capacity: this.capacity,
			utilitiesDescription: this.utilitiesDescription,
			buildingDescription: this.buildingDescription,
			floorPlanFName: this.floorPlanFName,
			residentialCommunity: this.residentialCommunity,
			RAs: this.RAs,
			RoomSearchFormArgs: {
				header: `Search Rooms in ${this.name}`,
				fields: [
					{id: 'room', name: 'Room Number', type: 'text'}
				],
				dest: `/building/${this.name}/search`,
				enterMsg: 'Search',
				errMsg: roomErr ? 'Invalid Room Number' : ''
			},
			SuiteSearchFormArgs: {
				header: `Search Suites in ${this.name}`,
				fields: [
					{id: 'suite', name: 'Suite Number', type: 'text'}
				],
				dest: `/building/${this.name}/search`,
				enterMsg: 'Search',
				errMsg: suiteErr ? 'Invalid Suite Number' : ''
			}
		});
	}
	
	updateBuilding(rows) {
		if (rows.length === 0) {
			return;
		}
		const data = rows[0];
		this.password = db.getVal(data, 'Password', '');
		this.address = db.getVal(data, 'Address', '');
		this.numFloors = db.getVal(data, 'NumFloors', '');
		this.utilitiesDescription = db.getVal(data, 'UtilDesc', '');
		this.buildingDescription = db.getVal(data, 'BuildingDesc', '');
		this.floorPlanFName = db.getVal(data, 'FloorPlanFile', '');
	}

	updateResidentialCommunity(rows) {
		if (rows.length === 0) {
			return;
		}
		const data = rows[0];
		this.residentialCommunity = db.getVal(data, 'ResidentialCommunityName', 0);
	}

	updateRooms(rows) {
		if (rows.length === 0) {
			return;
		}
		const data = rows[0];
		this.numRooms = db.getVal(data, 'NumRooms', 0);
		this.capacity = db.getVal(data, 'Capacity', 0);
	}

	updateRAs(rows){
		if (rows.length === 0) {
			return;
		}
		const data = rows[0];
		this.RAs = [];
		rows.forEach((data) => {
			this.RAs.push({
				'sid': db.getVal(data, 'SID', 0),
				'name': `${db.getVal(data, 'NameFirst', '')} ${db.getVal(data,'NameLast', '')}`
			});
			console.log("Last RA Example: " + this.RAs[this.RAs.length - 1]["name"]);
		});
	}

	update(callback) {
		var getBuilding = "SELECT * FROM Building B WHERE B.Name = ?";
		var getRooms = "SELECT count(R.Number) AS NumRooms, sum(R.Capacity) AS Capacity FROM Room R WHERE R.BuildingName = ?";
		var getResidentialCommunity = "SELECT M.CommunityName AS ResidentialCommunityName FROM MemberOf M WHERE M.BuildingName = ?";
		var getRAs = 'SELECT s.SID, s.NameFirst, s.NameLast FROM LivesIn l, Student s WHERE l.BuildingName = ? AND l.SID = s.SID AND s.IsRA = true;';
		var queryArgs = [this.name];
		db.execQueries([getBuilding, getRooms, getResidentialCommunity, getRAs], [queryArgs, queryArgs, queryArgs, queryArgs], (res) => {
			this.updateBuilding(res[0]);
			this.updateRooms(res[1]);
			this.updateResidentialCommunity(res[2]);
			this.updateRAs(res[3]);
			callback(res);
		});
	}
}

var router = express.Router();
router.get(`/:name(${db.BUILDING_NAME_MATCH})/`, function(req, res, next) {
	console.log(`building: ${req.params.name}`);
	var building = new Building(req.params.name);
	building.update(function() {
		building.render(res);
	});
});

router.get(`/:name(${db.BUILDING_NAME_MATCH})/search/`, function(req, res, next) {
	console.log(`building: ${req.params.name}, search: ${req.query.suite} ${req.query.room}`);
	var query = '';
	var queryArgs = [req.params.name];
	var isRoom = true;
	if (req.query.room) {
		query = 'SELECT R.Number FROM Room R WHERE R.BuildingName = ? AND R.Number = ?;';
		queryArgs.push(req.query.room);
	} else if (req.query.suite) {
		query = 'SELECT S.Number FROM Suite S WHERE S.BuildingName = ? AND S.Number = ?;';
		queryArgs.push(req.query.suite);
		isRoom = false;
	}

	if (query) {
		db.execQuery(query, queryArgs, function(rows) {
			if (rows.length === 0) {
				var building = new Building(req.params.name);
				building.update(function(res) {
					building.render(res, isRoom, !isRoom);
				});
			} else {
				var path = isRoom ? 'room' : 'suite';
				res.redirect(`/${path}/${req.params.name}-${db.getVal(rows[0], 'Number', '')}`);
			}
		});
	} else {
		var building = new Building(req.params.name);
		building.update(function(results) {
			building.render(res);
		});
	}
});

module.exports = router;
