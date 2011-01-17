//TODO:inject library javascript that we need
/*	document.writeln("<script src='../carjs/json2.js'></script>");
 document.writeln("<script src='../carjs/json_parse.js'></script>");
 document.writeln("<script src='../carjs/jquery.js'></script>");*/
jQuery(function(){
	$$init();
});

function $$arrRemove(arr, index) {
	  var origLength = arr.length;
		var rest = arr.slice(parseFloat(index) + 1 );
	  arr.length = index;
	  arr.push.apply(arr, rest);
	  if(origLength - arr.length != 1) alert('problem with arrRemove:(');
};

function $$init() {
	alert = $$devnull;
	prompt = $$devnull;
	confirm = $$devnull; //TODO: log the return value of confirm
	
	$$setTIMap = [];
	$$oldST = setTimeout;
	$$oldSI = setInterval;
	
	setTimeout = function(ptr, time){
		$$setTIMap.push(ptr);
	}
	
	setInterval = function(ptr, time){
		$$setTIMap.push(ptr);
	}

	randValues = [];
	currRandIt = 0;
	Math.random = function() {
		return randValues[currRandIt++];
	};

	$$counter = 0; // global counter for objects
	$$map = []; // global map of objects

	var $$calls = []; //TODO: change name to calls
	jQuery.ajax({
		url: '../carjs/gimmerands.jsp',
		async:   false,
		success: function(data){
					randValues = data.split(',');
				},
		type: 'POST'
	});
	jQuery.post('../carjs/gimmefuncs.jsp', function(data) {
		data = data.trim();
		// console.log(data);
		var rows = data.split("__");
		// console.log(rows);
		for ( var i = 0; i < rows.length; i++) {
			rows[i] = jQuery.trim(rows[i]);
			if (rows[i]) {
				// row of log will be an array with following contents
				// [function name, arg1, arg2..., timestamp]
				// args are of two types - pointers in map which will be
				// prefixed with '$$'
				// otherwise it's the actual object that has been JSONified
				unJSONrow = JSON.parse(rows[i]);

				var funcName = unJSONrow[0];
				var funcArgs = unJSONrow[1];
				var funcTime = unJSONrow[2];

				/*if (funcName == "$$RAND") {
					randValues.push(funcArgs);
					continue;
				}*/

				var call = [];
				call.push(funcName)
				for ( var j = 0; j < funcArgs.length; j++) {
					call.push(funcArgs[j]);
				}

				$$calls.push(call);
			}
		}
		$$executor = new Executor($$calls);
		//$$executor.stepNum(Number.MAX_VALUE);
		
		$$popup = window.open('../carjs/controller.html','controller','height=150,width=250')
		if ($$popup.focus) {$$popup.focus()};
		/*if (!$$popup.document.getElementById('step')){
			$$popup.document.writeln("<button id='step' onclick='opener.$$executor.step()'>Step</button><br>");
			$$popup.document.writeln("<button id='stepall' onclick='opener.$$executor.stepAll()' >Run to end</button><br>");
			
		}*/
	});

}

function $$devnull() {
	// do nothing

}

