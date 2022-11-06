function copyToClipboard(str) {
	var e = document.createElement('textarea');
	e.value = str;
	e.setAttribute('readonly', '');
	e.style = {position: 'absolute', left: '-9999px'};
	document.body.appendChild(e);
	e.select();
	document.execCommand('copy');
	document.body.removeChild(e);
}
