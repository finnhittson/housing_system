const express = require('express');
const db = require('./utils/db.js');
const strings = require('./utils/strings.js');

class ResidentialCommunity{
	constructor(name) {
		this.name = name;
	    this.directorFName = '';
	    this.directorLName = '';
	    this.directorPhone = '';
	    this.officePhone = '';
	    this.officeEmail = '';
	    this.officeAddress = '';
		this.buildings = [];
	}

	render(res) {
		res.render('residential_community', {
			name: this.name,
			directorName: strings.name(this.directorFName, this.directorLName),
			directorPhone: strings.phone(this.directorPhone),
			officePhone: strings.phone(this.officePhone),
			officeEmail: this.officeEmail,
			officeAddress: this.officeAddress,
			buildings: this.buildings
		});
	}
	
	updateResidentialCommunity(rows) {
		if (rows.length === 0) {
			return;
		}
		const data = rows[0];
		this.directorFName = db.getVal(data, 'DirectorFName', '');
		this.directorLName = db.getVal(data, 'DirectorLName', '');
		this.directorPhone = db.getVal(data, 'DirectorPhone', '');
		this.officePhone = db.getVal(data, 'OfficePhone', '');
	    this.officeEmail = db.getVal(data, 'OfficeEmail', '');
	    this.officeAddress = db.getVal(data, 'OfficeAddress', '');
	}

	updateBuildings(rows) {
		this.buildings = [];
		rows.forEach((row) => {
			this.buildings.push(db.getVal(row, 'BuildingName', ''));
		});
	}

	update(callback) {
		var getResidentialCommunity = "SELECT * FROM ResidentialCommunity RC WHERE RC.Name = ?;";
		var getBuildings = "SELECT M.BuildingName FROM MemberOf M WHERE M.CommunityName = ?;";
		var queryArgs = [this.name];
		db.execQueries([getResidentialCommunity, getBuildings], [queryArgs, queryArgs], (res) => {
			this.updateResidentialCommunity(res[0]);
			this.updateBuildings(res[1]);
			callback(res);
		});
	}
}

var router = express.Router();
router.get('/:name([a-zA-Z%20]+)', function(req, res, next) {
	console.log('residential community: ' + req.params.name);
	var residentialCommunity = new ResidentialCommunity(req.params.name);
	residentialCommunity.update(function(result) {
		residentialCommunity.render(res);
	});
});

module.exports = router;
