This uses [https://github.com/gajus/brim](https://github.com/gajus/brim) and [https://github.com/gajus/scream](https://github.com/gajus/scream) to implement a fullscreen gesture for iphones

## To build and run locally
1. npm install
2. npm run-script build
3. npm start

Go to localhost:3000

## Demo
Open http://ajbeach2.github.io/swipeup/public/ on an IOS device

## Code
```javascript
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

// If cancel is clicked, this resets the cancel on orientation change by removing the mask-cancel class
window.addEventListener("orientationchange", function() {
  document.getElementById('brim-mask').className = "";
});
```

```css
#swipe-overlay {
  transform:translateZ(1px);
  background-image: url(/images/swipe_up_button.svg);
  background-repeat: no-repeat;
  background-size: 20%;
  height:100%;
  width:100%;
  background-position-x: 50%;
  position:absolute;
}
#brim-mask {       
  background-size: 20%;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.498039);
  background-position-x: 50%;
}

.mask-cancel{
  display:none !important;
}

#swipe-cancel{
  height: 100%%;
  -webkit-background-size: 48px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-user-select: none;
  background-repeat: no-repeat;
  background-size: 48px;
  display: block;
  font-family: JMyriad;
  font-size: 16px;
  outline-color: rgb(0, 0, 0);
  outline-style: none;
  outline-width: 0px;
  position: absolute;
  right: 1px;
  visibility: visible;
  width: 48px;
  background-image: url(/images/swipe_cancel.svg);
}

/*uncomment to disable in portrait or modify for portrait only*/

/*@media all and (orientation:portrait) {
  #brim-mask{
    display: none !important;
  }
}*/
```

```html
<!DOCTYPE HTML>
<html>
  <head> 
    <link rel="stylesheet" type="text/css" href="app.css">
  </head>
  <body>
    <div id="brim-mask">
      <div id="swipe-overlay">
        <div id="swipe-cancel"></div>
      </div>
    </div>
    <div id="brim-main">
    </div>
  <script src="app.js"></script>
  </body>
</html> 
```
