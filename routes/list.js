const express = require('express');
const db = require('./utils/db.js');

class List {
	constructor(table) {
    this.table = table;
	}

	render(res, listData) {
		res.render('list', {
			name: tableToNameMap[this.table],
      listData: listData
		});
	}

	update(callback) {
		var getRoom = 'SELECT * FROM Room R WHERE R.Capacity > (SELECT count(S.SID) FROM Student S, LivesIn L WHERE S.SID = L.SID AND L.RoomNum = R.Number AND L.BuildingName = R.BuildingName)';
		var queryArgs = [];
		db.execQuery(getRoom, queryArgs, (rows) => {
      const listData = [];
      for (const row of rows){
        listData.push({ name: `${row.BuildingName} ${row.Number}`, url: `/room/${row.BuildingName}-${row.Number}`})
      }
			callback(listData);
		});
	}
}
var router = express.Router();

const tableToNameMap = {
	room: "Room"
}

router.get(`/:data((${db.ALPHABETIC_MATCH}))`, function(req, res, next) {
	console.log(`list: ${req.params.data}`);
	var room = new List(req.params.data);
	room.update(function(rows) {
    console.log(rows[0]);
    console.log(rows[1]);
		room.render(res, rows);
	});
});

module.exports = router;
