//inject library javascript that we need
/*	document.writeln("<script src='../carjs/json2.js'></script>");
	document.writeln("<script src='../carjs/json_parse.js'></script>");
	document.writeln("<script src='../carjs/jquery.js'></script>");*/
//useful utility
	// Array Remove - By John Resig (MIT Licensed)
function $$arrRemove(arr, index) {
	  var origLength = arr.length;
		var rest = arr.slice(parseFloat(index) + 1 );
	  arr.length = index;
	  arr.push.apply(arr, rest);
	  if(origLength - arr.length != 1) throw Error('CarJS error: problem with arrRemove:(');
};

/*jQuery(function(){
	$$appInit();
});*/

(function (){
	//make sure that load event is not registerd in log. We'll add a listener at
	//the end of the page to end this
	window.addEventListener("load", function(){
		$$logEntry(this, "$$script$$");
	}, true);
	
	
	jQuery.post('../carjs/delete_log.jsp');
	$$counter = 0; 	//global counter for objects
	$$map = []; 	//global map of objects which are used for logging parameters of functions
	$$setTIMap = [];
	$$oldST = setTimeout;
	$$oldSI = setInterval;
	
	setTimeout = function(ptr, time){
		$$setTIMap.push(ptr);
		return $$oldST(ptr, time);
	}
	
	setInterval = function(ptr, time){
		$$setTIMap.push(ptr);
		return $$oldSI(ptr, time);
	}
	
	
	$$currFunc = null;
	$$currArgs = null;
	$$currFuncTime = null;
	
	$$oldRand = Math.random;
	Math.random = function(){
		var val = $$oldRand();
		$$randCache += val + ",";
		//console.log("Random:" + val);
		return val;
		//return 0.5;
	}
	
	$$randCache = "";
	$$funcCache = [];
	
	//sends the log in cache every so many milliseconds and clears cache
	$$oldSI(function(){
		$$sendLog();
		
		//reset the cache to empty
		$$funcCache = [];
		$$randCache = "";
	}, 100);
	
	//alert = $$devnull; 

	/*$$eventCount = 0;
	document.addEventListener('keydown',  function(e){
		e.$$id = $$eventCount++;
	}, true);*/

	
	
	//$$appInit();
})();
function $$logEntry(whatWasThis, funcName, origArgs, origCallee) {
	
	//inject a counter in that object for knowing that object's global counter value
	if (whatWasThis != window){	
		whatWasThis.$$counter = $$counter; 
		$$map[$$counter] = whatWasThis;	
		$$counter++;
	}
	//if this call was inside another function we don't need to log it
	if (!$$currFunc){ 
		$$currFunc = funcName;
		if ($$currFunc == "$$script$$"){
			//script scrope executing. Nothing to log here
			return;
		}
		if ($$setTIMap.length > 0){ 
			//there is a function waiting to be executed. 
			//Is it this fync that got fired by setTimtout or Interval?
			for (var i = 0; i < $$setTIMap.length; i++){
				if (origCallee == $$setTIMap[i]){
					//yes, this function was called from setTimeout or interval
					$$currFunc = "$$setTI_" + i + "_" + funcName; 
					$$arrRemove($$setTIMap, i);
					break;
				}
			}
		}
		var containsCallee = false;
		if (funcName.match(/\$\$anonym/)){
			containsCallee = true;
		}
		
		$$currArgs = $$processArgs(origArgs, containsCallee);
		$$currFuncTime = new Date().getTime();
	}
	//if (new Date().getTime() - start < 10000){
	/*	console.log(arguments); 
		//var isWin = (arguments[1].
		var row = ["Entry"];
		for (var i = 0; i < arguments.length - 1; i++){
			row.push(arguments[i]);
		}
		//$$log.push(row);
		checkAndSend(row);
	//}
	 */	
}  

function $$devnull() {
	// do nothing in replay

}