function Executor($$calls){
	this.currI = 0;
	
	this.stepAll = function(){
		while(this.step());
	}
	
	this.stepNum = function(num){
		for (;num > 0; num--){
			if (!this.step()) break;	//break if the step didn't do anything aka nothing more to process from log
		}
	}
	
	//step does one step and returns if it did anything for that call
	this.step = function(){
		if (this.currI == $$calls.length) return false;
		var call = $$calls[this.currI++];
		$$popup.document.getElementById('stepinfo').innerHTML = $$calls[this.currI];
		$$popup.document.getElementById('next_i').innerHTML = this.currI;
		//process the arguments to the function call (note that the loop starts from 1)
		//this loop corrects the argument in place in 'call'. By correct I mean that
		//if some object like event needs to be created, it will create and put in 
		//in that place in array 'call'
		var dispatched = false;
		for ( var j = 1; j < call.length; j++) {
			if ($$checkType(call[j], 'string') && call[j].match(/^\$\$map/)) { 
				// if it's an argument that is a map counter
				var counter = call[j].substr(5);
				call[j] = $$map[counter];
			} else if ($$checkType(call[j], 'object')
					&& $$checkType(call[j][0], 'string')
					&& call[j][0].match(/^\$\$/)) {
				// system object like event or element that we need to recreate
				var objectType = call[j][0].substr(2);
				var originalCallObject = call[j];
				var target = originalCallObject[1].target;
				//TODO: cleanup to remove redundant statements in key and mouse events branches
				if (objectType.match(/event/i)){

					$$dispatchEvent(originalCallObject[1]);
					dispatched = true;
					break;

				}
				else if (objectType.match(/element/i)) {
					//because element will be logged as [$$eventa,] for anchor element ('$$event' prefix)
					//we remove the first 'event' prefix from it.
					objectType = objectType.substr(5); 
					call[j] = document.createElement(objectType);
					for ( var prop in originalCallObject[1]) {
						// overwrite properties from actual object captured
						call[j][prop] = originalCallObject[1][prop]; 
					}
				} else {
					alert("Cannot recreate object. Is not element or event: " + objectType);
				}
			}
		}
		if (dispatched) return true;
		var funcName = call[0];
		if (funcName.match(/^\$\$setTI/)){
			var info = funcName.split('_');
			var ptrIndex = info[1];
			var ptr = $$setTIMap[ptrIndex];
			$$arrRemove($$setTIMap, ptrIndex);
			var args = [];
			var k = 1;
			for (; k < call.length; k++){
				args.push(call[k]);
			}
			ptr.apply(this, args);
		}
		else{
			var callString = funcName + "(";
			for ( var j = 1; j < call.length; j++) {
				/*if ($$checkType(call[j], 'string') && call[j].match(/^\$\$map/)) { 
						// if it's an argument that is a map counter
						var counter = call[j].substr(5);
						call[j] = $$map[counter];
					} else if ($$checkType(call[j], 'object')
							&& $$checkType(call[j][0], 'string')
							&& call[j][0].match(/^\$\$/)) {
						// system object like event or element that we need to recreate
						var objectType = call[j][0].substr(2);
						var originalCallObject = call[j];
						if (objectType.match(/event/i)) {
							call[j] = $$createEvent(objectType, originalCallObject[1]);
						} else if (objectType.match(/element/i)) {
							call[j] = document.createElement(objectType);
							for ( var prop in originalCallObject[1]) {
								// overwrite properties from actual object captured
								call[j][prop] = originalCallObject[1][prop]; 
							}
						} else {
							alert("cant't recreate object. isnot element or event");
						}

					}*/
				if (j < call.length - 1) {
					callString += "call[" + j + "],";
				} else {
					callString += "call[" + j + "]";
				}
			}
			callString += ")";
			eval(callString); //TODO: can I avoid eval and use call/apply?
		}
		return true;
	}
}


function $$startEvalsing() {
	// the call row i construct in gimmelog ajax response if of the form
	// [function name, arg1, arg2...]
	var i = 0;
	outer:
	for ( ; i < $$calls.length; i++) {
		var call = $$calls[i];
		
		//process the arguments to the function call (note that the loop starts from 1)
		//this loop corrects the argument in place in 'call'. By correct I mean that
		//if some object like event needs to be created, it will create and put in 
		//in that place in array 'call'
		var dispatched = false;
		for ( var j = 1; j < call.length; j++) {
			if ($$checkType(call[j], 'string') && call[j].match(/^\$\$map/)) { 
				// if it's an argument that is a map counter
				var counter = call[j].substr(5);
				call[j] = $$map[counter];
			} else if ($$checkType(call[j], 'object')
					&& $$checkType(call[j][0], 'string')
					&& call[j][0].match(/^\$\$/)) {
				// system object like event or element that we need to recreate
				var objectType = call[j][0].substr(2);
				var originalCallObject = call[j];
				var target = originalCallObject[1].target;
				//TODO: cleanup to remove redundant statements in key and mouse events branches
				if (objectType.match(/event/i)){
					
					$$dispatchEvent(originalCallObject[1]);
					dispatched = true;
					break;
					
				}
				else if (objectType.match(/element/i)) {
					//because element will be logged as [$$eventa,] for anchor element ('$$event' prefix)
					//we remove the first 'event' prefix from it.
					objectType = objectType.substr(5); 
					call[j] = document.createElement(objectType);
					for ( var prop in originalCallObject[1]) {
						// overwrite properties from actual object captured
						call[j][prop] = originalCallObject[1][prop]; 
					}
				} else {
					alert("Cannot recreate object. Is not element or event: " + objectType);
				}
			}
		}
		if (dispatched) continue;
		var funcName = call[0];
		if (funcName.match(/^\$\$setTI/)){
			var info = funcName.split('_');
			var ptrIndex = info[1];
			var ptr = $$setTIMap[ptrIndex];
			$$arrRemove($$setTIMap, ptrIndex);
			var args = [];
			var k = 1;
			for (; k < call.length; k++){
				args.push(call[k]);
			}
			ptr.apply(this, args);
		}
		else{
			var callString = funcName + "(";
			for ( var j = 1; j < call.length; j++) {
				/*if ($$checkType(call[j], 'string') && call[j].match(/^\$\$map/)) { 
					// if it's an argument that is a map counter
					var counter = call[j].substr(5);
					call[j] = $$map[counter];
				} else if ($$checkType(call[j], 'object')
						&& $$checkType(call[j][0], 'string')
						&& call[j][0].match(/^\$\$/)) {
					// system object like event or element that we need to recreate
					var objectType = call[j][0].substr(2);
					var originalCallObject = call[j];
					if (objectType.match(/event/i)) {
						call[j] = $$createEvent(objectType, originalCallObject[1]);
					} else if (objectType.match(/element/i)) {
						call[j] = document.createElement(objectType);
						for ( var prop in originalCallObject[1]) {
							// overwrite properties from actual object captured
							call[j][prop] = originalCallObject[1][prop]; 
						}
					} else {
						alert("cant't recreate object. isnot element or event");
					}
	
				}*/
				if (j < call.length - 1) {
					callString += "call[" + j + "],";
				} else {
					callString += "call[" + j + "]";
				}
			}
			callString += ")";
			eval(callString); //TODO: can I avoid eval and use call/apply?
		}
	}
}


