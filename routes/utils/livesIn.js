const db = require('./db.js');
const rand = require('./rand.js');

const get_students = `
SELECT S.SID
FROM Student S WHERE not exists (
  SELECT L.SID
  FROM LivesIn L
  WHERE L.SID = S.SID
);`;

const get_rooms = `
SELECT R.Number, R.BuildingName
FROM Room R
WHERE R.Capacity > (
  SELECT count(S.SID)
  FROM Student S, LivesIn L
  WHERE S.SID = L.SID AND L.RoomNum = R.Number AND L.BuildingName = R.BuildingName
);`;

function generateRoomAssignments() {
	db.execQueries([get_students, get_rooms], [[],[]], (results) => {
		var students = results[0];
		var rooms = results[1];

		var to_add = [];
		var num_added = 0;
		const len = Math.min(students.length, rooms.length);
		for (var i = 0; i < len; i++) {
			if (rand.randInt(2) == 1) {
				var idx = rand.randInt(students.length);
				to_add.push(students[idx]['SID']);
				to_add.push(rooms[i]['Number']);
				to_add.push(rooms[i]['BuildingName']);
				num_added++;
				students.splice(idx, 1);
			}
		}

		arg_str = Array(num_added).fill('?,?,?').join('),(')
		const assign = `
		INSERT INTO LivesIn (SID, RoomNum, BuildingName)
		VALUES (${arg_str});
		`;

		db.execQuery(assign, to_add, (rows) => {
			console.log('Finished');
		});
	});
}

generateRoomAssignments();
