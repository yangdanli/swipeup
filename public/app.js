(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Brim,
    Sister = require('sister');

Brim = function Brim (config) {
    var brim,
        player = {},
        viewport,
        eventEmitter;
    
    if (!(this instanceof Brim)) {
        return new Brim(config);
    }

    brim = this;

    if (!config.viewport || !(config.viewport instanceof gajus.Scream)) {
        throw new Error('Configuration property "viewport" must be an instance of Scream.');
    }

    viewport = config.viewport;

    /**
     *
     */
    brim._setupDOMEventListeners = function () {
        viewport.on('orientationchangeend', function () {
            brim._treadmill();
            brim._main();
            brim._mask();
        });

        viewport.on('viewchange', function (e) {
            brim._main();
            brim._mask();

            eventEmitter.trigger('viewchange', e);
        });

        brim._main();
        brim._mask();

        // Disable window scrolling when in minimal view.
        // @see http://stackoverflow.com/a/26853900/368691
        (function () {
            var firstMove;

            global.document.addEventListener('touchstart', function (e) {
                firstMove = true;
            });

            global.document.addEventListener('touchmove', function (e) {
                if (viewport.isMinimalView() && firstMove) {
                    //e.preventDefault();
                }

                firstMove = false;
            });
        } ());
    };

    /**
     * Setting the offset ensures that "resize" event is triggered upon loading the page.
     * A large (somewhat arbitrary) offset ensures that the page view does not change after device orientation.
     *
     * @see http://stackoverflow.com/questions/26784456/how-to-get-window-height-when-in-fullscreen
     */
    brim._treadmill = function () {
        global.scrollTo(0, 1000);
    };

    /**
     * Sets the dimensions and position of the drag mask player. The mask is an overlay on top
     * of the treadmill and the main content.
     *
     * The mask is visible when view is full.
     */
    brim._mask = function () {
        if (viewport.isMinimalView()) {
            player.mask.style.display = 'none';
        } else {
            player.mask.style.display = 'block';

            player.mask.style.width = global.innerWidth + 'px';
            player.mask.style.height = (global.innerHeight * 2) + 'px';

            brim._repaintElement(player.mask);
        }
    };

    /**
     * Sets the dimensions and position of the main player.
     *
     * The main element remains visible beneath the mask.
     */
    brim._main = function () {
        player.main.style.width = global.innerWidth + 'px';
        player.main.style.height = global.innerHeight + 'px';

        brim._repaintElement(player.main);
    };

    /**
     * @return {HTMLElement}
     */
    brim._makeTreadmill = function () {
        var treadmill = document.querySelector('#brim-treadmill');

        if (treadmill) {
            throw new Error('There is an existing treadmill element.');
        }

        treadmill = document.createElement('div');
        treadmill.id = 'brim-treadmill';

        document.body.appendChild(treadmill);

        treadmill.style.visibility = 'hidden';
        treadmill.style.position = 'relative';
        treadmill.style.zIndex = 10;
        treadmill.style.left = 0;

        // Why make it such a large number?
        // Huge body height makes the size and position of the scrollbar fixed.
        treadmill.style.width = '1px';
        treadmill.style.height = '9999999999999999px';

        return treadmill;
    };

    /**
     *
     */
    brim._makeMask = function () {
        var mask = document.querySelector('#brim-mask');

        if (!mask) {
            throw new Error('Mask element does not exist.');
        }

        mask.style.position = 'fixed';
        mask.style.zIndex = 30;

        mask.style.top = 0;
        mask.style.left = 0;

        return mask;
    };

    /**
     *
     */
    brim._makeMain = function () {
        var main = document.querySelector('#brim-main');

        if (!main) {
            throw new Error('Main element does not exist.');
        }

        main.style.position = 'fixed';
        main.style.zIndex = 20;

        main.style.top = 0;
        main.style.left = 0;

        main.style.overflowY = 'scroll';
        main.style.webkitOverflowScrolling = 'touch';

        return main;
    };

    brim._makeDOM = function () {
        player.treadmill = brim._makeTreadmill();
        player.mask = brim._makeMask();
        player.main = brim._makeMain();
    };

    /**
     * Fixed element is not visible outside of the chrome of the pre touch-drag state.
     * See ./.readme/element-fixed-bug.png as a reminder of the bug.
     *
     * @see http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes?lq=1
     */
    brim._repaintElement = function (element) {
        element.style.webkitTransform = 'translateZ(0)';

        element.style.display = 'none';
        element.offsetHeight;
        element.style.display = 'block';
    };

    eventEmitter = Sister();

    brim.on = eventEmitter.on;

    brim._makeDOM();

    brim._setupDOMEventListeners();
};

global.gajus = global.gajus || {};
global.gajus.Brim = Brim;

module.exports = Brim;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"sister":4}],2:[function(require,module,exports){
(function (global){
'use strict';

/* global global, document */

var Scream,
    Sister = require('sister'),
    OCE = require('orientationchangeend')();

Scream = function Scream (config) {
    var scream,
        eventEmitter;

    if (!(this instanceof Scream)) {
        return new Scream(config);
    }

    scream = this;

    eventEmitter = Sister();

    config = config || {};

    config.width = config.width || {};

    if (!config.width.portrait) {
        config.width.portrait = global.screen.width;
    }

    if (!config.width.landscape) {
        config.width.landscape = global.screen.width;
    }

    /**
     * Viewport width relative to the device orientation.
     *
     * @return {Number}
     */
    scream.getViewportWidth = function () {
        return config.width[scream.getOrientation()];
    };

    /**
     * Viewport height relative to the device orientation and to scale with the viewport width.
     *
     * @return {Number}
     */
    scream.getViewportHeight = function () {
        return Math.round(scream.getScreenHeight() / scream.getScale());
    };

    /**
     * The ratio between screen width and viewport width.
     *
     * @return {Number}
     */
    scream.getScale = function () {
        return scream.getScreenWidth() / scream.getViewportWidth();
    };

    /**
     * @return {String} portrait|landscape
     */
    scream.getOrientation = function () {
        return global.orientation === 0 || global.orientation === 180 ? 'portrait' : 'landscape';
    };

    /**
     * Screen width relative to the device orientation.
     *
     * @return {Number}
     */
    scream.getScreenWidth = function () {
        return global.screen[scream.getOrientation() === 'portrait' ? 'width' : 'height'];
    };

    /**
     * Screen width relative to the device orientation.
     *
     * @return {Number}
     */
    scream.getScreenHeight = function () {
        return global.screen[scream.getOrientation() === 'portrait' ? 'height' : 'width'];
    };

    /**
     * Generates a viewport tag reflecting the content width relative to the device orientation
     * and scale required to fit the content in the viewport.
     *
     * Appends the tag to the document.head and removes the preceding additions.
     */
    scream._updateViewport = function () {
        var oldViewport,
            viewport,
            width,
            scale,
            content;

        width = scream.getViewportWidth();
        scale = scream.getScale();

        content =
             'width=' + width +
            ', initial-scale=' + scale +
            ', minimum-scale=' + scale +
            ', maximum-scale=' + scale +
            ', user-scalable=0';

        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = content;

        oldViewport = global.document.head.querySelector('meta[name="viewport"]');

        if (oldViewport) {
            oldViewport.parentNode.removeChild(oldViewport);
        }

        global.document.head.appendChild(viewport);
    };

    /**
     * Uses static device environment variables (screen.width, screen.height, devicePixelRatio) to recognize device spec.
     *
     * @return {Array} spec
     * @return {Number} spec[0] window.innerWidth when device is in a portrait orientation, scale 0.25 and page is the minimal view
     * @return {Number} spec[1] window.innerHeight when device is in a portrait orientation, scale 0.25 and page is the minimal view
     * @return {Number} spec[2] window.innerWidth when device is in a landscape orientation, scale 0.25 and page is the minimal view
     * @return {Number} spec[3] window.innerHeight when device is in a landscape orientation, scale 0.25 and page is the minimal view
     * @return {Number} spec[4] screen.width
     * @return {Number} spec[5] screen.height
     * @return {Number} spec[6] devicePixelRatio
     * @return {String} spec[7] name
     */
    scream._deviceSpec = function () {
        var specs,
            spec,
            i;

        specs = [
            [1280, 1762, 1920, 1280, 320, 480, 2, 'iPhone 4'],
            [1280, 2114, 2272, 1280, 320, 568, 2, 'iPhone 5 or 5s'],

            [1500, 2510, 2668, 1500, 375, 667, 2, 'iPhone 6'],
            // Equivalent to iPhone 5
            // [1280, 2114, 2272, 1280, 320, 568, 2, 'iPhone 6 (Zoomed)'],

            [1656, 2785, 2944, 1656, 414, 736, 3, 'iPhone 6 plus'],
            [1500, 2509, 2668, 1500, 375, 667, 3, 'iPhone 6 plus (Zoomed)'],

            [3072, 3936, 4096, 2912, 768, 1024, 1, 'iPad 2'],
            [3072, 3938, 4096, 2914, 768, 1024, 2, 'iPad Air or Retina']
        ];

        i = specs.length;

        while (i--) {
            if (global.screen.width === specs[i][4] &&
                global.screen.height === specs[i][5] &&
                global.devicePixelRatio === specs[i][6]) {
                spec = specs[i];

                break;
            }
        }

        return spec;
    };

    /**
     * Returns height of the usable viewport in the minimal view relative to the current viewport width.
     *
     * This method will work with iOS8 only.
     *
     * @see http://stackoverflow.com/questions/26827822/how-is-the-window-innerheight-derived-of-the-minimal-view/26827842
     * @see http://stackoverflow.com/questions/26801943/how-to-get-the-window-size-of-fullscream-view-when-not-in-fullscream
     * @return {Number}
     */
    scream._getMinimalViewHeight = function () {
        var spec,
            height,
            orientation = scream.getOrientation();

        spec = scream._deviceSpec();

        if (!spec) {
            throw new Error('Not a known iOS device. If you are using an iOS device, report it to https://github.com/gajus/scream/issues/1.');
        }

        if (orientation === 'portrait') {
            height = Math.round(scream.getViewportWidth() * spec[1] / spec[0]);
        } else {
            height = Math.round(scream.getViewportWidth() * spec[3] / spec[2]);
        }

        return height;
    };

    /**
     * Returns dimensions of the usable viewport in the minimal view relative to the current viewport width and orientation.
     *
     * @return {Object} dimensions
     * @return {Number} dimensions.width
     * @return {Number} dimensions.height
     */
    scream.getMinimalViewSize = function () {
        var width = scream.getViewportWidth(),
            height = scream._getMinimalViewHeight();

        return {
            width: width,
            height: height
        };
    };

    /**
     * Returns true if screen is in "minimal" UI.
     *
     * iOS 8 has removed the minimal-ui viewport property.
     * Nevertheless, user can enter minimal-ui using touch-drag-down gesture.
     * This method is used to detect if user is in minimal-ui view.
     *
     * In case of orientation change, the state of the view can be accurately
     * determined only after orientationchangeend event.
     *
     * @return {Boolean}
     */
    scream.isMinimalView = function () {
        // It is enough to check the height, because the viewport is based on width.
        return global.innerHeight === scream.getMinimalViewSize().height;
    };

    /**
     * Detect when view changes from full to minimal and vice-versa.
     */
    scream._detectViewChange = function () {
        var lastView;

        // This method will only with iOS 8.
        // Overwrite the event handler to prevent an error.
        if (!scream._deviceSpec()) {
            console.log('View change detection has been disabled. Unrecognized device. If you are using an iOS device, report it to https://github.com/gajus/scream/issues/1.');

            return function () {};
        }

        return function () {
            var currentView = scream.isMinimalView() ? 'minimal' : 'full';

            if (lastView !== currentView) {
                eventEmitter.trigger('viewchange', {
                    viewName: currentView
                });

                lastView = currentView;
            }
        };
    };

    scream._detectViewChange = scream._detectViewChange();

    scream._setupDOMEventListeners = function () {
        var isOrientationChanging;

        // Media matcher is the first to pick up the orientation change.
        global
            .matchMedia('(orientation: portrait)')
            .addListener(function () {
                isOrientationChanging = true;
            });

        OCE.on('orientationchangeend', function () {
            isOrientationChanging = false;

            scream._updateViewport();
            scream._detectViewChange();

            eventEmitter.trigger('orientationchangeend');
        });

        global.addEventListener('orientationchange', function () {
            scream._updateViewport();
        });

        global.addEventListener('resize', function () {
            if (!isOrientationChanging) {
                scream._detectViewChange();
            }
        });

        // iPhone 6 plus does not trigger resize event when leaving the minimal-ui in the landscape orientation.
        global.addEventListener('scroll', function () {
            if (!isOrientationChanging) {
                scream._detectViewChange();
            }
        });

        setTimeout(function () {
            scream._detectViewChange();
        });
    };

    scream._updateViewport();
    scream._setupDOMEventListeners();

    scream.on = eventEmitter.on;
};

global.gajus = global.gajus || {};
global.gajus.Scream = Scream;

module.exports = Scream;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"orientationchangeend":3,"sister":4}],3:[function(require,module,exports){
(function (global){
var Event,
    Sister = require('sister');

Event = function Event (config) {
    var event,
        lastEnd,
        eventEmitter;

    if (!(this instanceof Event)) {
        return new Event(config);
    }

    eventEmitter = Sister();

    event = this;
    event.on = eventEmitter.on;

    config = config || {};

    /**
     * @var {Number} Number of iterations the subject of interval inspection must not mutate to fire "orientationchangeend".
     */
    config.noChangeCountToEnd = config.noChangeCountToEnd || 100;
    /**
     * @var {Number} Number of milliseconds after which fire the "orientationchangeend" if interval inspection did not do it before.
     */
    config.noEndTimeout = 1000 || config.noEndTimeout;
    /**
     * @var {Boolean} Enables logging of the events.
     */
    config.debug = config.debug || false;

    global
        .addEventListener('orientationchange', function () {
            var interval,
                timeout,
                end,
                lastInnerWidth,
                lastInnerHeight,
                noChangeCount;

            end = function (dispatchEvent) {
                clearInterval(interval);
                clearTimeout(timeout);

                interval = null;
                timeout = null;

                if (dispatchEvent) {
                    eventEmitter.trigger('orientationchangeend');
                }
            };

            // If there is a series of orientationchange events fired one after another,
            // where n event orientationchangeend event has not been fired before the n+2 orientationchange,
            // then orientationchangeend will fire only for the last orientationchange event in the series.
            if (lastEnd) {
                lastEnd(false);
            }

            lastEnd = end;

            interval = setInterval(function () {
                if (global.innerWidth === lastInnerWidth && global.innerHeight === lastInnerHeight) {
                    noChangeCount++;

                    if (noChangeCount === config.noChangeCountToEnd) {
                        if (config.debug) {
                            console.debug('setInterval');
                        }

                        end(true);
                    }
                } else {
                    lastInnerWidth = global.innerWidth;
                    lastInnerHeight = global.innerHeight;
                    noChangeCount = 0;
                }
            });
            timeout = setTimeout(function () {
                if (config.debug) {
                    console.debug('setTimeout');
                }

                end(true);
            }, config.noEndTimeout);
        });
}

global.gajus = global.gajus || {};
global.gajus.orientationchangeend = Event;

module.exports = Event;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"sister":4}],4:[function(require,module,exports){
(function (global){
/**
* @link https://github.com/gajus/sister for the canonical source repository
* @license https://github.com/gajus/sister/blob/master/LICENSE BSD 3-Clause
*/
function Sister () {
    var sister = {},
        events = {};

    /**
     * @name handler
     * @function
     * @param {Object} data Event data.
     */

    /**
     * @param {String} name Event name.
     * @param {handler} handler
     * @return {listener}
     */
    sister.on = function (name, handler) {
        var listener = {name: name, handler: handler};
        events[name] = events[name] || [];
        events[name].unshift(listener);
        return listener;
    };

    /**
     * @param {listener}
     */
    sister.off = function (listener) {
        var index = events[listener.name].indexOf(listener);

        if (index != -1) {
            events[listener.name].splice(index, 1);
        }
    };

    /**
     * @param {String} name Event name.
     * @param {Object} data Event data.
     */
    sister.trigger = function (name, data) {
        var listeners = events[name],
            i;

        if (listeners) {
            i = listeners.length;
            while (i--) {
                listeners[i].handler(data);
            }
        }
    };

    return sister;
}

global.gajus = global.gajus || {};
global.gajus.Sister = Sister;

module.exports = Sister;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
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
  console.log('here')
  document.getElementById('brim-mask').className = 'mask-cancel';
});

// If cancel is clicked, this resets the cancel on orientation change
window.addEventListener("orientationchange", function() {
  document.getElementById('brim-mask').className = "";
});


},{"Brim":1,"Scream":2}]},{},[5]);
