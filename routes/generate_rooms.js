const express = require('express');
const db = require('./utils/db.js');
const login = require('./utils/login.js');
const strings = require('./utils/strings.js');

function GetFormArgs(adminId){
  return {
    title: 'Generate Rooms',
    header: 'Parameters',
    fields: [
      { id: 'AID', value: adminId, type: 'hidden' },
      { id: 'building_name', name: 'Building Name', type: 'text' },
      { id: 'room_count', name: 'Number of Rooms', type: 'number' },
      { id: 'target_capacity', name: 'Target Capacity', type: 'number' },
      { id: 'average_price', name: 'Average Price', type: 'number' },
      { id: 'furniture_description', name: 'Default Furtniture Description', type: 'text' },
      { id: 'room_width', name: 'Average Room Width', type: 'number' },
      { id: 'room_length', name: 'Average Room Length', type: 'number' },
      { id: 'bed_width', name: 'Bed Width', type: 'number' },
      { id: 'bed_height', name: 'Bed Height', type: 'number' },
      { id: 'bed_length', name: 'Bed Length', type: 'number' },
    ],
    dest: 'generate_rooms',
    enterMsg: 'Generate',
    errMsg: 'Invalid Query'
  }; 
} 

var router = express.Router();
router.get('/', function(req, res, next) {
  const aid = req.query.AID;

  console.log('generate rooms page - admin: ' + aid);
  if (login.adminLoggedIn(aid)){
    const formArgs = GetFormArgs(aid);
    if (req.query.building_name === undefined){
      res.render('form', formArgs);
    }
    else{
      //res.redirect(`generate_rooms?success=1&AID=${aid}`);
      generateRooms(req.query, () => {
        formArgs['errMsg'] = 'Updated';
        res.render('form', formArgs);
      });
    }
  }
  else{
    res.sendStatus(401);
  }
});

function generateRooms(inputParams, next){
  const priceVariance = 400;
  const averagePrice = parseInt(inputParams.average_price);
  const roomHeight = 102;
  db.execQuery('SELECT building.NumFloors FROM building WHERE building.Name=?;', [inputParams.building_name], (rows) => {
    const numFloors = rows[0].NumFloors;
    let capacityLeft = parseInt(inputParams.target_capacity);
    let roomsLeft = parseInt(inputParams.room_count);
    let stepNumber = 0;
    let roomNumberOffsetOnFloor = 0;
    let lastFloor = 1;
    function generateRoomStep(){
      if (stepNumber >= inputParams.room_count){
        next();
        return;
      }
      const roomCapacity = Math.round(capacityLeft / roomsLeft);
      capacityLeft -= roomCapacity;
      roomsLeft -= 1;
      var price = Math.round(averagePrice + Math.random() * priceVariance - (priceVariance / 2));
      price *= 100; // because price is stored w first two digits as cents.
      const floor = Math.floor((stepNumber/inputParams.room_count) * numFloors) + 1;
      if (floor != lastFloor){
        roomNumberOffsetOnFloor = 0;
        lastFloor = floor;
      }
      const roomNum = floor * 100 + roomNumberOffsetOnFloor;
      db.execQuery('INSERT INTO room (Number, BuildingName, Capacity, Floor, Price, DimWidth, DimLength, DimHeight, FurnitureDesc, BedWidth, BedHeight, BedLength) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [roomNum, inputParams.building_name, roomCapacity, floor, price, inputParams.room_width, inputParams.room_length, roomHeight, inputParams.furniture_description, inputParams.bed_width, inputParams.bed_height, inputParams.bed_length], (rows) => {
        console.log(`Generated Room: ${stepNumber}, ${inputParams.building_name}, ${roomCapacity}, ${floor}`);
        stepNumber++;
        roomNumberOffsetOnFloor++;
        generateRoomStep();
      });
    }
    generateRoomStep();
  });
}

module.exports = router;
