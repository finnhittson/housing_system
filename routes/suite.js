const express = require('express');
const db = require('./utils/db.js');

class Suite {
	constructor(number, bname) {
		this.num = number;
		this.bname = bname;
		this.hasKitchen = false;
		this.commonAreaDesc = this.bathDesc = '';
		this.cap = this.minPrice = this.maxPrice = 0;
		this.floors = [];
		this.rooms = [];
	}

	render(res) {
		res.render('suite', {
			num: this.num,
			bname: this.bname,
			rooms: this.rooms,
			kitchen: this.hasKitchen ? 'Yes' : 'No',
			cap: this.cap,
			floors: 'Floor' + (this.floors.length > 1 ? 's ' : ' ') + this.floors.join(', '),
			minPrice: this.minPrice / 100.0,
			maxPrice: this.maxPrice / 100.0,
			commonAreaDesc: this.commonAreaDesc,
			bathDesc: this.bathDesc
		});
	}
	
	updateSuite(rows) {
		if (rows.length === 0) {
			return;
		}
		const data = rows[0];
		this.hasKitchen = db.getVal(data, 'HasKitchen', false);
		this.commonAreaDesc = db.getVal(data, 'CommonAreaDesc', '');
		this.bathDesc = db.getVal(data, 'BathroomDesc', '');
	}

	updateRooms(rows) {
		if (rows.length === 0) {
			return;
		}
		this.cap = 0;
		this.rooms = [];
		this.floors = [];
		this.minPrice = Number.MAX_VALUE;
		this.maxPrice = Number.MIN_VALUE;
		rows.forEach((row) => { 
			this.cap += db.getVal(row, 'Capacity', 0);
			this.rooms.push(db.getVal(row, 'Number', ''));
			this.floors.push(db.getVal(row, 'Floor', -1));
			var price = db.getVal(row, 'Price', -1);
			if (price < this.minPrice) { this.minPrice = price; }
			if (price > this.maxPrice) { this.maxPrice = price; }
		});
		this.floors = [...new Set(this.floors)];
	}

	update(callback) {
		var getSuite = 'SELECT * FROM Suite S WHERE S.Number = ? AND S.BuildingName = ?;';
		var getRooms = 'SELECT * FROM Room R WHERE R.SuiteNum = ? AND R.BuildingName = ?;';
		var queryArgs = [this.num, this.bname];
		db.execQueries([getSuite, getRooms], [queryArgs, queryArgs], (rows) => {
			this.updateSuite(rows[0]);
			this.updateRooms(rows[1]);
			callback(rows);
		});
	}
}

var router = express.Router();
router.get('/:bname([a-zA-Z]+)-:num([0-9a-zA-Z]+)', function(req, res, next) {
	console.log(`suite: ${req.params.bname} ${req.params.num}`);
	var suite = new Suite(req.params.num, req.params.bname);
	suite.update(function(results) {
		suite.render(res);
	});
});

module.exports = router;
