const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// Create route objects
var test = require('./routes/test.js');
var index = require('./routes/index.js');
var login = require('./routes/login.js');
var student = require('./routes/student.js');
var room = require('./routes/room.js');
var list = require('./routes/list.js');
var generaterooms = require('./routes/generate_rooms.js');
var roomSuiteSearch = require('./routes/room_suite_search.js');
var suite = require('./routes/suite.js');
var buildingSearch = require('./routes/building_search.js');
var building = require('./routes/building.js');
var residentialCommunity = require('./routes/residential_community.js');
var admin = require('./routes/admin.js');
var editStudent = require('./routes/edit_student.js');
var editRoom = require('./routes/edit_room.js');
var editSuite = require('./routes/edit_suite.js');
var editBuilding = require('./routes/edit_building.js');
var editCommunity = require('./routes/edit_community.js');
var roommateSearch = require('./routes/roommate_search.js');
var studentEdit = require('./routes/student_edit.js');
var administratorEdit = require('./routes/administrator_edit.js');

var app = express();
app.use(express.json());
app.use(express.static('express'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use('/', index);
app.use('/test', test);
app.use('/login', login);
app.use('/student', student);
app.use('/room', room);
app.use('/list', list);
app.use('/admin-edit/generate_rooms', generaterooms);
app.use('/search', roomSuiteSearch);
app.use('/suite', suite);
app.use('/building-search', buildingSearch);
app.use('/building', building);
app.use('/community', residentialCommunity);
app.use('/admin', admin);
app.use('/admin-edit/student', editStudent);
app.use('/admin-edit/room', editRoom);
app.use('/admin-edit/suite', editSuite);
app.use('/admin-edit/building', editBuilding);
app.use('/admin-edit/community', editCommunity);
app.use('/student/roommate-search', roommateSearch);
app.use('/user-edit/student', studentEdit);
app.use('/user-edit/admin', administratorEdit);

const server = http.createServer(app);
const port = 3000;
server.listen(port, function() {
	console.log("Server listening on port " + port);
});
