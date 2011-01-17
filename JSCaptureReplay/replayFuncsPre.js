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