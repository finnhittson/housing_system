const db = require('./db.js');
const rand = require('./rand.js');

// # suites/floor, start floor, end floor
const buildings = {
	Howe : [2, 2, 9],
	Alumni: [5, 2, 4],
	Tippit: [5, 2, 4],
	Staley: [2, 2, 9],
	Michelson: [4, 1, 6],
	Glaser: [4, 1, 6],
	Kusch: [4, 1, 6]
};

const hasKitchen = ['Tippit', 'Staley'];

const commonAreaDesc = 'Full Kitchen, Laundry Facilities, Lounge, Piano, and Game Table on First Floor.';
const bathroomDesc = 'One Shower, One Toilet, Two Sinks.';
const roomDesc=  'Houses one bed, one chair, one cabinet, and one dresser.';

function getLetter(i) {
	switch (i) {
		case 0: return 'A';
		case 1: return 'B';
		case 2: return 'C';
		case 3: return 'D';
		case 4: return 'E';
		case 5: return 'F';
		default: return 'A';
	}
}

function generateSuites(bname) {
	var num_suites, f1, f2;
	[num_suites, f1, f2] = buildings[bname];

	var num_floors = f2 - f1 + 1;
	var suites = Array(num_suites * num_floors * 5);
	var idx = 0;
	for (var i = f1; i <= f2; i++) {
		for (var j = 0; j < num_suites; j++) {
			suites[idx++] = 100*i+10*(j + 1);
			suites[idx++] = `${bname}`;
			suites[idx++] = bname in hasKitchen;
			suites[idx++] = commonAreaDesc;
			suites[idx++] = bathroomDesc;
		}
	}

	var rooms = Array(num_suites * num_floors * 6 * 13);
	idx = 0;
	for (var i = 0; i < suites.length; i += 5) {
		for (var j = 0; j < 6; j++) {
			rooms[idx++] = `${suites[i]}${getLetter(j)}`;
			rooms[idx++] = suites[i+1];
			rooms[idx++] = suites[i];
			rooms[idx++] = 1;
			rooms[idx++] = Math.floor(suites[i] / 100);
			rooms[idx++] = 545800;
			rooms[idx++] = 108;
			rooms[idx++] = 120;
			rooms[idx++] = 108;
			rooms[idx++] = roomDesc;
			rooms[idx++] = 39;
			rooms[idx++] = 50;				
			rooms[idx++] = 84;
		}
	}

	var valStr1 = Array(5).fill('?').join(',');
	var valStr = Array(num_suites * num_floors).fill(valStr1).join('),(');
	const add_suites = `
	INSERT INTO Suite (Number, BuildingName, HasKitchen, CommonAreaDesc, BathroomDesc)
	VALUES (${valStr});`;

	valStr1 = Array(13).fill('?').join(',');
	valStr = Array(num_suites * num_floors * 6).fill(valStr1).join('),(');
	const add_rooms = `
	INSERT INTO Room (Number, BuildingName, SuiteNum, Capacity, Floor, Price, DimWidth, DimLength, DimHeight, FurnitureDesc, BedWidth, BedHeight, BedLength)
	VALUES (${valStr})`;

	db.execQuery(add_suites, suites, (rows) => {
		console.log(`Finished ${bname} Suites`);
		db.execQuery(add_rooms, rooms, (rows) => {
			console.log(`Finished ${bname} Rooms`);
		});
	});
}

Object.keys(buildings).forEach(function(bname) {
	generateSuites(bname);
});