function $$dispatchEvent(loggedObject) {
	var type = loggedObject.type;
	if (type.match(/key/i)){
		type = "KeyboardEvent";
	}
	else if (type.match(/click/i) || type.match(/mouse/i)){
		type = "MouseEvent";
	}
	else{
		alert('carjs error: unsupported event type');
	}
	
	var ev = document.createEvent(type);
	
	var target = loggedObject.target;
	delete loggedObject.target; //target should not get mixed up with event properties
	
	// since event parameters can only be set thru initEvent
	// I have to check which of the properties are modified and use that
	// else send the default value of that property to initEvent
	// It sucks that I can't do ev.type = "keydown"
	// props in order for initEvent are: (type, canBubble, cancelable, view,
	// detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey,
	// metaKey,
	// button, relatedTarget)
	var props;
	switch (type) {
	case 'MouseEvent':
		//mouse initevent api for FF and Chrome looks same according to spec of browsers
		props = {
			'type' : '',
			'canBubble' : false,
			'cancelable' : false,
			'view' : null,
			'detail' : 0,
			'screenX' : 0,
			'screenY' : 0,
			'clientX' : 0,
			'clientY' : 0,
			'ctrlKey' : false,
			'altKey' : false,
			'shiftKey' : false,
			'metaKey' : false,
			'button' : 0,
			'relatedTarget' : null
		};
		break;
	case 'KeyboardEvent':
		//possibly a webkit only fix
		if (loggedObject.keyCode == undefined){
			loggedObject.keyCode = loggedObject.keyIdentifier; //hopefully this property is present
		}
		
		
		//keyboard init*event in FF and chrome are different. So we need to do some 
		//work here. ARRRGGGH!
		
		
		if (jQuery.browser.webkit){
			props = {
					'type' : '',
					'bubbles' : false,
					'cancelable' : false,
					'view' : null,
					'keyCode' : 0,
					'location' : ""
			}
		}
		else if (jQuery.browser.mozilla){
			props = {
					type : '',
					bubbles : false,
					cancelable : false,
					view : null,
					ctrlKey : false,
					altKey : false,
					shiftKey : false,
					metaKey : false,
					keyCode : 0,
					charCode : 0
			}
		}

		break;
	default:
		alert("unsupported event type");
	}
	var propsArray = [];
	var i = 0;

	// better implementation is necessary. if location etc have to work
	// for keyboard event. Sadly it's not a direct match of initEVent arg to
	// event property name.
	// for now event type and keycode will work which is all i care for tetris
	for ( var prop in props) {
		if (loggedObject[prop] != undefined) {
			props[prop] = loggedObject[prop];
		}
		propsArray[i++] = props[prop];
	}

	switch (type) {
	case 'MouseEvent':
		ev.initMouseEvent.apply(ev, propsArray);
		break;
	case 'KeyboardEvent':

		if (jQuery.browser.webkit){
			ev.initKeyboardEvent.apply(ev, propsArray); 
		}
		else{
			ev.initKeyEvent.apply(ev, propsArray); 
		}
		break;
	default:
		alert("unsupported event type");
	}
	if (target){
		document.getElementById(target).dispatchEvent(ev);
	}
	else{//assuming that target is document and hope someone takes it
		document.dispatchEvent(ev);
	}
}

