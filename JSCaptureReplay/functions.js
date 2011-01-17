//document.write("<script src='../jquery.js' type='text/JavaScript'><\/script>");
var oldRand = Math.random;
Math.random = function(){
	var val = oldRand();
	sendLog("$$RAND", val, new Date().getTime());
	return val;
}
var c
var currFunc = null;
var currArgs = null;
var currFuncTime = null;
function $$logEntry(funcName, origArgs) {  
	if (!currFunc){
		currFunc = funcName;
		currArgs = processArgs(origArgs);
		currFuncTime = new Date().getTime();
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


function processArgs(origArgs){
	//each argument is a row in the array output
	//this is obviously expensive. Let's see how this goes and then optimize it later
	var output = [];
	for (x in origArgs){
		var item = origArgs[x];
		var outputItem;
		var className = item.constructor.name;
		if ( className == "KeyboardEvent" || className == "MouseEvent"){
			var props = <<eventprops>>;
			outputItem = addPropsFound(props);
		}
		else if (className.match(/HTML[a-zA-Z0-9]*Element$/i)){
			var props = <<elementprops>>;
			outputItem = addPropsFound(props);
		}
		else{
			//probably user defined object
			outputItem = item;
		}
		
		output.push(outputItem);
	}
	return output;
	
}

function addPropsFound(foundProps){
	var myEvent = new Object();
	for (i in foundProps){
		if (x.i){ //if x has the property
			myEvent.i = x.i;
		}
		
	}
	return myEvent;
	
}
function $$logExit(funcName) {  
    if (currFunc == funcName){
    	
    	sendLog(currFunc, currArgs, currFuncTime);
    	currFunc = null;
    	currArgs = null;
    }
	
	/*//if (new Date().getTime() - start < 10000){
		//console.log(arguments); 
		//var isWin = (arguments[1].
		var row = ["Exit", arguments[0]];
		//$$log.push(row);
		checkAndSend(row);
	//}
*/	//return what was originally returned by function
	return arguments[arguments.length - 1];
}

function sendLog(funcName, funcArgs, funcTime){
	var row = [funcName, funcArgs, funcTime];
	logJSON = JSON.stringify(row);
	$.post('../log_it.jsp', {log: logJSON}, function(data){
		//console.log(data);
	});
	//console.log("logged");
}

