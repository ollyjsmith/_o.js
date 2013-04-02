// Copyright (c) 2013 Oliver Smith, http://ollyjsmith.com
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//


(function( global ){


// SETUP
	var _o = {
		VERSION: '0.0.15',
		DEBUG : false
	};

	if( global._o ){
		throw new Error( '_o is already defined.');
	} else {
		global._o = _o;
	}


// FEATURE DETECTION
// This is pretty bare bones - for more, use Modernizr ( where some of this comes from... )
_o.browser = {};

_o.browser.canvasSupport = (function(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
})();

_o.browser.webAudioSupport = (function(){
	return ( window.AudioContext ) ? true : ( window.webkitAudioContext ) ? 'webkit' : false;
})();

_o.browser.touchSupport = (function() {
    return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) ;
})();

_o.browser.getUserMediaSupport = (function() {
    return ( navigator.GetUserMedia ) ? true : ( navigator.webkitGetUserMedia ) ? 'webkit' : false;
})();


// UTILS

	// MAP VALUE
	//
	// maps a value from one range to another
	// ta Processing: http://processing.org
	// NOTE: does not clamp the values
	//
	_o.mapValue = function( val, origMin, origMax, newMin, newMax ){
		return newMin + ( newMax - newMin ) * ( ( val - origMin ) / ( origMax - origMin ) );
	};

	// MAP VALUE & CLAMP TO NEW RANGE
	//
	// functions like _o.mapValue, but clamps to new range
	//
	_o.clampValue = function( val, origMin, origMax, newMin, newMax ){
		var low = ( newMin > newMax ) ? newMax : newMin;
		var high = ( newMin > newMax ) ? newMin : newMax;
		var result = low + ( high - low ) * ( ( val - origMin ) / ( origMax - origMin ) );
		return ( result > high ) ? high : (result < low ) ? low : result;
	};

	// RANDOM RANGE
	// gives us a range of values
	_o.randomRange = function( fromValue, toValue ){
		return fromValue + ( Math.random() * ( toValue - fromValue ) );
	};

	// RANDOM HEX COLOUR CODE
	// gives us a 6 digit hexadecimal string, prefixed with a hash ( pass true to remove hash );
	_o.randomHexClr = function( removeHash ){
		var hex = '';
		if( !removeHash ){
			hex += '#';
		}
		for( var i = 0; i < 6; i++ ){
			hex += Math.floor( _o.randomRange(0,16) ).toString(16);
		}
		return hex;
	};

	//ABS
	//absolute value, taken from: http://www.soundstep.com/blog/experiments/jsdetection/js/app.js
	_o.abs = function( value ) {
		return (value ^ (value >> 31)) - (value >> 31);
	};

	// DEGREE / RADIANS CONVERSION
	// 2 functions to convert between degrees and radians
	_o.d2r = function( deg ){
		return deg * ( Math.PI / 180 );
		};
	_o.r2d = function( rad ){
		return rad * ( 180 / Math.PI );
	};


// VECTORS
// basic 2d vector class, courtesy L A Watts...
// 3d version ( _o.vec ) added, 2d remains for compatibility
_o.vec2D = function( x, y ){
	this.x = x || 0;
	this.y = y || 0;
};

_o.vec2D.prototype = {
	copyFrom: function( vect ){
		this.x = vect.x;
		this.y = vect.y;
	},
	plus: function( vect ){
		this.x += vect.x;
		this.y += vect.y;
	},
	equals: function( vect ){
		this.x = vect.x;
		this.y = vect.y;
	},
	mult: function( val ){
		this.x *= val;
		this.y *= val;
	}
};

// VECTORS
// basic 3d vector class
_o.vec = function( x, y, z ){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

_o.vec.prototype = {
	copyFrom: function( vect ){
		this.x = vect.x;
		this.y = vect.y;
		this.z = vect.z;
	},
	plus: function( vect ){
		this.x += vect.x;
		this.y += vect.y;
		this.z += vect.z;
	},
	equals: function( vect ){
		this.x = vect.x;
		this.y = vect.y;
		this.z = vect.z;
	},
	mult: function( val ){
		this.x *= val;
		this.y *= val;
		this.z *= val;
	}
};

// MOUSE INTERACTION
//
// we keep this info about the mouse:
// x : document x position
// y : document y position
// down : is the button up or down ( true/false )

	// useful to have current mouse info and previous mouse info
	_o.pMouse = {};
	_o.mouse = {};

	// TRACK MOUSE
	//
	// gives access to current mouse X and Y and previous mouse X and Y
	//
	_o.trackMouse = function( e ){
		//tracks mouse globally on page
		_o.pMouse.x	= _o.mouse.x;
		_o.pMouse.y = _o.mouse.y;
		
		if (e.pageX || e.pageY){
			_o.mouse.x = e.pageX;
			_o.mouse.y = e.pageY;
		} else if (e.clientX || e.clientY){ //not eerything provides pageX/Y...
			_o.mouse.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			_o.mouse.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		//tracks mouse on a per canvas basis
		_o.trackMouseOnCanvasses();
	};

	// MOUSE BUTTONS
	//
	// is a mouse button pressed
	// TODO: detect which button it is
	_o.mouseDown = function( ){
		_o.pMouse.down = _o.mouse.down;
		_o.mouse.down = true;
	};
	_o.mouseUp = function( ){
		_o.pMouse.down = _o.mouse.down;
		_o.mouse.down = false;
	};


// KEYBOARD INTERACTION
//
// map of keys by code and by name - done to a Mac keyboard	
// TODO: check against other keyboards & layouts
	_o.keys = {};

    _o.keys.listByCode = {
        "8": "backspace", "9": "tab", "13": "enter", "16": "shift", "17": "control", "18": "alt", "32": "space", "37": "left", "38": "up", "39": "right", "40": "down",
        "48": "0", "49": "1", "50": "2", "51": "3", "52": "4", "53": "5", "54": "6", "55": "7", "56": "8", "57": "9",
        "65": "a", "66": "b", "67": "c", "68": "d", "69": "e", "70": "f", "71": "g", "72": "h", "73": "i", "74": "j", "75": "k", "76": "l", "77": "m", "78": "n", "79": "o", "80": "p", "81": "q", "82": "r", "83": "s", "84": "t", "85": "u", "86": "v", "87": "w", "88": "x", "89": "y","90": "z",
        "91": "meta", "93": "meta",
        "186": ";", "187": "=", "188": ",", "189": "-", "190": ".", "191": "/", "192": "`", "219": "[", "220": "\\", "221": "]","222": "'"
    };
    _o.keys.listByName = {
        "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57,
        "q": 81, "w": 87, "e": 69, "r": 82, "t": 84, "y": 89, "u": 85, "i": 73, "o": 79, "p": 80, "a": 65, "s": 83, "d": 68, "f": 70, "g": 71, "h": 72, "j": 74, "k": 75, "l": 76, "z": 90, "x": 88, "c": 67, "v": 86, "b": 66, "n": 78, "m": 77,
        "[": 219, "]": 221, "-": 189, "=": 187, ";": 186, "'": 222, "\\": 220, "`": 192, ",": 188, ".": 190, "/": 191,
        "backspace": 8, "tab": 9, "enter": 13, "shift": 16, "control": 17, "alt": 18, "meta": 93, "space": 32, "left": 37, "down": 40, "right": 39, "up": 38
    };

    _o.keys.pressed = [];

	_o.keyDown = function( e ){
		var name = _o.keys.listByCode[ e.keyCode ];
		if( _o.keys.pressed.length ){
			var keyAlreadyPressed = false;
			for( var i = 0; i < _o.keys.pressed.length; i++ ){
				if( _o.keys.pressed[i] === name ){
					keyAlreadyPressed = true;
				}
			}
			if ( !keyAlreadyPressed ){
				_o.keys.pressed.push( name );
				_o.keys.lastDown = name;
			}
		} else {
			_o.keys.pressed.push( name );
			_o.keys.lastDown = name;
		}
	};

	_o.keyUp = function( e ){
		var name = _o.keys.listByCode[ e.keyCode ];
		var indexToRemove = -1;
		if( _o.keys.pressed.length ){
			for( var i = 0; i < _o.keys.pressed.length; i++ ){
				if( _o.keys.pressed[i] === name ){
					indexToRemove = i;
				}
			}
			_o.keys.pressed.splice( indexToRemove, 1 );
		}
		_o.keys.lastUp = name;
	};


// TOUCH INTERACTION
// store touches as an object literal, indexed by ID.
// each has a touch and pTouch object - to mirror _o.mouse & _o.pMouse
// each of these has an x and y, and a target element

// TODO: 
// - remove target element - this is a requirement of a specific 
//   use case & should be made more general
// - store in an array for ease of access?

//should the default touch events be overriden?
_o.TOUCH_OVERRIDE_DEFAULT = false;

_o.touches = {};

_o.trackTouch = function( e ){
	if( _o.TOUCH_OVERRIDE_DEFAULT ){
		e.preventDefault();
	}

	for( var i = 0; i < e.touches.length; i++ ){
		var newTouch = e.touches[i];
		var id = newTouch.identifier;
		if( _o.touches[id] ){
			_o.touches[id].pTouch.x = _o.touches[id].touch.x;
			_o.touches[id].pTouch.y = _o.touches[id].touch.y;
			_o.touches[id].pTouch.target = _o.touches[id].touch.target;
			_o.touches[id].touch.x = newTouch.pageX;
			_o.touches[id].touch.y = newTouch.pageY;
			_o.touches[id].touch.target = newTouch.target;
		} else {
			_o.touches[id] = {};
			_o.touches[id].pTouch = {};
			_o.touches[id].touch = {};
			_o.touches[id].pTouch.x = newTouch.pageX;
			_o.touches[id].pTouch.y = newTouch.pageY;
			_o.touches[id].pTouch.target = newTouch.target;
			_o.touches[id].touch.x = newTouch.pageX;
			_o.touches[id].touch.y = newTouch.pageY;
			_o.touches[id].touch.target = newTouch.target;
		}

	}
};

_o.touchEnd = function( e ){
	if( _o.TOUCH_OVERRIDE_DEFAULT ){
		e.preventDefault();
	}

	var changedTouches = e.changedTouches;

	for( var i = 0; i < changedTouches.length; i++ ){
		var id = changedTouches[i].identifier;
		for( var touchId in _o.touches){
			if( touchId === id ){
				delete _o.touches[id];
			}
		}
	}
};


// ADD LISTENERS
// 
// add the listeners for mouse and keyboard to the document
// this relies on addEventListener, so it precludes older browsers, but they tend
// not to have canvas support and almost certainly don't have audio support, so
// they're out of the scope of this library
	_o.addListeners = function(){
		var events = [ 
						{ 
							'event': 'mousemove', 
							'func' : _o.trackMouse
						}, 
						{
							'event': 'mousedown',
							'func' : _o.mouseDown
						}, 
						{
							'event': 'mouseup',
							'func' : _o.mouseUp
						},
						{
							'event': 'keydown',
							'func' : _o.keyDown
						},
						{
							'event': 'keyup',
							'func' : _o.keyUp
						},
						{
							'event': 'touchmove',
							'func' : _o.trackTouch
						},
						{
							'event': 'touchstart',
							'func' : _o.trackTouch
						},
						{
							'event': 'touchend',
							'func' : _o.touchEnd
						}
					];
		for( var i = 0; i < events.length; i++ ){
			if( document.addEventListener ){
				document.addEventListener( events[i].event , events[i].func, true );
			} else {
				throw new Error( 'This browser does not support \'addEventListener()\'' );
			}
		}
	};

	_o.addListeners();


// AUDIOVISUAL

	//we keep a list of canvasses for reference & for mouse tracking
	_o.canvasses = [];

	// CREATE CANVAS
	//
	// sets up a canvas and returns an object containing:
	// .canvas - the canvas element, sized based on values passed in, or the size of the window
	// .w & .h - the width and height of the canvas element
	// .ctx    - the context of the canvas
	_o.createCanvas = function( width, height ){
		var canvas = {};

		canvas.canvas			=	document.createElement( 'canvas' );
		//set the size - default to the sizes of the window
		canvas.canvas.width		=	width || window.innerWidth;
		canvas.canvas.height	=	height || window.innerHeight;
		//these are just for convenience
		canvas.w				=	canvas.canvas.width;
		canvas.h				=	canvas.canvas.height;
		//could add options for webGL context but realistically that's getting handled by three.js
		canvas.ctx				=	canvas.canvas.getContext( '2d' );

		//where is the mouse on this canvas?
		canvas.mouse = {};
		canvas.pMouse = {};

		//add this to our list
		_o.canvasses.push( canvas );

		return canvas;
	};

	// RESIZE CANVAS
	//
	// resize the canvas
	_o.resizeCanvas = function( canvas, newWidth, newHeight ){
		canvas.canvas.width		=	newWidth;
		canvas.canvas.height	=	newHeight;
		canvas.w				=	canvas.canvas.width;
		canvas.h				=	canvas.canvas.height;
	};

	// TRACK MOUSE ON CANVASSES
	//
	// provides us with a mouse position & previous mouse position mapped to each canvas we have created

	_o.trackMouseOnCanvasses = function(){
		for( var i = 0; i < _o.canvasses.length; i++ ){
			var this_canvas = _o.canvasses[i];
			var canvas_mouse_x = _o.mouse.x - this_canvas.canvas.offsetLeft;
			var canvas_mouse_y = _o.mouse.y - this_canvas.canvas.offsetTop;

			this_canvas.pMouse.x = this_canvas.mouse.x;
			this_canvas.pMouse.y = this_canvas.mouse.y;

			this_canvas.mouse.x = ( canvas_mouse_x  >= 0 && canvas_mouse_x  <= this_canvas.w ) ? canvas_mouse_x : -1;
			this_canvas.mouse.y = ( canvas_mouse_y  >= 0 && canvas_mouse_y  <= this_canvas.h ) ? canvas_mouse_y : -1;
		}
	};

	// A FRAME RATE/DRAWER
	// 
	// overwrite _o.draw to have our code executed every frame
	_o.isLooping = false;
	_o.loop = function(){
		if( !_o.isLooping ){
			_o.isLooping = true;
		}
		_o.webcam.steppedThisFrame = false;
		if( typeof _o.draw === 'function' ){
			_o.draw();
		}				
		requestAnimationFrame( _o.loop );
	};

	//IMAGE LOADER
	//
	//preloads images
	//takes array of image sources
	//returns array of objects containing the image src and the image
	_o.loadImages = function( sources, callback ){
		var loadCount = 0;
		var loadAim = sources.length;
		var images = [];
		if( loadAim > 0 ){
			for( var i = 0; i < loadAim; i++ ){
				//construct the object we will return
				images[i] = {
					src : sources[i],
					image : new Image()
				};	
				//actions to fire when this image is loaded
				images[i].image.onload = function(){
					loadCount++;
					if( loadCount === loadAim && typeof callback === 'function' ){
						//all loaded, fire the callback - pass it our images
						callback( images );
					}
				};
				//load the image
				images[i].image.src = images[i].src;
			}
		}
	};

	//PIXEL DATA LOADER
	//
	//creates a temporary canvas,
	//draws image to it
	//loads image pixel data from there and returns it.
	_o.loadPixels = function( image ){
		//setup a temp canvas
		this.tempC = document.createElement( 'canvas' );
		this.tempC.width = image.width;
		this.tempC.height = image.height;
		this.tempCtx = this.tempC.getContext( '2d' );
		//draw image to this
		this.tempCtx.drawImage( image, 0, 0 , image.width, image.height );
		//get the pixels & return
		return this.tempCtx.getImageData( 0, 0, image.width, image.height );
	};

	_o.audio = null;

	// CREATE AUDIO
	//
	// creates and returns an audio context
	// normalises the webkit prefix
	// returns empty object if no audio touchSupport
	_o.createAudio = function( ){
		if( !_o.audio ){
			_o.audio = {};
			if ( _o.browser.webAudioSupport === true ) {
				_o.audio.ctx = new AudioContext();
			} else if ( _o.browser.webAudioSupport === "webkit" ) {
				_o.audio.ctx = new webkitAudioContext();
			}
		}
		return _o.audio;
	};

	// SOUND LOADER
	//
	// preloads audio
	// takes sound source & callback
	// optional: arrayPosition to allow _o.loadSounds to retain array order of loaded sounds
	// returns object containing the sound src and an arraybuffer containing the sound 
	_o.loadSound = function( source, callback, arrayPosition ){
		var sound = {
				src: source,
				arraybuffer: null
			};
		var request = new XMLHttpRequest();
		request.open("GET", source, true );
		request.responseType = "arraybuffer";
		request.onload = function( ){
			sound.arraybuffer = request.response;
			if( typeof callback === 'function' ){
				callback( sound , arrayPosition);
			}
		};
		request.send();
	};

	// MULTIPLE SOUND LOADER
	//
	// loads multiple pieces of audio
	// takes array of sound sources
	// returns array of objects containing source & array buffer
	//
	// relies on _o.loadSound
	// sends _o.loadSound the optional parameter arrayPosition so that the 
	// resultant array is the same order as the one passed in.
	_o.loadSounds = function( sources, callback ){
		if( sources && sources.length > 0 ){
			var loadCount = 0;
			var loadAim = sources.length;
			var sounds = [];
			for( var i = 0; i < loadAim; i++ ){
				_o.loadSound( sources[i], function( sound, arrayPosition ){
					loadCount++;
					sounds[arrayPosition] = sound;
					if( loadCount === loadAim && typeof callback === 'function' ){
						callback( sounds );
					}
				}, i );
			}
		}
	};


// INPUT & ANALYSIS
	// GET USER MEDIA

	//SOUND
	//
	// get the user's microphone
	//
	_o.microphone = {
		isRequested: false,
		isActive: false,
		source: null,
		volume: -100,
		analyser: null
	};

	_o.getMicrophone = function( callback ){
		if( !_o.audio ){
			_o.createAudio();
		}	
		var success = function( stream ){
			_o.microphone.isActive = true;
			_o.microphone.source = _o.audio.ctx.createMediaStreamSource( stream );			
			if( typeof callback === "function" ){
				callback( _o.microphone.source );
			}
		};
		var failure = function( error ){
			throw new Error( error );
		};
		if( !_o.microphone.isActive && !_o.microphone.isRequested ){
			_o.microphone.isRequested = true;
			if( _o.browser.getUserMediaSupport === true ){
				navigator.getUserMedia( { audio: true }, success, failure );
			} else if( _o.browser.getUserMediaSupport === "webkit" ){
				navigator.webkitGetUserMedia( { audio: true }, success, failure );
			}
		} else {
			if( typeof callback === "function" && _o.microphone.isActive ){
				callback( _o.microphone.source );
			}
		}
	};

	//GET FREQUENCY BANDS POWER
	//
	// normalised to between 0 and 1
	//
	// optional:
	// a number of bands to get
	// low and high bounds of the audio to analyse
	_o.getFrequencyBands = function( _number, _low, _high ){
		var run = function(){
			var number = _number || 3;
			var low = _low || 0;
			var high = _high || _o.audio.sampleRate;
			var fftBandCount = _o.microphone.analyser.frequencyBinCount;
			var fftBandSize = _o.audio.ctx.sampleRate / fftBandCount;
			var lowBand = Math.floor( low / fftBandSize );
			var highBand = Math.ceil( high / fftBandSize );
			var calculatedBandCount = highBand - lowBand;
			var returnBandSize = Math.round( calculatedBandCount / number );
			var fftBands = new Float32Array( fftBandCount );
			_o.microphone.analyser.getFloatFrequencyData( fftBands );
	
			var bands = [];

			for( var i = lowBand; i < highBand;  i += returnBandSize ){
				var total = 0;
				var average;
				for( var j = i; j < i + returnBandSize - 1; j++ ){
					total += fftBands[ j ];
				}
				average = total / calculatedBandCount;
				bands[i] = _o.mapValue( average, _o.microphone.analyser.minDecibels, _o.microphone.analyser.maxDecibels, 0, 1 );
			}
			return bands;
		};

		if( !_o.microphone.analyser ){
			_o.getMicrophone( function(){
				_o.microphone.analyser = _o.audio.ctx.createAnalyser();
				_o.microphone.source.connect( _o.microphone.analyser );
				var result = run();
				return result;
			});
		} else {
			var result = run();
			return result;
		}
	};

	//GET MICROPHONE TOTAL VOLUME
	_o.getMicrophoneVolume = function(){
		var bands = _o.getFrequencyBands( 1, 20, 14000 );
		if( bands ){
			_o.microphone.volume = bands[0];
		}
		return _o.microphone.volume;
	};

	//VIDEO
	//
	// get the user's webcam
	//
	_o.webcam = {
		isActive: false,
		requestedCamera: false,
		steppedThisFrame: false,
		w: 320,
		h: 240,
		ele: document.createElement('video'),
		movementThreshold: 1000 ,
		movement: new _o.vec( 0 , 0 ),
		src: null
	};

	_o.getCamera = function( callback ){
		var success = function( cam ){
			var src;
			if( !_o.webcam.ele ){
				_o.webcam.ele = document.createElement('video');
			}
			_o.webcam.isActive = true;
			
			if( _o.browser.getUserMediaSupport === 'webkit' ){
				src = window.webkitURL.createObjectURL( cam );
			} else if( _o.browser.getUserMediaSupport === true ){
				src = cam;
			}
			_o.webcam.src = src;
			_o.webcam.ele.src = src;
			_o.webcam.ele.play();
			
			if( typeof callback === "function" ){
				callback( _o.webcam.ele );
			}
		};
		var failure = function( error ){
			throw new Error( error );
		};
		if( _o.browser.getUserMediaSupport === true ){
			navigator.getUserMedia( { video: true }, success, failure );
		} else if( _o.browser.getUserMediaSupport === "webkit" ){
			navigator.webkitGetUserMedia( { video: true }, success, failure );
		}
	};

	_o.stepCamera = function(){
		if( !_o.webcam.steppedThisFrame ){
			if( !_o.webcam.isActive && !_o.webcam.requestedCamera ){
				_o.webcam.requestedCamera = true;
				_o.getCamera();
			}
			if( _o.webcam.isActive ){
				if( !_o.webcam.canvas ){
					_o.webcam.canvas = _o.createCanvas( _o.webcam.w, _o.webcam.h );
				}
				var c = _o.webcam.canvas;
				//save previous frame
				_o.webcam.previousFrame = c.ctx.getImageData( 0, 0, c.w, c.h );
				//flip cam
				c.ctx.save();
				c.ctx.translate( c.w, 0 );
				c.ctx.scale( -1, 1 );
				//draw cam
				c.ctx.drawImage( _o.webcam.ele, 0, 0, c.w, c.h );
				_o.webcam.currentFrame = c.ctx.getImageData( 0, 0, c.w, c.h );

				c.ctx.restore();

			}

			_o.webcam.steppedThisFrame = true;
		}

	};

	_o.frameDifference = function( _blockCountX, _blockCountY ){
		//get current frame before running analysis
		_o.stepCamera();
		
		var currentFrame = _o.webcam.currentFrame;
		var frameWidth = currentFrame.width;
		var frameHeight = currentFrame.height;
		var blockCountX = _blockCountX;
		var blockCountY = _blockCountY;
		var blockWidth = frameWidth / blockCountX;
		var blockHeight = frameHeight / blockCountY;
		var movementByBlock = [];
		var mostMovement = {
			value: 0,
			index: 0,
			location: new _o.vec( _o.webcam.movement.x, _o.webcam.movement.y )
		};


		var currentBlock = 0;
		for ( var i = 0; i < frameWidth; i += blockWidth ){
			for ( var j = 0; j < frameHeight; j += blockHeight ){
				var blockMovement = _o.areaDifference( i, j, blockWidth, blockHeight );
				movementByBlock[ currentBlock ] = blockMovement;
				if( blockMovement > mostMovement.value ){
					mostMovement.value = blockMovement;
					mostMovement.index = currentBlock;
					mostMovement.location = new _o.vec( i + ( 0.5* blockWidth ), j + ( 0.5* blockHeight ) );
				}
				currentBlock++;
			}
		}
		_o.webcam.movement = new _o.vec( mostMovement.location.x, mostMovement.location.y );	
		return mostMovement;
	};


	//pass in array of custom defined areas
	//each area defined as object with following parameters
	//	{
	//		topLeftX: 0,
	//		topLeftY: 0,
	//		width: 0,
	//		height
	//	}
	_o.customDifference = function( _areas ){
		//get current frame before running analysis
		_o.stepCamera();

		var movementByArea = [];
		var mostMovement = {
			value: 0,
			index: 0,
			location: new _o.vec( _o.webcam.movement.x, _o.webcam.movement.y )
		};
		var areas = _areas;

		for( var i = 0, iLen = areas.length; i < iLen; i++ ){
			var area = areas[i];
			var areaMovement = _o.areaDifference( area.topLeftX, area.topLeftY, area.width, area.height );
			movementByArea[ i ] = areaMovement;
			if( areaMovement > mostMovement.value ){
				mostMovement.value = areaMovement;
				mostMovement.index = i;
				mostMovement.location = new _o.vec( area.topLeftX + ( 0.5* area.width ), area.topLeftY + ( 0.5* area.height ) );
			}
		}
		_o.webcam.movement = new _o.vec( mostMovement.location.x, mostMovement.location.y );
		return mostMovement;
	};

	_o.areaDifference = function( _topLeftX, _topLeftY, _areaWidth, _areaHeight ){
		var previousFrame = _o.webcam.previousFrame;
		var currentFrame = _o.webcam.currentFrame;
		var blockMovement = 0;
		if( previousFrame && currentFrame ){
			var currentRGBA = currentFrame.data;
			var previousRGBA = previousFrame.data;
			var frameWidth = currentFrame.width;
			var topLeftX = Math.round( _topLeftX );
			var topLeftY = Math.round( _topLeftY );
			var areaWidth = Math.round( _areaWidth );
			var areaHeight = Math.round( _areaHeight );

			for ( var k = topLeftX; k < topLeftX + areaWidth; k++ ) {
				for ( var l = topLeftY; l < topLeftY + areaHeight; l++ ) {
					var pos = (k + ( frameWidth * l )) * 4; //canvas gives us rgba values in px array
					var currColour = currentRGBA[pos] + currentRGBA[pos+1] + currentRGBA[pos+2] / 3;
					var prevColour = previousRGBA[pos] + previousRGBA[pos+1] + previousRGBA[pos+2] / 3;
					var diff = _o.abs( currColour - prevColour );
					blockMovement += diff;
				}
			}
		}
		return blockMovement;
	};

	//AVERAGE COLOUR
	_o.averageColour = function( _pixels, _resolution ){
		//get current frame before running analysis
		_o.stepCamera();
		var average = {
			red: 0,
			green: 0,
			blue: 0,
			brightness: 0
		};
		if( _o.webcam.currentFrame || _pixels ){
			var pixels = _pixels || _o.webcam.currentFrame.data;
			var pixelCount = pixels.length / 4;
			var resolution = _resolution || 1;
			var total = {
				red: 0,
				green: 0,
				blue: 0,
				brightness: 0
			};
			for( var i = 0; i < pixelCount; i += resolution ){
				var loc = i * 4;
				total.red += pixels[ loc ]; 
				total.green += pixels[ loc + 1 ];
				total.blue += pixels[ loc + 2 ];
				total.brightness += total.red + total.green + total.blue / 3;
			}
			average.red = Math.round(total.red / pixelCount);
			average.green = Math.round(total.green / pixelCount);
			average.blue = Math.round(total.blue / pixelCount);
			average.brightness = Math.round(total.brightness / pixelCount);
		}
		return average;
	};

	//Device APIs
	_o.motion = {
		original: { //the technical order
			x: 0,
			y: 0,
			z: 0
		},
		//more usable for making movements
		x: 0,
		y: 0,
		z: 0
	};
	_o.pMotion = {
		original: {
			x: 0,
			y: 0,
			z: 0
		},
		x: 0,
		y: 0,
		z: 0
	};

	// ACCELEROMETER INTERACTION
	_o.trackMotion = function( x, y, z ){
		_o.pMotion.original.x = _o.motion.original.x;
		_o.pMotion.original.y = _o.motion.original.y;
		_o.pMotion.original.z = _o.motion.original.z;
		_o.pMotion.x = _o.motion.x;
		_o.pMotion.y = _o.motion.y;
		_o.pMotion.z = _o.motion.z;
		_o.motion.original.x = x;
		_o.motion.original.y = y;
		_o.motion.original.z = z;
		_o.motion.x = y;
		_o.motion.y = x;
		_o.motion.z = z;
	};

	_o.listenForMotion = function(){
		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', function(event) {
				_o.trackMotion( event.beta, event.gamma, event.alpha );
			}, true);
		} else if (window.DeviceMotionEvent) {
			window.addEventListener('devicemotion', function(event) {
				_o.trackMotion(event.acceleration.x * 2, event.acceleration.y * 2, event.acceleration.z* 2 );
			}, true);
		} else {
			window.addEventListener('MozOrientation', function(orientation) {
				_o.trackMotion( orientation.x * 50, orientation.y * 50, orientation.z * 50 );
			}, true);
		}
	};

	_o.listenForMotion();


// SHIVS/SHIMS

	// REQUEST ANIMATION FRAME
	// SEE: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	requestAnimationFrame = (function(){

		return	window.requestAnimationFrame		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				window.oRequestAnimationFrame		||
				window.msRequestAnimationFrame		||
				function( callback ){ //fallback to setTimeout
					window.setTimeout(callback, 1000 / 60);
				};

	})();


// END _o.

})( typeof window === 'undefined' ? this : window );

// END