function $$checkType(object, type) {
	// I wanted it to work irrespective of case
	// this function is a super complicated implementation of equalsIgnoreCase

	var regex = new RegExp(type, "i");
	if ((typeof object).match(regex))
		return true;
	else
		return false;
}

function $$logEntry(whatWasThis, funcName, origArgs) {
	// in replay we don't need to actually log anything. All we need to do is to
	// map
	// the objects into $$map

	// inject a counter in that object for knowing that object's global counter
	// value
	if (whatWasThis != window) {
		whatWasThis.$$counter = $$counter;
		$$map[$$counter] = whatWasThis;
		$$counter++;
	}
}

function $$logExit(funcName) {
	// do nothing in replay. Just return the original return value of function
	return arguments[arguments.length - 1];
}

// Input 0
Tetris = function() {
  return $$anonym5($$anonym3, $$anonym2, $$anonym1, $$anonym0, $$anonym4, arguments.callee)
}();
function $$anonym0(id, origCallee) {
  $$logEntry(this, "$$anonym0", arguments, origCallee);
  return $$logExit("$$anonym0", document.getElementById(id))
}
function $$anonym1(tag, origCallee) {
  $$logEntry(this, "$$anonym1", arguments, origCallee);
  return $$logExit("$$anonym1", document.createElement(tag))
}
function $$anonym2(scale, pieceDesc, fieldRows, rotateX, activePieceType, rotateY, j, i, field, curX, curY, activePiece, activeRot, origCallee) {
  $$logEntry(this, "$$anonym2", arguments, origCallee);
  if(pieceDesc[i][j]) {
    var px = rotateX(j, i, pieceDesc.length, activeRot);
    var py = rotateY(j, i, pieceDesc.length, activeRot);
    var block = activePiece.blocks[py][px];
    activePiece.removeChild(block);
    fieldRows[curY + py].appendChild(block);
    block.style.left = (curX + px) * scale + "px";
    block.style.top = "0px";
    field[curY + py][curX + px] = activePieceType + 1
  }
  $$logExit("$$anonym2")
}
function $$anonym3(response, callback, script, origCallee) {
  $$logEntry(this, "$$anonym3", arguments, origCallee);
  document.body.removeChild(script);
  if(callback) {
    callback(response)
  }
  $$logExit("$$anonym3")
}
function $$anonym4(res, wasPaused, origCallee) {
  $$logEntry(this, "$$anonym4", arguments, origCallee);
  if(res.ok) {
    prompt("Your game has been saved. Go to this URL to load the game whenever you please:", res.tinyurl)
  }else {
    alert("Oops. Something went wrong when trying to save the game!")
  }
  paused = wasPaused;
  $$logExit("$$anonym4")
}
function $$anonym5($$anonym3, $$anonym2, $$anonym1, $$anonym0, $$anonym4, origCallee) {
  $$logEntry(this, "$$anonym5", arguments, origCallee);
  var scale = 24;
  var width = 10;
  var height = 20;
  var speed = 1E3;
  var $ = function(id) {
    return $$anonym0(id, arguments.callee)
  };
  var dc = function(tag) {
    return $$anonym1(tag, arguments.callee)
  };
  var levels = [{p:500, s:1E3, bg:"sun.jpg"}, {p:1E3, s:700, bg:"mercury.jpg"}, {p:2E3, s:500, bg:"venus.jpg"}, {p:5E3, s:400, bg:"earth.jpg"}, {p:1E4, s:300, bg:"mars.jpg"}, {p:25E3, s:200, bg:"jupiter.jpg"}, {p:5E4, s:150, bg:"saturn.jpg"}, {p:1E5, s:100, bg:"uranus.jpg"}, {p:25E4, s:75, bg:"neptune.jpg"}];
  var game;
  var paused = false;
  var running = false;
  var activePiece;
  var activePieceType = -1;
  var nextPieceType = -1;
  var activeRot = 0;
  var field = [];
  var fieldRows = [];
  var level = 0;
  var score = 0;
  var lineScore = [30, 120, 270, 520];
  var lines = 0;
  var curX = 0;
  var curY = 0;
  var timer = 0;
  function init() {
    $$logEntry(this, "init", arguments, arguments.callee);
    game = $("gamefield");
    updateGameInfo();
    registerEvents();
    if(location.search) {
      loadGame(decodeURIComponent(location.search.substring(1)))
    }else {
      splash()
    }
    $$logExit("init")
  }
  function clearField() {
    $$logEntry(this, "clearField", arguments, arguments.callee);
    game.innerHTML = "";
    fieldRows = [];
    for(var y = 0;y < height;y++) {
      var row = dc("div");
      row.style.position = "absolute";
      row.style.top = y * scale + "px";
      row.style.left = "0px";
      row.style.width = width * scale + "px";
      row.style.height = scale + "px";
      fieldRows[y] = row;
      game.appendChild(row);
      field[y] = [];
      for(var x = 0;x < width;x++) {
        field[y][x] = 0
      }
    }
    $$logExit("clearField")
  }
  function splash() {
    $$logEntry(this, "splash", arguments, arguments.callee);
    $$logExit("splash")
  }
  function registerEvents() {
    $$logEntry(this, "registerEvents", arguments, arguments.callee);
    addEvent(document, "keydown", onKeyDown);
    $$logExit("registerEvents")
  }
  function addEvent(el, event, handler) {
    $$logEntry(this, "addEvent", arguments, arguments.callee);
    if(el.addEventListener) {
      el.addEventListener(event, handler, false)
    }else {
      if(el.attachEvent) {
        el.attachEvent("on" + event, handler)
      }
    }
    $$logExit("addEvent")
  }
  function onKeyDown(e) {
    $$logEntry(this, "onKeyDown", arguments, arguments.callee);
    e = e || window.event;
    var keyCode = e.which || e.keyCode;
    switch(keyCode) {
      case 13:
        dropPiece();
        break;
      case 32:
        if(!running) {
          startGame();
          return $$logExit("$$anonym5", $$logExit("onKeyDown"))
        }
      ;
      case 38:
        rotateActivePiece();
        break;
      case 39:
        moveActivePiece(1, 0);
        break;
      case 37:
        moveActivePiece(-1, 0);
        break;
      case 40:
        moveActivePiece(0, 1);
        break;
      case 83:
        saveGame();
        break;
      case 80:
        togglePause();
      default:
        return $$logExit("$$anonym5", $$logExit("onKeyDown", false))
    }
    if(e.preventDefault) {
      e.preventDefault()
    }
    return $$logExit("$$anonym5", $$logExit("onKeyDown", true))
  }
  function dropPiece() {
    $$logEntry(this, "dropPiece", arguments, arguments.callee);
    for(var y = 0;y < height;y++) {
      if(!moveActivePiece(0, 1)) {
        break
      }
    }
    $$logExit("dropPiece")
  }
  function menu() {
    $$logEntry(this, "menu", arguments, arguments.callee);
    $$logExit("menu")
  }
  function startGame() {
    $$logEntry(this, "startGame", arguments, arguments.callee);
    speed = levels[level].s;
    clearField();
    updateGameInfo();
    running = true;
    nextCycle();
    $$logExit("startGame")
  }
  function cycle() {
    $$logEntry(this, "cycle", arguments, arguments.callee);
    if(running) {
      if(!paused) {
        if(!activePiece) {
          activePieceType = nextPieceType > -1 ? nextPieceType : Math.floor(Math.random() * basePieces.length);
          activePiece = createPiece(activePieceType);
          activeRot = 0;
          curX = Math.floor(width / 2 - 2);
          curY = 0;
          rebuildPiece(activePiece, activePieceType, activeRot);
          game.appendChild(activePiece);
          if(!canMoveTo(curX, curY)) {
            gameOver();
            return $$logExit("$$anonym5", $$logExit("cycle"))
          }
          nextPieceType = Math.floor(Math.random() * basePieces.length);
          updateNextPiece();
          moveActivePiece(0, 0)
        }else {
          moveActivePiece(0, 1)
        }
      }
      nextCycle()
    }
    $$logExit("cycle")
  }
  function nextCycle() {
    $$logEntry(this, "nextCycle", arguments, arguments.callee);
    clearTimeout(timer);
    timer = setTimeout(cycle, speed);
    $$logExit("nextCycle")
  }
  function togglePause() {
    $$logEntry(this, "togglePause", arguments, arguments.callee);
    paused = !paused;
    if(paused) {
    }else {
    }
    $$logExit("togglePause")
  }
  function gameOver() {
    $$logEntry(this, "gameOver", arguments, arguments.callee);
    running = false;
    activePiece = null;
    $$logExit("gameOver")
  }
  function rotateActivePiece() {
    $$logEntry(this, "rotateActivePiece", arguments, arguments.callee);
    if(!activePiece) {
      return $$logExit("$$anonym5", $$logExit("rotateActivePiece"))
    }
    if(paused || !running) {
      return $$logExit("$$anonym5", $$logExit("rotateActivePiece"))
    }
    activeRot++;
    if(activeRot > 3) {
      activeRot = 0
    }
    if(canMoveTo(curX, curY)) {
      rebuildPiece(activePiece, activePieceType, activeRot)
    }else {
      activeRot--;
      if(activeRot < 0) {
        activeRot = 3
      }
    }
    $$logExit("rotateActivePiece")
  }
  function moveActivePiece(addX, addY) {
    $$logEntry(this, "moveActivePiece", arguments, arguments.callee);
    if(!activePiece) {
      return $$logExit("$$anonym5", $$logExit("moveActivePiece"))
    }
    if(paused || !running) {
      return $$logExit("$$anonym5", $$logExit("moveActivePiece"))
    }
    var newX = curX + addX;
    var newY = curY + addY;
    if(canMoveTo(newX, newY)) {
      curX = newX;
      curY = newY;
      activePiece.style.left = curX * scale + "px";
      activePiece.style.top = curY * scale + "px";
      return $$logExit("$$anonym5", $$logExit("moveActivePiece", true))
    }else {
      if(addY > 0) {
        landPiece();
        activePiece = null
      }
    }
    return $$logExit("$$anonym5", $$logExit("moveActivePiece", false))
  }
  function landPiece() {
    $$logEntry(this, "landPiece", arguments, arguments.callee);
    var pieceDesc = basePieces[activePieceType];
    for(var i = 0;i < pieceDesc.length;i++) {
      for(var j = 0;j < pieceDesc.length;j++) {
        (function() {
          return $$anonym2(scale, pieceDesc, fieldRows, rotateX, activePieceType, rotateY, j, i, field, curX, curY, activePiece, activeRot, arguments.callee)
        })()
      }
    }
    game.removeChild(activePiece);
    setTimeout(checkRows, 50);
    nextCycle();
    $$logExit("landPiece")
  }
  function checkRows() {
    $$logEntry(this, "checkRows", arguments, arguments.callee);
    var fullRows = [];
    for(var y = 0;y < height;y++) {
      var rowFull = true;
      for(var x = 0;x < width;x++) {
        if(!field[y][x]) {
          rowFull = false
        }
      }
      if(rowFull) {
        fullRows.push(y)
      }
    }
    if(fullRows.length) {
      score += lineScore[fullRows.length - 1] * (level + 1);
      lines += fullRows.length;
      updateGameInfo();
      checkLevel()
    }
    for(var i = 0;i < fullRows.length;i++) {
      var copyField = [];
      var copyRows = [];
      for(var y = 0;y < height;y++) {
        copyField[y] = [];
        copyRows[y] = fieldRows[y].innerHTML;
        for(var x = 0;x < width;x++) {
          copyField[y][x] = field[y][x]
        }
      }
      fieldRows[fullRows[i]].innerHTML = "";
      for(var y = fullRows[i];y >= 0;y--) {
        fieldRows[y].innerHTML = copyRows[y - 1] || "";
        for(var x = 0;x < width;x++) {
          field[y][x] = y > 0 ? copyField[y - 1][x] : 0
        }
      }
    }
    $$logExit("checkRows")
  }
  function updateGameInfo() {
    $$logEntry(this, "updateGameInfo", arguments, arguments.callee);
    $("tetris-score-text").innerHTML = "Score: " + score;
    $("tetris-lines-text").innerHTML = "Lines: " + lines;
    $("tetris-level-text").innerHTML = "Level: " + (level + 1);
    $$logExit("updateGameInfo")
  }
  function checkLevel() {
    $$logEntry(this, "checkLevel", arguments, arguments.callee);
    if(levels[level]) {
      if(score >= levels[level].p) {
        level++;
        speed = levels[level].s;
        updateGameInfo()
      }
    }
    $$logExit("checkLevel")
  }
  function canMoveTo(x, y) {
    $$logEntry(this, "canMoveTo", arguments, arguments.callee);
    var pieceDesc = basePieces[activePieceType];
    for(var i = 0;i < pieceDesc.length;i++) {
      for(var j = 0;j < pieceDesc.length;j++) {
        if(pieceDesc[i][j]) {
          var px = rotateX(j, i, pieceDesc.length, activeRot);
          var py = rotateY(j, i, pieceDesc.length, activeRot);
          if(isBlocked(x + px, y + py)) {
            return $$logExit("$$anonym5", $$logExit("canMoveTo", false))
          }
        }
      }
    }
    return $$logExit("$$anonym5", $$logExit("canMoveTo", true))
  }
  function isBlocked(x, y) {
    $$logEntry(this, "isBlocked", arguments, arguments.callee);
    if(x < 0 || y < 0) {
      return $$logExit("$$anonym5", $$logExit("isBlocked", true))
    }
    if(x >= width || y >= height) {
      return $$logExit("$$anonym5", $$logExit("isBlocked", true))
    }
    return $$logExit("$$anonym5", $$logExit("isBlocked", field[y][x]))
  }
  function nextLevel() {
    $$logEntry(this, "nextLevel", arguments, arguments.callee);
    $$logExit("nextLevel")
  }
  var basePieces = [[[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], [[0, 0, 1], [0, 0, 1], [0, 1, 1]], [[1, 1, 1], [0, 1, 0], [0, 0, 0]], [[1, 0, 0], [1, 0, 0], [1, 1, 0]], [[1, 1], [1, 1]], [[0, 1, 1], [1, 1, 0], [0, 0, 0]], [[1, 1, 0], [0, 1, 1], [0, 0, 0]]];
  var pieceColors = ["#00f0f0", "#0000f0", "#a000f0", "#f0a000", "#f0f000", "#f00000", "#00f000"];
  function createPiece(pieceType) {
    $$logEntry(this, "createPiece", arguments, arguments.callee);
    var pieceDesc = basePieces[pieceType];
    var div = dc("div");
    div.style.position = "absolute";
    div.style.top = curY * scale + "px";
    div.style.left = curX * scale + "px";
    div.style.width = pieceDesc.length * scale + "px";
    div.style.height = pieceDesc.length * scale + "px";
    return $$logExit("$$anonym5", $$logExit("createPiece", div))
  }
  function updateNextPiece() {
    $$logEntry(this, "updateNextPiece", arguments, arguments.callee);
    var div = $("tetris-next-piece");
    div.innerHTML = "";
    var piece = createPiece(nextPieceType);
    var rot = 0;
    piece.style.left = "48px";
    piece.style.top = "24px";
    switch(nextPieceType) {
      case 0:
        rot = 1;
        piece.style.top = "0px";
        break;
      case 2:
        rot = 3;
        break;
      case 3:
      ;
      case 4:
        piece.style.left = "72px";
        break;
      case 5:
      ;
      case 6:
        rot = 1;
        piece.style.left = "72px";
        break;
      default:
    }
    rebuildPiece(piece, nextPieceType, rot);
    div.appendChild(piece);
    $$logExit("updateNextPiece")
  }
  function rebuildPiece(div, pieceType, rot) {
    $$logEntry(this, "rebuildPiece", arguments, arguments.callee);
    div.innerHTML = "";
    var pieceDesc = basePieces[pieceType];
    div.blocks = [];
    for(var i = 0;i < pieceDesc.length;i++) {
      div.blocks[i] = []
    }
    for(var i = 0;i < pieceDesc.length;i++) {
      for(var j = 0;j < pieceDesc.length;j++) {
        if(pieceDesc[i][j]) {
          var px = rotateX(j, i, pieceDesc.length, rot);
          var py = rotateY(j, i, pieceDesc.length, rot);
          var block = createBlock(pieceColors[pieceType], px, py, pieceDesc.length);
          div.appendChild(block);
          div.blocks[py][px] = block
        }
      }
    }
    $$logExit("rebuildPiece")
  }
  function rotateX(j, i, size, rot) {
    $$logEntry(this, "rotateX", arguments, arguments.callee);
    switch(rot) {
      case 0:
        var px = j;
        break;
      case 1:
        var px = i;
        break;
      case 2:
        var px = size - 1 - j;
        break;
      case 3:
        var px = size - 1 - i;
        break
    }
    return $$logExit("$$anonym5", $$logExit("rotateX", px))
  }
  function rotateY(j, i, size, rot) {
    $$logEntry(this, "rotateY", arguments, arguments.callee);
    switch(rot) {
      case 0:
        var py = i;
        break;
      case 1:
        var py = size - 1 - j;
        break;
      case 2:
        var py = size - 1 - i;
        break;
      case 3:
        var py = j;
        break
    }
    return $$logExit("$$anonym5", $$logExit("rotateY", py))
  }
  function createBlock(color, x, y) {
    $$logEntry(this, "createBlock", arguments, arguments.callee);
    var div = dc("div");
    div.className = "tetris-block";
    div.style.backgroundColor = color;
    div.style.borderColor = color;
    div.style.left = x * scale + "px";
    div.style.top = y * scale + "px";
    return $$logExit("$$anonym5", $$logExit("createBlock", div))
  }
  function serialize() {
    $$logEntry(this, "serialize", arguments, arguments.callee);
    var fieldString = '"';
    for(var y = 0;y < height;y++) {
      for(var x = 0;x < width;x++) {
        fieldString += field[y][x]
      }
    }
    fieldString += '"';
    var pieceString = "{" + "x:" + curX + ",y:" + curY + ",r:" + activeRot + ",t:" + activePieceType + "}";
    var gameString = "{" + "f:" + fieldString + "," + "p:" + pieceString + "," + "n:" + nextPieceType + "," + "s:" + score + "," + "v:" + level + "," + "l:" + lines + "}";
    return $$logExit("$$anonym5", $$logExit("serialize", gameString))
  }
  function loadGame(gameString) {
    $$logEntry(this, "loadGame", arguments, arguments.callee);
    clearField();
    var oldGame = eval("(" + gameString + ")");
    var f = oldGame.f.split("");
    var p = oldGame.p;
    for(var y = 0;y < height;y++) {
      for(var x = 0;x < width;x++) {
        field[y][x] = parseInt(f.shift(), 10);
        if(field[y][x]) {
          var block = createBlock(pieceColors[field[y][x] - 1], x, 0);
          fieldRows[y].appendChild(block)
        }
      }
    }
    activeRot = p.r;
    curX = p.x;
    curY = p.y;
    activePieceType = p.t;
    nextPieceType = oldGame.n;
    score = oldGame.s;
    level = oldGame.v;
    lines = oldGame.l;
    speed = levels[level].s;
    updateGameInfo();
    updateNextPiece();
    activePiece = createPiece(activePieceType);
    rebuildPiece(activePiece, activePieceType, activeRot);
    curY = p.y;
    curX = p.x;
    activePiece.style.top = curY * scale + "px";
    activePiece.style.left = curX * scale + "px";
    game.appendChild(activePiece);
    if(!running) {
      running = true;
      nextCycle()
    }
    $$logExit("loadGame")
  }
  window.__json_callbacks = {};
  var jsonCallCount = 0;
  function callJSON(url, callback) {
    $$logEntry(this, "callJSON", arguments, arguments.callee);
    jsonCallCount++;
    var script = document.createElement("script");
    window.__json_callbacks["fn_" + jsonCallCount] = function(response) {
      return $$anonym3(response, callback, script, arguments.callee)
    };
    script.setAttribute("type", "text/javascript");
    document.body.appendChild(script);
    script.src = url + "&callback=__json_callbacks.fn_" + jsonCallCount;
    $$logExit("callJSON")
  }
  function saveGame() {
    $$logEntry(this, "saveGame", arguments, arguments.callee);
    if(!running) {
      return $$logExit("$$anonym5", $$logExit("saveGame"))
    }
    var wasPaused = paused;
    paused = true;
    var gameString = serialize();
    var url = "http://www.nihilogic.dk/labs/tetris/?" + encodeURIComponent(gameString);
    callJSON("http://json-tinyurl.appspot.com/?url=" + encodeURIComponent(url), function(res) {
      return $$anonym4(res, wasPaused, arguments.callee)
    });
    $$logExit("saveGame")
  }
  return $$logExit("$$anonym5", init)
}
;