function $$processArgs(origArgs, containsCallee){
	//each argument is a row in the array output
	//this is obviously expensive. Let's see how this goes and then optimize it later
	var output = [];
	
	//if it was anonym prefixed method, then the original callee was also passed
	//else it wasn't. So we account for it.
	var argsLength = (containsCallee ? origArgs.length - 1: origArgs.length);
	for (var x = 0; x < argsLength; x++){
		var item = origArgs[x];
		var outputItem;
		var className = item.constructor.name;
		if (item == window){
			throw Error('CARJS error: this program sends window as param??');
		}
		else{
			//If it's a HTML element like HTMLAnchorElement, then in chrome you can 
			//check using item.constructor.name, but in Firefox you do a nodeType check
			var nodeType = item.nodeType;
			if ( (className && className.match(/HTML[a-zA-Z0-9]*Element$/i)) ||
					( nodeType && nodeType === 1)){
				var props = ["innerHTML","search","setAttribute","removeChild","addEventListener","style","length","className","appendChild"];
				var minObject = ""//$$addPropsFound(props, item);
				outputItem = ["$$element" + item.localName, minObject];
			}
			else{
				//should be user defined object
				var isPrimitive = (typeof item) in {'string':'', 'number':'', 'boolean':''};
				if (isPrimitive){
					outputItem = item;
				}
				else if (item.$$counter != undefined){
					//our instrumented object which has counter
					outputItem = "$$map" + item.$$counter; //$$ prefix implies it's a map id	
				}
				else if (item.altKey !== undefined && item.metaKey !== undefined){
					//className doesn't work across browsers for event obejcts. So I'm using
					//two properties found in KeyboardEvent and MouseEvent to check if it's that type
					
					var props = ["keyCode", "innerHTML","search","setAttribute","removeChild","addEventListener","style","length","className","appendChild",
					             "type", "bubbles", "cancelable", "which", "pageX",
									"pageY", "isChar", "getPreventDefault", "screenX", "screenY",
									"clientX", "clientY", "ctrlKey", "shiftKey", "altKey",
									"metaKey","keyIdentifier","x", "y", "X", "Y"];
					if (jQuery.inArray("keyCode", props) == -1) props.push("keyCode");
					var minObject = $$addPropsFound(props, item);
					minObject.target = item.target.id;
					minObject.type = item.type;
					outputItem = ["$$event", minObject];
				}
				else{
					//this object doesn' thave counter, nor is it an Event, nor is it an Element.
					throw Error("carjs ERROR: we have a problem logging object: " + item.toString().substring(0, 30));
				}
	
	
			}
		}
		output.push(outputItem);
	}
	return output;

}

function $$addPropsFound(foundProps, currArg){
	var myEvent = new Object();
	for (i in foundProps){
		var theProperty = foundProps[i];
		if (currArg[theProperty] != undefined){ //if current argument has the property
			myEvent[theProperty] = currArg[theProperty];
		}

	}
	return myEvent;

}
function $$logExit(funcName) {  
	
	var setTIregex = new RegExp("^\\$\\$setTI.*" + funcName.substr(2) + "$");	
	//had to take substr because otherwise have to escape the '$$' in funcName
	if ($$currFunc == funcName || ($$currFunc && $$currFunc.match(setTIregex))){
		if ($$currFunc != "$$script$$"){ //nothing to log if script scope
			
			$$funcCache.push([$$currFunc, $$currArgs, $$currFuncTime]);
		}
		
		//$$sendLog();
		$$currFunc = null;
		$$currArgs = null;
	}

	//return what was returned by original function
	return arguments[arguments.length - 1];
}

function $$sendLog(){
	if ($$randCache != ""){
		jQuery.ajax({
			url: "../carjs/log_rand.jsp",
			data: {log: $$randCache},
			async:   false, 
			type: "POST"
		});
	}
	var data = "";
	for (var i = 0; i < $$funcCache.length; i++){
		data += JSON.stringify($$funcCache[i]) + "__\n";
	}
	if (data.length > 0){
		jQuery.ajax({
			url: "../carjs/log_func.jsp",
			data: {log: data},
			async:   false,
			type: "POST"
		});
	}

}