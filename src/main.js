var Scream = require('Scream');
var Brim = require('Brim');

document.addEventListener('touchstart', function(e){
	var y = e['targetTouches'][0]['clientY'],
		x = e['targetTouches'][0]['clientX'];

	if (screen.height - x <= 48 && y <= 48) {
		document.getElementById('brim-mask').className = 'mask-cancel';
	}
});

window.addEventListener("orientationchange", function() {
	document.getElementById('brim-mask').className = "";
});

var scream,
	brim;

scream = Scream({
	width: {
		portrait: screen.width,
		landscape: screen.height
	}
});

brim = Brim({
	viewport: scream
});

scream.on('orientationchangeend', function() {
	if (scream.getOrientation() == 'portrait'){
		document.getElementById('brim-mask').className = "";
	}
});