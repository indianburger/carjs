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
function setupPlayer(ispc) {
  $$logEntry(this, "setupPlayer", arguments, arguments.callee);
  var y, x;
  grid = [];
  for(y = 0;y < gridx;++y) {
    grid[y] = [];
    for(x = 0;x < gridx;++x) {
      grid[y][x] = [100, -1, 0]
    }
  }
  var shipno = 0;
  var s;
  for(s = shiptypes.length - 1;s >= 0;--s) {
    var i;
    for(i = 0;i < shiptypes[s][2];++i) {
      var d = Math.floor(Math.random() * 2);
      var len = shiptypes[s][1], lx = gridx, ly = gridy, dx = 0, dy = 0;
      if(d == 0) {
        lx = gridx - len;
        dx = 1
      }else {
        ly = gridy - len;
        dy = 1
      }
      var x, y, ok;
      do {
        y = Math.floor(Math.random() * ly);
        x = Math.floor(Math.random() * lx);
        var j, cx = x, cy = y;
        ok = true;
        for(j = 0;j < len;++j) {
          if(grid[cy][cx][0] < 100) {
            ok = false;
            break
          }
          cx += dx;
          cy += dy
        }
      }while(!ok);
      var j, cx = x, cy = y;
      for(j = 0;j < len;++j) {
        grid[cy][cx][0] = ship[d][s][j];
        grid[cy][cx][1] = shipno;
        grid[cy][cx][2] = dead[d][s][j];
        cx += dx;
        cy += dy
      }
      if(ispc) {
        computersships[shipno] = [s, shiptypes[s][1]];
        computerlives++
      }else {
        playersships[shipno] = [s, shiptypes[s][1]];
        playerlives++
      }
      shipno++
    }
  }
  return $$logExit("setupPlayer", grid)
}
function setImage(y, x, id, ispc) {
  $$logEntry(this, "setImage", arguments, arguments.callee);
  if(ispc) {
    computer[y][x][0] = id;
    document.images["pc" + y + "_" + x].src = "batt" + id + ".gif"
  }else {
    player[y][x][0] = id;
    document.images["ply" + y + "_" + x].src = "batt" + id + ".gif"
  }
  $$logExit("setImage")
}
function showGrid(ispc) {
  $$logEntry(this, "showGrid", arguments, arguments.callee);
  var y, x;
  for(y = 0;y < gridy;++y) {
    for(x = 0;x < gridx;++x) {
      if(ispc) {
        document.write('<a href="javascript:gridClick(' + y + "," + x + ');"><img name="pc' + y + "_" + x + '" src="batt100.gif" width=16 height=16></a>')
      }else {
        document.write('<a href="javascript:void(0);"><img name="ply' + y + "_" + x + '" src="batt' + player[y][x][0] + '.gif" width=16 height=16></a>')
      }
    }
    document.write("<br>")
  }
  $$logExit("showGrid")
}
function gridClick(y, x) {
  $$logEntry(this, "gridClick", arguments, arguments.callee);
  if(playflag) {
    if(computer[y][x][0] < 100) {
      setImage(y, x, 103, true);
      var shipno = computer[y][x][1];
      if(--computersships[shipno][1] == 0) {
        sinkShip(computer, shipno, true);
        alert("You sank my " + shiptypes[computersships[shipno][0]][0] + "!");
        updateStatus();
        if(--computerlives == 0) {
          alert("You win! Press the Refresh button on\n" + "your browser to play another game.");
          playflag = false
        }
      }
      if(playflag) {
        computerMove()
      }
    }else {
      if(computer[y][x][0] == 100) {
        setImage(y, x, 102, true);
        computerMove()
      }
    }
  }
  $$logExit("gridClick")
}
function computerMove() {
  $$logEntry(this, "computerMove", arguments, arguments.callee);
  var x, y, pass;
  var sx, sy;
  var selected = false;
  for(pass = 0;pass < 2;++pass) {
    for(y = 0;y < gridy && !selected;++y) {
      for(x = 0;x < gridx && !selected;++x) {
        if(player[y][x][0] == 103) {
          sx = x;
          sy = y;
          var nup = y > 0 && player[y - 1][x][0] <= 100;
          var ndn = y < gridy - 1 && player[y + 1][x][0] <= 100;
          var nlt = x > 0 && player[y][x - 1][0] <= 100;
          var nrt = x < gridx - 1 && player[y][x + 1][0] <= 100;
          if(pass == 0) {
            var yup = y > 0 && player[y - 1][x][0] == 103;
            var ydn = y < gridy - 1 && player[y + 1][x][0] == 103;
            var ylt = x > 0 && player[y][x - 1][0] == 103;
            var yrt = x < gridx - 1 && player[y][x + 1][0] == 103;
            if(nlt && yrt) {
              sx = x - 1;
              selected = true
            }else {
              if(nrt && ylt) {
                sx = x + 1;
                selected = true
              }else {
                if(nup && ydn) {
                  sy = y - 1;
                  selected = true
                }else {
                  if(ndn && yup) {
                    sy = y + 1;
                    selected = true
                  }
                }
              }
            }
          }else {
            if(nlt) {
              sx = x - 1;
              selected = true
            }else {
              if(nrt) {
                sx = x + 1;
                selected = true
              }else {
                if(nup) {
                  sy = y - 1;
                  selected = true
                }else {
                  if(ndn) {
                    sy = y + 1;
                    selected = true
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if(!selected) {
    do {
      sy = Math.floor(Math.random() * gridy);
      sx = Math.floor(Math.random() * gridx / 2) * 2 + sy % 2
    }while(player[sy][sx][0] > 100)
  }
  if(player[sy][sx][0] < 100) {
    setImage(sy, sx, 103, false);
    var shipno = player[sy][sx][1];
    if(--playersships[shipno][1] == 0) {
      sinkShip(player, shipno, false);
      alert("I sank your " + shiptypes[playersships[shipno][0]][0] + "!");
      if(--playerlives == 0) {
        knowYourEnemy();
        alert("I win! Press the Refresh button on\n" + "your browser to play another game.");
        playflag = false
      }
    }
  }else {
    setImage(sy, sx, 102, false)
  }
  $$logExit("computerMove")
}
function sinkShip(grid, shipno, ispc) {
  $$logEntry(this, "sinkShip", arguments, arguments.callee);
  var y, x;
  for(y = 0;y < gridx;++y) {
    for(x = 0;x < gridx;++x) {
      if(grid[y][x][1] == shipno) {
        if(ispc) {
          setImage(y, x, computer[y][x][2], true)
        }else {
          setImage(y, x, player[y][x][2], false)
        }
      }
    }
  }
  $$logExit("sinkShip")
}
function knowYourEnemy() {
  $$logEntry(this, "knowYourEnemy", arguments, arguments.callee);
  var y, x;
  for(y = 0;y < gridx;++y) {
    for(x = 0;x < gridx;++x) {
      if(computer[y][x][0] == 103) {
        setImage(y, x, computer[y][x][2], true)
      }else {
        if(computer[y][x][0] < 100) {
          setImage(y, x, computer[y][x][0], true)
        }
      }
    }
  }
  $$logExit("knowYourEnemy")
}
function updateStatus() {
  $$logEntry(this, "updateStatus", arguments, arguments.callee);
  var f = false, i, s = "Computer has ";
  for(i = 0;i < computersships.length;++i) {
    if(computersships[i][1] > 0) {
      if(f) {
        s = s + ", "
      }else {
        f = true
      }
      s = s + shiptypes[computersships[i][0]][0]
    }
  }
  if(!f) {
    s = s + "nothing left, thanks to you!"
  }
  statusmsg = s;
  window.status = statusmsg;
  $$logExit("updateStatus")
}
function setStatus() {
  $$logEntry(this, "setStatus", arguments, arguments.callee);
  window.status = statusmsg;
  $$logExit("setStatus")
}
var ship = [[[1, 5], [1, 2, 5], [1, 2, 3, 5], [1, 2, 3, 4, 5]], [[6, 10], [6, 7, 10], [6, 7, 8, 10], [6, 7, 8, 9, 10]]];
var dead = [[[201, 203], [201, 202, 203], [201, 202, 202, 203], [201, 202, 202, 202, 203]], [[204, 206], [204, 205, 206], [204, 205, 205, 206], [204, 205, 205, 205, 206]]];
var shiptypes = [["Minesweeper", 2, 4], ["Frigate", 3, 4], ["Cruiser", 4, 2], ["Battleship", 5, 1]];
var gridx = 16, gridy = 16;
var player = [], computer = [], playersships = [], computersships = [];
var playerlives = 0, computerlives = 0, playflag = true, statusmsg = "";
var preloaded = [];
function imagePreload() {
  $$logEntry(this, "imagePreload", arguments, arguments.callee);
  var i, ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 101, 102, 103, 201, 202, 203, 204, 205, 206];
  window.status = "Preloading images...please wait";
  for(i = 0;i < ids.length;++i) {
    var img = new Image, name = "batt" + ids[i] + ".gif";
    img.src = name;
    preloaded[i] = img
  }
  window.status = "";
  $$logExit("imagePreload")
}
function $$appInit() {
  $$logEntry(this, "$$appInit", arguments, arguments.callee);
  imagePreload();
  player = setupPlayer(false);
  computer = setupPlayer(true);
  document.write("<center><table><tr><td align=center><p class='heading'>COMPUTER'S FLEET</p></td>" + "<td align=center><p class='heading'>PLAYER'S FLEET</p></td></tr><tr><td>");
  showGrid(true);
  document.write("</td><td>");
  showGrid(false);
  document.write("</td></tr></table></center>");
  updateStatus();
  $$logExit("$$appInit")
}
;

