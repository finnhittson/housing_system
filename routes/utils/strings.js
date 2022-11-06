function name(first, last) {
	return `${first} ${last}`;
}

function phone(phone) {
	return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
}

function inToFt(inches) {
	return `${Math.round(inches/12)}'${(inches%12)}"`;
}


exports.name = name;
exports.phone = phone;
exports.inToFt = inToFt;
