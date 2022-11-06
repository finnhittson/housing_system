const rand_name = require('random-name');

function randRange(a, b) {
	return Math.floor(Math.random()*(b-a+1)) + a;
}

function randInt(b) {
	return randRange(0, b-1);
}

function randChoice(arr) {
	return arr[randInt(arr.length)];
}

const phone_len = 10;
function randPhone() {
	var phone = randInt(Math.pow(10, phone_len)).toString();
	return Array(phone_len - phone.length + 1).join("0") + phone;
}

const directions = ['N', 'S', 'W', 'E', ''];
const streets = ['St', 'Ln', 'Way', 'Blvd', 'Rd'];
function randAddress() {
	return `${randRange(1000, 99999)} ${randChoice(directions)} ${rand_name.place()} ${randChoice(streets)}
		Cleveland, OH ${randRange(10000, 99999)}`;
}

exports.randRange = randRange;
exports.randInt = randInt;
exports.randChoice = randChoice;
exports.randPhone = randPhone;
exports.randAddress = randAddress;
