var Scream = require('Scream');
var Brim = require('Brim');

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

// Allows user to cancel swipeup
var cancelButton = document.getElementById("swipe-cancel");
document.addEventListener('click', function(e){
  document.getElementById('brim-mask').className = 'mask-cancel';
});

// If cancel is clicked, this resets the cancel on orientation change
window.addEventListener("orientationchange", function() {
  document.getElementById('brim-mask').className = "";
});

