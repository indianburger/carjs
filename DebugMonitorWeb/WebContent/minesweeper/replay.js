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
dir = "";
var mines = [];
var shown = [];
var gridx, gridy, maxmines;
gridx = window.prompt("Please enter a width.", "8");
gridxverify();
function gridxaccept() {
  $$logEntry(this, "gridxaccept", arguments, arguments.callee);
  gridy = window.prompt("Please enter a height.", "8");
  gridyverify();
  $$logExit("gridxaccept")
}
function gridyaccept() {
  $$logEntry(this, "gridyaccept", arguments, arguments.callee);
  maxmines = window.prompt("Please enter the number of mines you want.", "10");
  maxminesverify();
  $$logExit("gridyaccept")
}
function gridxverify() {
  $$logEntry(this, "gridxverify", arguments, arguments.callee);
  if(gridx > 50) {
    alert("That width is too big. Please enter a new width.");
    gridxreenter()
  }else {
    if(gridx < 8) {
      alert("That width is too small. Please enter a new width.");
      gridxreenter()
    }else {
      gridxaccept()
    }
  }
  $$logExit("gridxverify")
}
function gridyverify() {
  $$logEntry(this, "gridyverify", arguments, arguments.callee);
  if(gridy > 50) {
    alert("That height is too big. Please enter a new height.");
    gridyreenter()
  }else {
    if(gridy < 8) {
      alert("That height is too small. Please enter a new height.");
      gridyreenter()
    }else {
      gridyaccept()
    }
  }
  $$logExit("gridyverify")
}
function maxminesverify() {
  $$logEntry(this, "maxminesverify", arguments, arguments.callee);
  if(maxmines > 500) {
    alert("That number is too big. Please enter a new number of mines.");
    maxminesreenter()
  }else {
    if(maxmines < 10) {
      alert("That number is too small. Please enter a new number of mines.");
      maxminesreenter()
    }else {
      accepted()
    }
  }
  $$logExit("maxminesverify")
}
function gridxreenter() {
  $$logEntry(this, "gridxreenter", arguments, arguments.callee);
  gridx = window.prompt("Please enter a width.", "8");
  gridxverify();
  $$logExit("gridxreenter")
}
function gridyreenter() {
  $$logEntry(this, "gridyreenter", arguments, arguments.callee);
  gridy = window.prompt("Please enter a height.", "8");
  gridyverify();
  $$logExit("gridyreenter")
}
function maxminesreenter() {
  $$logEntry(this, "maxminesreenter", arguments, arguments.callee);
  maxmines = window.prompt("Please enter the number of mines you want.", "10");
  maxminesverify();
  $$logExit("maxminesreenter")
}
function accepted() {
  $$logEntry(this, "accepted", arguments, arguments.callee);
  var squaresleft, flagsleft;
  var elapsedtime;
  var playing;
  var placeflag;
  var clicked;
  $$logExit("accepted")
}
var gridSq = gridx * 16;
var grid8 = gridSq - 128;
var grid16 = gridx - 8;
var grid32 = grid16 * 8;
var grid64 = grid16 * 16;
var topBarWidth = 8 + grid64;
var menuBarWidth = 86 + grid64;
var wideWidth = gridx * 16;
var highHeight = gridy * 16;
var cplLeft = 6 + grid32;
var cplRight = 4 + grid32;
var totalWidth = gridSq + 32;
var tW6 = totalWidth - 6;
var ww2 = wideWidth + 2;
num = new Array(10);
for(var i = 0;i < 10;i++) {
  num[i] = new Image;
  num[i].src = i + ".gif"
}
function keyDown(e) {
  $$logEntry(this, "keyDown", arguments, arguments.callee);
  if(document.layers) {
    placeflag = (e.modifiers & Event.CONTROL_MASK) > 0
  }else {
    placeflag = window.event.ctrlKey
  }
  setStatus();
  $$logExit("keyDown")
}
function keyUp(e) {
  $$logEntry(this, "keyUp", arguments, arguments.callee);
  placeflag = false;
  setStatus();
  $$logExit("keyUp")
}
function newgame() {
  $$logEntry(this, "newgame", arguments, arguments.callee);
  var y;
  for(y = 0;y < gridy;++y) {
    mines[y] = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
    shown[y] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
  var m;
  for(m = 0;m < maxmines;++m) {
    var x, y;
    do {
      x = Math.floor(Math.random() * gridx);
      y = Math.floor(Math.random() * gridy)
    }while(mines[y][x]);
    mines[y][x] = true
  }
  squaresleft = gridy * gridx;
  flagsleft = maxmines;
  elapsedtime = 0;
  playing = true;
  clicked = false;
  placeflag = false;
  buildgrid();
  if(document.layers) {
    window.captureEvents(Event.KEYDOWN | Event.KEYUP)
  }
  window.onKeyDown = keyDown;
  window.onKeyUp = keyUp;
  setInterval("ticker()", 1E3);
  $$logExit("newgame")
}
function ticker() {
  $$logEntry(this, "ticker", arguments, arguments.callee);
  if(playing) {
    if(clicked) {
      elapsedtime++;
      setStatus()
    }
  }
  $$logExit("ticker")
}
function setStatus() {
  $$logEntry(this, "setStatus", arguments, arguments.callee);
  document.images.elapse3.src = num[elapsedtime - Math.floor(elapsedtime / 10) * 10].src;
  document.images.elapse2.src = num[Math.floor((elapsedtime - Math.floor(elapsedtime / 100) * 100) / 10)].src;
  document.images.elapse1.src = num[Math.floor(elapsedtime / 100)].src;
  document.images.flag3.src = num[flagsleft - Math.floor(flagsleft / 10) * 10].src;
  document.images.flag2.src = num[Math.floor((flagsleft - Math.floor(flagsleft / 100) * 100) / 10)].src;
  document.images.flag1.src = num[Math.floor(flagsleft / 100)].src;
  $$logExit("setStatus")
}
function buildgrid() {
  $$logEntry(this, "buildgrid", arguments, arguments.callee);
  document.write("<!-- Window --\><DIV align=center> " + "<!-- Top Bar --\> <table width=" + totalWidth + " border=0 cells" + "pacing=0 cellpadding=0> <tr bgcolor=#bbbbbb heigh" + "t=1> <td width=1 bgcolor=#bbbbbb></td><td width" + "=1 bgcolor=#bbbbbb></td> <td width=1 bgcolor=#bbb" + "bbb></td><td width=" + tW6 + " bgcolor=#bbbbbb></td> <t" + "d width=1 bgcolor=#bbbbbb></td> <td width=1 bgcol" + "or=#bbbbbb></td> <td width=1 bgcolor=#000000></td" + "></tr><tr height=1><td width=1 bgcolor=#bbbb" + 
  "bb></td><td width=1 bgcolor=#ffffff></td><td w" + "idth=1 bgcolor=#ffffff></td><td bgcolor=#ffffff>" + "</td><td width=1 bgcolor=#ffffff></td><td widt" + "h=1 bgcolor=#888888></td><td width=1 bgcolor=#00" + "0000></td></tr><tr height=1><td width=1 bgco" + "lor=#bbbbbb></td><td width=1 bgcolor=#ffffff></t" + "d><td width=1 bgcolor=#bbbbbb></td><td bgcolor" + "=#bbbbbb></td><td width=1 bgcolor=#bbbbbb></td> " + "<td width=1 bgcolor=#888888></td><td width=1 bg" + "color=#000000></td></tr></table><!-- Title --\>" + 
  "<table border=0 cellspacing=0 cellpadding=0><t" + "r height=18><td width=1 bgcolor=#bbbbbb></td><" + "td width=1 bgcolor=#ffffff></td><td width=1 bgco" + "lor=#bbbbbb></td><td bgcolor=#000088><img src='t" + "itle.gif'><img src='a.gif' height=1 width=" + topBarWidth + " name=" + "'titleBarEmptySpace'></td><td><img src='buttons." + "gif'></td><td width=1 bgcolor=#bbbbbb></td><td" + " width=1 bgcolor=#888888></td><td width=1 bgcolo" + "r=#000000></td></tr></table><!-- Menu Bar --\> " + "<table border=0 cellspacing=0 cellpadding=0> <tr" + 
  " height=20 bgcolor=#bbbbbb> <td width=1 bgcolor=#" + "bbbbbb></td> <td><img src='menu.gif'></td><td> <" + "img src='a.gif' height=1 width=" + menuBarWidth + " name='menuBarEmp" + "tySpace'></td> <td width=1 bgcolor=#bbbbbb></td> " + "<td width=1 bgcolor=#888888></td> <td width=1 bg" + "color=#000000></td> </tr></table> <!-- Mine Fiel" + "d --\> <table border=0 cellspacing=0 cellpadding=0" + "> <tr height=11 width=160> <td width=1 bgcolor=#" + "bbbbbb></td> <td width=1 bgcolor=#ffffff></td> <" + 
  "td width=1 bgcolor=#bbbbbb></td> <td><img src='tl" + ".gif'></td> <td><img src='header.gif' width=" + ww2 + " height=11></td> <td><img src='tr.gif'></td><td><" + "img src='right.gif' width=5 height=11></td> </tr>" + "</table><table width=" + totalWidth + " border=0 cellspacing=0 cellpadd" + "ing=0> <tr height=33> <td width=1 bgcolor=#bbbbb" + "b></td> <td width=1 bgcolor=#ffffff></td> <td wi" + "dth=1 bgcolor=#bbbbbb></td> <td><img src='cplleft" + ".gif' height=33 width=11></td> <td> <!-- Control" + 
  " Panel --\> <table width=" + ww2 + " border=0 cellspacing=" + "0 cellpadding=0><tr height=4 width=" + ww2 + "><td bgcolor=#bbbbbb" + "></td></tr></table> <table width=" + ww2 + " border=0 cel" + "lspacing=0 cellpadding=0><tr height=26><td " + "width=5 bgcolor=#bbbbbb></td><td><!-- Mines Remai" + "ning --\> <table width=41 border=0 cellspacing=0 c" + "ellpadding=0><tr bgcolor=#888888><td></td><td>" + "</td><td></td> <td></td><td></td><td></td> <td><" + "/td><td></td> <td width=1 bgcolor=#bbbbbb></td></" + 
  "tr> <tr bgcolor=#000000> <td width=1 bgcolor=#88" + "8888></td> <td></td><td></td> <td></td><td></td>" + "<td></td><td></td><td></td> <td width=1 bgcolor" + "=#ffffff></td></tr> <tr bgcolor=#000000> <td wid" + "th=1 bgcolor=#888888></td> <td width=1 bgcolor=#0" + "00000></td> <td><img src='0.gif' name='flag1'></t" + "d><td width=2></td><td><img src='1.gif' name='" + "flag2'></td><td width=2></td><td><img src='0.g" + "if' name='flag3'></td><td width=1></td> <td wid" + "th=1 bgcolor=#ffffff></td></tr> <tr bgcolor=#0000" + 
  "00> <td width=1 bgcolor=#888888></td> <td></td><" + "td></td> <td></td><td></td><td></td> <td></td><t" + "d></td> <td width=1 bgcolor=#ffffff></td></tr> <" + "tr bgcolor=#ffffff> <td width=1 bgcolor=#bbbbbb><" + "/td> <td></td><td></td> <td></td><td></td><td></" + "td> <td></td><td></td> <td></td></tr><" + "tr bgcolor=#bbbbbb> <td width=1 bgcolor=#bbbbbb><" + "/td> <td></td><td></td> <td></td><td></td><td></" + "td> <td></td><td></td> <td></td></tr></table><!--" + " End Mines Remaini" + "ng --\> </td> <td bgcolor=#bbbbbb><img height=1 " + 
  "src='a.gif' width=" + cplLeft + "name='cplLeft'>" + "<td><img src='btnsmile.gif' name='condition' onmo" + "usedown='document.images.condition.s" + 'rc="btnsmil2.gif"' + ";' onmouseu" + "p='document.images.condition.s" + 'rc="btnsmile.gif";location.reload();' + ";'></td> <td width=4 bgcolor=#bbbbbb>" + "<img height=1 src='a.gif'" + " width=" + cplRight + ">" + "</td> <td> <!-- Elapsed Time --\> <table width=4" + "1 border=0 cellspacing=0 cellpadding=0> <tr bgcol" + "or=#888888> <td></td><td></td><td></td> <td></td" + 
  "><td></td><td></td><td></td><td></td> <td width" + "=1 bgcolor=#bbbbbb></td></tr> <tr bgcolor=#000000" + "> <td width=1 bgcolor=#888888></td> <td></td><td" + "></td> <td></td><td></td><td></td> <td></td><td>" + "</td> <td width=1 bgcolor=#ffffff></td></tr> <tr" + " bgcolor=#000000> <td width=1 bgcolor=#888888></t" + "d> <td width=1 bgcolor=#000000></td> <td><img sr" + "c='0.gif' name='elapse1'></td> <td width=2></td> " + "<td><img src='0.gif' name='elapse2'></td> <td wi" + "dth=2></td> <td><img src='0.gif' name='elapse3'><" + 
  "/td> <td width=1></td> <td width=1 bgcolor=#ffff" + "ff></td></tr> <tr bgcolor=#000000> <td width=1 b" + "gcolor=#888888></td> <td></td><td></td> <td></td" + "><td></td><td></td> <td></td><td></td> <td width" + "=1 bgcolor=#ffffff></td></tr> <tr bgcolor=#ffffff" + "> <td width=1 bgcolor=#bbbbbb></td> <td></td><td" + "></td> <td></td><td></td><td></td> <td></td><td>" + "</td> <td></td></tr> <" + "tr bgcolor=#bbbbbb> <td width=1 bgcolor=#bbbbbb><" + "/td> <td></td><td></td> <td></td><td></td><td></" + 
  "td> <td></td><td></td> <td></td></tr> " + "</table> <!-- End Elapsed Time --\> </td> <td " + "width=7 bgcolor=#bbbbbb></td></tr></table><table " + "width=" + ww2 + " border=0 cellspacing=0 cellpadding=0> " + "<tr height=3><td bgcolor=#bbbbbb></td></tr></table" + "> <!-- End Control Panel --\> </td> <td><img src" + "='cplright.gif' height=33 width=11></td> <td><img" + " src='right.gif' height=33 width=5></td> </tr></t" + "able><!-- Separator --\> <table border=0 cells" + "pacing=0 cellpadding=0> <tr height=11 width=" + 
  totalWidth + "> " + "<td width=1 bgcolor=#bbbbbb></td> <td width=1 bg" + "color=#ffffff></td> <td width=1 bgcolor=#bbbbbb><" + "/td> <td><img src='ml.gif'></td><td><img src='" + "separatr.gif' width=" + wideWidth + " height=11></td><td><img" + " src='mr.gif'></td><td><img src='right.gif' width" + "=5></td></tr></table> <!-- Mine Field --\> <table" + " width=" + totalWidth + " border=0 cellspacing=0 cellpadding=0> " + "<tr height=" + highHeight + "> <td width=1 bgcolor=#bbbbbb></td>" + " <td width=1 bgcolor=#ffffff></td> <td width=1 b" + 
  "gcolor=#bbbbbb></td> <td><img src='fielside.gif' " + "width=12 height=" + highHeight + "></td> <td> <!-- Game Field -" + "->");
  var s = "";
  var x, y;
  for(y = 0;y < gridy;++y) {
    for(x = 0;x < gridx;++x) {
      s = s + '<a href="javascript:gridclick(' + y + "," + x + ');">' + '<img src="' + dir + 'sqt0.gif" name="grd' + y + "_" + x + '" border=0></a>'
    }
    s = s + "<br>"
  }
  document.write(s);
  document.write("<!-- End Game Field --\></td><td" + ' valign=right><img src="fielside.gif" width=12 heig' + "ht=" + highHeight + '></td> <td valign=right><img src="right.gif' + '" width=5 height=' + highHeight + "></td></tr></table><!-- En" + "d Mine Field --\><!-- Footer --\><table width=" + totalWidth + " border=0 cellspacing=0 cellpadding=0><tr heigh" + "t=12> <td width=1 bgcolor=#bbbbbb></td> <td widt" + "h=1 bgcolor=#ffffff></td> <td width=1 bgcolor=#bb" + 'bbbb></td> <td><img src="bl.gif"></td> <td><img ' + 
  'src="footer.gif" width=' + wideWidth + " height=12></td> <td><i" + 'mg src="br.gif"></td> <td><img src="right.gif" he' + "ight=12></td></tr></table><!-- Bottom --\> <ta" + "ble width=" + totalWidth + " border=0 cellspacing=0 cellpadding=0" + "> <tr bgcolor=#bbbbbb height=1> <td width=1 bgco" + "lor=#bbbbbb></td><td width=1 bgcolor=#ffffff></t" + "d> <td width=1 bgcolor=#bbbbbb></td><td width=" + tW6 + " bgcolor=#bbbbbb></td><td width=1 bgcolor=#bbb" + "bbb></td> <td width=1 bgcolor=#888888></td> <td " + 
  "width=1 bgcolor=#000000></td> </tr> <tr height=1" + "> <td width=1 bgcolor=#bbbbbb></td> <td width=1 " + "bgcolor=#888888></td> <td width=1 bgcolor=#888888" + "></td> <td bgcolor=#888888></td> <td width=1 bgc" + "olor=#888888></td> <td width=1 bgcolor=#888888></" + "td> <td width=1 bgcolor=#000000></td> </tr> <tr" + " height=1> <td width=1 bgcolor=#000000></td> <td" + " width=1 bgcolor=#000000></td> <td width=1 bgcolo" + "r=#000000></td> <td bgcolor=#000000></td> <td wi" + "dth=1 bgcolor=#000000></td> <td width=1 bgcolor=#" + 
  "000000></td> <td width=1 bgcolor=#000000></td> <" + "/tr></table> </div>");
  $$logExit("buildgrid")
}
function surrounding(y, x) {
  $$logEntry(this, "surrounding", arguments, arguments.callee);
  var count = 0;
  if(y > 0 && x > 0 && mines[y - 1][x - 1]) {
    count++
  }
  if(y > 0 && mines[y - 1][x]) {
    count++
  }
  if(y > 0 && x < gridx - 1 && mines[y - 1][x + 1]) {
    count++
  }
  if(x > 0 && mines[y][x - 1]) {
    count++
  }
  if(x < gridx - 1 && mines[y][x + 1]) {
    count++
  }
  if(y < gridy - 1 && x > 0 && mines[y + 1][x - 1]) {
    count++
  }
  if(y < gridy - 1 && mines[y + 1][x]) {
    count++
  }
  if(y < gridy - 1 && x < gridx - 1 && mines[y + 1][x + 1]) {
    count++
  }
  return $$logExit("surrounding", count)
}
function rollback(y, x) {
  $$logEntry(this, "rollback", arguments, arguments.callee);
  if(y >= 0 && y < gridy && x >= 0 && x < gridx) {
    if(shown[y][x] != 3) {
      var c = surrounding(y, x);
      shown[y][x] = 3;
      squaresleft--;
      document.images["grd" + y + "_" + x].src = dir + "sq" + c + ".gif";
      if(c == 0) {
        rollback(y - 1, x - 1);
        rollback(y - 1, x);
        rollback(y - 1, x + 1);
        rollback(y, x - 1);
        rollback(y, x + 1);
        rollback(y + 1, x - 1);
        rollback(y + 1, x);
        rollback(y + 1, x + 1)
      }
    }
  }
  $$logExit("rollback")
}
function dead() {
  $$logEntry(this, "dead", arguments, arguments.callee);
  var y, x;
  for(y = 0;y < gridy;++y) {
    for(x = 0;x < gridx;++x) {
      if(mines[y][x]) {
        if(shown[y][x] != 1) {
          document.images["grd" + y + "_" + x].src = dir + "mine.gif"
        }
      }else {
        if(shown[y][x] == 1) {
          document.images["grd" + y + "_" + x].src = dir + "nomine.gif"
        }
      }
    }
  }
  document.images.condition.src = dir + "btndead.gif";
  playing = false;
  clicked = false;
  $$logExit("dead")
}
function gridclick(y, x) {
  $$logEntry(this, "gridclick", arguments, arguments.callee);
  if(playing) {
    clicked = true;
    if(placeflag) {
      if(shown[y][x] < 3) {
        var s = shown[y][x];
        var change = true;
        if(s == 1) {
          flagsleft++;
          squaresleft++
        }
        if(flagsleft == 0 && s == 0) {
          change = false
        }else {
          if(s == 2) {
            s = 0
          }else {
            s++
          }
          if(s == 1) {
            flagsleft--;
            squaresleft--
          }
        }
        if(change) {
          shown[y][x] = s;
          document.images["grd" + y + "_" + x].src = dir + "sqt" + s + ".gif";
          setStatus()
        }
        if(squaresleft == 0) {
          document.images.condition.src = dir + "btncool.gif";
          playing = false
        }
      }
    }else {
      if(shown[y][x] != 1) {
        if(mines[y][x]) {
          document.images["grd" + y + "_" + x].src = dir + "minered.gif";
          dead()
        }else {
          rollback(y, x)
        }
      }
    }
  }
  $$logExit("gridclick")
}
newgame();

