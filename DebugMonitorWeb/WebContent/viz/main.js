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
	  if(origLength - arr.length != 1) alert('problem with arrRemove:(');
};

jQuery(function(){
	$$captureInit();
});

function $$captureInit(){

	jQuery.post('../carjs/delete_log.jsp', null, function(){
		$$restOfInit();
	});
}

//$$randCacheSize = 100;
function $$restOfInit(){
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
		return val;
	}
	
	$$randCache = "";
	$$funcCache = [];
	
	//sends the log in cache every so many milliseconds and clears cache
	$$oldSI(function(){
		$$sendLog();
		
		//reset the cache to empty
		$$funcCache = [];
		$$randCache = "";
	}, 5000);
	
	//alert = $$devnull; 

	/*$$eventCount = 0;
	document.addEventListener('keydown',  function(e){
		e.$$id = $$eventCount++;
	}, true);*/

	
	
	$$appInit();
}
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
			alert('CARJS error: this program sends window as param??');
		}
		else{
			//If it's a HTML element like HTMLAnchorElement, then in chrome you can 
			//check using item.constructor.name, but in Firefox you do a nodeType check
			var nodeType = item.nodeType;
			if ( (className && className.match(/HTML[a-zA-Z0-9]*Element$/i)) ||
					( nodeType && nodeType === 1)){
				var props = ["prefix","length","text","style","name"];
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
					
					var props = ["view"];
					if (jQuery.inArray("keyCode", props) == -1) props.push("keyCode");
					var minObject = $$addPropsFound(props, item);
					minObject.target = item.target.id;
					minObject.type = item.type;
					outputItem = ["$$event", minObject];
				}
				else{
					//this object doesn' thave counter, nor is it an Event, nor is it an Element.
					alert("carjs ERROR: we have a problem logging object: " + item);
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
		$$funcCache.push([$$currFunc, $$currArgs, $$currFuncTime]);
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



// Input 0
var width = 1200;
var height = 1E3;
var scatterPlotStartPosX = 100;
var scatterPlotStartPosY = 300;
var scatterPlotStopPosX = 1100;
var scatterPlotStopPosY = 700;
var timelineView;
var timelineController;
var p;
var scatterXMap;
var scatterYMap;
var currentTracks = [];
var prevTracks = [];
var years, weeks;
var currentTime;
var domCurrentTime;
var intervalId;
var pastelColorPalette = {RISING:"#9c9ede", FALLING:"#e7969c", STAGNANT:"#e7cb94", NEW:"#cedb9c"};
var vibrantColorPalette = {RISING:"#d62728", FALLING:"#1f77b4", STAGNANT:"#8c564b", NEW:"#2ca02c"};
var mediumColorPalette = {RISING:"#ff7f0e", FALLING:"#1f77b4", STAGNANT:"#8c564b", NEW:"#98df8a"};
var lstColors = ["#9c9ede", "#e7969c", "#e7cb94", "#cedb9c", "#d62728", "#1f77b4", "#8c564b", "#2ca02c", "#ff7f0e", "#1f77b4", "#8c564b", "#98df8a"];
var colorScheme;
var genres = ["Rock", "Vocal", "Country", "Rap", "R&B", "Jazz", "Pop", "Easy", "Electronic", "Hip Hop", "Funk / Soul", "Folk", "Blues", "Electronica", "Comedy", "Reggae", "Latin", "Gospel", "Dance", "Soundtrack", "Alternative", "Others"];
function range(start, stop, step) {
  $$logEntry(this, "range", arguments, arguments.callee);
  var arr = [];
  if(!step) {
    step = 1
  }
  if(step < 0) {
    for(var i = start;i > stop;i += step) {
      arr.push(i)
    }
  }else {
    for(var i = start;i < stop;i += step) {
      arr.push(i)
    }
  }
  return $$logExit("range", arr)
}
function AxisMapper(startDomain, stopDomain, startVal, stopVal, shifted) {
  $$logEntry(this, "AxisMapper", arguments, arguments.callee);
  this.startDomain = startDomain;
  this.stopDomain = stopDomain;
  this.startVal = startVal;
  this.stopVal = stopVal;
  this.shifted = shifted;
  this.categorical = false;
  if(typeof startDomain == "number") {
    this.mult = (this.stopVal - this.startVal) / (this.stopDomain - this.startDomain)
  }else {
    if(typeof startDomain == "object") {
      this.categories = this.startDomain;
      this.defaultVal = this.stopDomain;
      this.startDomain = 0;
      if(shifted) {
        this.stopDomain = this.categories.length
      }else {
        this.stopDomain = this.categories.length - 1
      }
      this.categorical = true;
      this.mult = (this.stopVal - this.startVal) / (this.stopDomain - this.startDomain)
    }
  }
  $$logExit("AxisMapper")
}
AxisMapper.prototype.val = function(domainVal, domainStep) {
  return $$anonym0(domainVal, domainStep, this, arguments.callee)
};
AxisMapper.prototype.ticks = function() {
  return $$anonym1(this, arguments.callee)
};
function TimelineController(view) {
  $$logEntry(this, "TimelineController", arguments, arguments.callee);
  this.paused = true;
  this.view = view;
  var self = this;
  this.view.OnYearClick = function(year) {
    return $$anonym2(year, self, arguments.callee)
  };
  this.view.OnWeekClick = function(week) {
    return $$anonym3(week, self, arguments.callee)
  };
  this.view.OnPlayClick = function() {
    return $$anonym4(self, arguments.callee)
  };
  this.view.OnPauseClick = function() {
    return $$anonym5(self, arguments.callee)
  };
  this.view.OnNextWeekClick = function() {
    return $$anonym6(self, arguments.callee)
  };
  this.view.OnNextYearClick = function() {
    return $$anonym7(self, arguments.callee)
  };
  this.view.OnPrevWeekClick = function() {
    return $$anonym8(self, arguments.callee)
  };
  this.view.OnPrevYearClick = function() {
    return $$anonym9(self, arguments.callee)
  };
  this.currentTime = null;
  this.setTime(1957, 1);
  $$logExit("TimelineController")
}
TimelineController.prototype.OnYearClick = function(year) {
  return $$anonym10(year, this, arguments.callee)
};
TimelineController.prototype.OnWeekClick = function(week) {
  return $$anonym11(week, this, arguments.callee)
};
TimelineController.prototype.setTime = function(year, week) {
  return $$anonym12(year, week, this, arguments.callee)
};
TimelineController.prototype.incrementWeek = function() {
  return $$anonym13(dictDates, this, arguments.callee)
};
TimelineController.prototype.incrementYear = function() {
  return $$anonym14(dictDates, this, arguments.callee)
};
TimelineController.prototype.decrementWeek = function() {
  return $$anonym15(dictDates, this, arguments.callee)
};
TimelineController.prototype.decrementYear = function() {
  return $$anonym16(dictDates, this, arguments.callee)
};
TimelineController.prototype.updateView = function() {
  return $$anonym17(plotData, dictYears, this, arguments.callee)
};
TimelineController.prototype.displayGenreChart = function(genre) {
  return $$anonym19(genre, strTracks, $$anonym18, dictYears, this, arguments.callee)
};
TimelineController.prototype.displaySongChart = function(songPrefix) {
  return $$anonym20(songPrefix, findTrack, dictYears, this, arguments.callee)
};
TimelineController.prototype.play = function() {
  return $$anonym21(arguments.callee)
};
TimelineController.prototype.pause = function() {
  return $$anonym22(intervalId, arguments.callee)
};
function TimelineView() {
  $$logEntry(this, "TimelineView", arguments, arguments.callee);
  this.yearTimelineStartPosX = 100;
  this.yearTimelineStartPosY = 50;
  this.yearTimelineStopPosX = 1100;
  this.yearTimelineStopPosY = 125;
  this.weekTimelineStartPosX = 100;
  this.weekTimelineStartPosY = 175;
  this.weekTimelineStopPosX = 1100;
  this.weekTimelineStopPosY = 250;
  this.yearTimelineXMap;
  this.yearTimelineYMap;
  this.weekTimelineXMap;
  this.weekTimelineYMap;
  this.yearSliderThingy;
  this.weekSliderThingy;
  this.OnYearClick;
  this.OnWeekClick;
  this.OnPlayClick;
  this.OnPauseClick;
  this.OnNextWeekClick;
  this.OnPrevWeekClick;
  this.genreCharts = {};
  this.songCharts = {};
  this.yearTimelineXMap = new AxisMapper(range(1957, 2009), "", this.yearTimelineStartPosX, this.yearTimelineStopPosX);
  this.yearTimelineYMap = new AxisMapper(range(1, 51), "", this.yearTimelineStopPosY, this.yearTimelineStartPosY);
  this.weekTimelineXMap = new AxisMapper(1, 53, this.weekTimelineStartPosX, this.weekTimelineStopPosX);
  this.weekTimelineYMap = new AxisMapper(range(51, 0, -1), "", this.weekTimelineStopPosY, this.weekTimelineStartPosY);
  this.drawTimelineAxis(this.yearTimelineStartPosX, this.yearTimelineStopPosY, this.yearTimelineStopPosX, this.yearTimelineStopPosY, this.yearTimelineXMap.ticks(), true);
  this.drawTimelineAxis(this.weekTimelineStartPosX, this.weekTimelineStopPosY, this.weekTimelineStopPosX, this.weekTimelineStopPosY, this.weekTimelineXMap.ticks(), false);
  var tYear = p.text(this.yearTimelineStartPosX + (this.yearTimelineStopPosX - this.yearTimelineStartPosX) / 2, this.yearTimelineStartPosY - 20 + (this.yearTimelineStopPosY - this.yearTimelineStartPosY) / 2, "YEAR").attr("fill", "#222").attr("font", "helvetica").attr("font-size", 80);
  var tWeek = p.text(this.weekTimelineStartPosX + (this.weekTimelineStopPosX - this.weekTimelineStartPosX) / 2, this.weekTimelineStartPosY - 10 + (this.weekTimelineStopPosY - this.weekTimelineStartPosY) / 2, "WEEK").attr("fill", "#222").attr("font", "helvetica").attr("font-size", 70);
  var self = this;
  this.playBtn = p.path("M 20 20 L 20 40 L 30 30 Z").attr("stroke", "white").attr("fill", "red").attr("stroke-width", 0);
  this.playBtn.translate(5, 15).scale(2.8);
  this.playBtn.node.style.cursor = "hand";
  this.playBtn.click(function() {
    return $$anonym23(self, arguments.callee)
  });
  this.playBtn.hover(function(event) {
    return $$anonym24(event, this, arguments.callee)
  }, function(event) {
    return $$anonym25(event, this, arguments.callee)
  });
  this.pauseBtn = p.path("M 20 20 L 20 40 L 25 40 L 25 20 L 20 20 M 30 20 L 30 40 L 35 40 L 35 20 Z").attr("stroke-width", "0").attr("stroke", "white").attr("fill", "red").attr("stroke-width", 0).hide();
  this.pauseBtn.translate(5, 15).scale(2.5);
  this.pauseBtn.node.style.cursor = "hand";
  this.pauseBtn.click(function() {
    return $$anonym26(self, arguments.callee)
  });
  this.pauseBtn.hover(function(event) {
    return $$anonym27(event, this, arguments.callee)
  }, function(event) {
    return $$anonym28(event, this, arguments.callee)
  });
  this.nextWeekBtn = p.path("M 50 20 L 50 40 L 60 30 L 50 20 M 60 20 L 60 40 L 70 30 Z ").attr("stroke-width", "0").attr("fill", "#98df8a").attr("stroke", "white").attr("stroke-width", 0);
  this.nextWeekBtn.translate(this.weekTimelineStopPosX - 20, this.weekTimelineStopPosY - 70).scale(2);
  this.nextWeekBtn.node.style.cursor = "hand";
  this.nextWeekBtn.click(function() {
    return $$anonym29(self, arguments.callee)
  });
  this.nextWeekBtn.hover(function(event) {
    return $$anonym30(event, this, arguments.callee)
  }, function(event) {
    return $$anonym31(event, this, arguments.callee)
  });
  this.prevWeekBtn = p.path("M 50 20 L 50 40 L 60 30 L 50 20 M 60 20 L 60 40 L 70 30 Z ").attr("stroke-width", "0").attr("fill", "#98df8a").attr("stroke", "white").attr("stroke-width", 0);
  this.prevWeekBtn.translate(this.weekTimelineStartPosX - 100, this.weekTimelineStopPosY - 70).scale(2).rotate(180);
  this.prevWeekBtn.node.style.cursor = "hand";
  this.prevWeekBtn.click(function() {
    return $$anonym32(self, arguments.callee)
  });
  this.prevWeekBtn.hover(function(event) {
    return $$anonym33(event, this, arguments.callee)
  }, function(event) {
    return $$anonym34(event, this, arguments.callee)
  });
  this.nextYearBtn = p.path("M 50 20 L 50 40 L 60 30 L 50 20 M 60 20 L 60 40 L 70 30 Z ").attr("stroke-width", "0").attr("fill", "#98df8a").attr("stroke", "white").attr("stroke-width", 0);
  this.nextYearBtn.translate(this.yearTimelineStopPosX - 20, this.yearTimelineStopPosY - 70).scale(2);
  this.nextYearBtn.node.style.cursor = "hand";
  this.nextYearBtn.click(function() {
    return $$anonym35(self, arguments.callee)
  });
  this.nextYearBtn.hover(function(event) {
    return $$anonym36(event, this, arguments.callee)
  }, function(event) {
    return $$anonym37(event, this, arguments.callee)
  });
  this.prevYearBtn = p.path("M 50 20 L 50 40 L 60 30 L 50 20 M 60 20 L 60 40 L 70 30 Z ").attr("stroke-width", "0").attr("fill", "#98df8a").attr("stroke", "white").attr("stroke-width", 0);
  this.prevYearBtn.translate(this.yearTimelineStartPosX - 100, this.yearTimelineStopPosY - 70).scale(2).rotate(180);
  this.prevYearBtn.node.style.cursor = "hand";
  this.prevYearBtn.click(function() {
    return $$anonym38(self, arguments.callee)
  });
  this.prevYearBtn.hover(function(event) {
    return $$anonym39(event, this, arguments.callee)
  }, function(event) {
    return $$anonym40(event, this, arguments.callee)
  });
  $$logExit("TimelineView")
}
TimelineView.prototype.clearSongCharts = function() {
  return $$anonym41(key, this, arguments.callee)
};
TimelineView.prototype.drawTimelineAxis = function(startX, startY, endX, endY, ticks, rotate) {
  return $$anonym45(startX, startY, endX, endY, ticks, rotate, $$anonym42, $$anonym43, p, $$anonym44, this, arguments.callee)
};
TimelineView.prototype.setCurrentTime = function(currentTime) {
  return $$anonym46(currentTime, p, this, arguments.callee)
};
TimelineView.prototype.drawGenreChart = function(genre, data) {
  return $$anonym49(genre, data, AxisMapper, lstColors, p, $$anonym47, $$anonym48, this, arguments.callee)
};
TimelineView.prototype.drawSongChart = function(songPrefix, data) {
  return $$anonym52(songPrefix, data, $$anonym50, $$anonym51, findTrack, currentTracks, lstColors, p, strTracks, this, arguments.callee)
};
function drawAxis(startX, startY, endX, endY, ticks) {
  $$logEntry(this, "drawAxis", arguments, arguments.callee);
  var axis = p.path("M" + startX + " " + startY + " L" + endX + " " + endY).attr("stroke", "white");
  for(var i = 0;i < ticks.length;i++) {
    if(startY == endY) {
      p.path("M" + ticks[i][0] + " " + startY + " L" + ticks[i][0] + " " + (startY + 5)).attr("stroke", "white");
      p.path("M" + ticks[i][0] + " " + startY + " L" + ticks[i][0] + " " + scatterPlotStartPosY).attr("stroke", "#222");
      p.text(ticks[i][0], startY + 15, ticks[i][1]).attr("fill", "white")
    }else {
      p.path("M" + startX + " " + ticks[i][0] + " L" + (startX - 5) + " " + ticks[i][0]).attr("stroke", "white");
      p.path("M" + startX + " " + ticks[i][0] + " L" + scatterPlotStopPosX + " " + ticks[i][0]).attr("stroke", "#222");
      var t = p.text(startX - 50, ticks[i][0], ticks[i][1]).attr("fill", "lightGrey");
      var r = p.rect(startX - 80, ticks[i][0] - 7, 70, 15).attr("fill", "red").attr("fill-opacity", "0.01");
      r.node["data"] = ticks[i][1];
      r.node["text"] = t;
      r.node.style.cursor = "hand";
      r.click(function(event) {
        return $$anonym53(event, timelineController, this, arguments.callee)
      });
      r.hover(function(event) {
        return $$anonym54(event, this, arguments.callee)
      }, function(event) {
        return $$anonym55(event, this, arguments.callee)
      })
    }
  }
  $$logExit("drawAxis")
}
function setupScatterPlotAxes() {
  $$logEntry(this, "setupScatterPlotAxes", arguments, arguments.callee);
  scatterXMap = new AxisMapper(range(1, 51), "", scatterPlotStartPosX, scatterPlotStopPosX, true);
  scatterYMap = new AxisMapper(genres, "Others", scatterPlotStopPosY, scatterPlotStartPosY, true);
  drawAxis(scatterPlotStartPosX, scatterPlotStopPosY, scatterPlotStopPosX, scatterPlotStopPosY, scatterXMap.ticks());
  drawAxis(scatterPlotStartPosX, scatterPlotStopPosY, scatterPlotStartPosX, scatterPlotStartPosY, scatterYMap.ticks());
  $$logExit("setupScatterPlotAxes")
}
function findTrack(prefix, data) {
  $$logEntry(this, "findTrack", arguments, arguments.callee);
  if(data) {
    for(var i = 0;i < data.length;i++) {
      if(data[i]["track"] == prefix) {
        return $$logExit("findTrack", data[i])
      }
    }
  }
  return $$logExit("findTrack", null)
}
function constrain(val, low, high) {
  $$logEntry(this, "constrain", arguments, arguments.callee);
  if(val < low) {
    return $$logExit("constrain", low)
  }else {
    if(val > high) {
      return $$logExit("constrain", high)
    }else {
      return $$logExit("constrain", val)
    }
  }
}
function getClickFunc(track) {
  $$logEntry(this, "getClickFunc", arguments, arguments.callee);
  var name = track["artist"] + " - " + track["name"];
  return $$logExit("getClickFunc", function(event) {
    return $$anonym56(event, track, timelineController, arguments.callee)
  })
}
function plotData(tracks) {
  $$logEntry(this, "plotData", arguments, arguments.callee);
  for(var i = 0;i < currentTracks.length;i++) {
    currentTracks[i]["used"] = false
  }
  for(var i = 0;i < tracks.length;i++) {
    var pos = tracks[i]["pos"];
    var prefix = tracks[i]["track"];
    var track = strTracks[prefix];
    var genre = track["genre"];
    if(pos <= 50) {
      var xPos = scatterXMap.val(pos);
      var yPos = scatterYMap.val(genre);
      var prevTrack = findTrack(prefix, currentTracks);
      if(prevTrack != null) {
        prevTrack["used"] = true;
        prevTrack["weeksOnChart"]++;
        var c = prevTrack["point"];
        var newColor = "";
        if(prevTrack["pos"] < pos) {
          newColor = colorScheme["FALLING"]
        }else {
          if(prevTrack["pos"] > pos) {
            newColor = colorScheme["RISING"]
          }else {
            newColor = colorScheme["STAGNANT"]
          }
        }
        prevTrack["pos"] = pos;
        var radius = prevTrack["weeksOnChart"];
        c.animate({cx:xPos, cy:yPos, fill:newColor, r:constrain(radius, 5, 14)}, 1E3, "<>")
      }else {
        var c = p.circle(xPos, -100, 5).attr("stroke-width", 0);
        c.click(getClickFunc(track));
        c.dblclick(function(event) {
          return $$anonym57(event, this, arguments.callee)
        });
        var t = p.text(0, 0, track["artist"] + " " + track["name"]).attr("fill", "white").hide();
        c.node["prefix"] = prefix;
        c.node["text"] = t;
        c.hover(function(event) {
          return $$anonym58(event, timelineView, this, arguments.callee)
        }, function(event) {
          return $$anonym59(event, timelineView, this, arguments.callee)
        });
        c.animate({cx:xPos, cy:yPos, fill:colorScheme["NEW"], r:5}, 1E3, "<>");
        currentTracks.push({pos:pos, track:prefix, genre:genre, point:c, used:true, weeksOnChart:1})
      }
    }
  }
  for(var i = prevTracks.length - 1;i >= 0;i--) {
    var c = prevTracks[i];
    c.remove();
    prevTracks.splice(i, 1)
  }
  for(var i = currentTracks.length - 1;i >= 0;i--) {
    if(!currentTracks[i]["used"]) {
      var c = currentTracks[i]["point"];
      c.animate({cx:c.attr("cx"), cy:1E3, "fill-opacity":0.5}, 1E3, "<>");
      currentTracks.splice(i, 1);
      prevTracks.push(c)
    }
  }
  $$logExit("plotData")
}
function btnNext_OnClick() {
  $$logEntry(this, "btnNext_OnClick", arguments, arguments.callee);
  timelineController.incrementWeek();
  $$logExit("btnNext_OnClick")
}
function body_OnLoad() {
  $$logEntry(this, "body_OnLoad", arguments, arguments.callee);
  p = Raphael("canvas", width, height);
  colorScheme = mediumColorPalette;
  years = range(1957, 2009);
  weeks = range(1, 54);
  var bg = p.rect(0, 0, width - 1, height - 1).attr("fill", "black");
  setupScatterPlotAxes();
  timelineView = new TimelineView;
  timelineController = new TimelineController(timelineView);
  $$logExit("body_OnLoad")
}
function $$anonym0(domainVal, domainStep, $$_self, origCallee) {
  $$logEntry(this, "$$anonym0", arguments, origCallee);
  if(domainStep == null) {
    domainStep = 1
  }
  if(!$$_self.categorical) {
    return $$logExit("$$anonym0", $$_self.startVal + (domainVal - $$_self.startDomain) * $$_self.mult)
  }else {
    if($$_self.categories.indexOf(domainVal) == -1) {
      domainVal = $$_self.defaultVal
    }
    if($$_self.shifted) {
      return $$logExit("$$anonym0", $$_self.startVal + ($$_self.categories.indexOf(domainVal) + domainStep) * $$_self.mult)
    }else {
      return $$logExit("$$anonym0", $$_self.startVal + $$_self.categories.indexOf(domainVal) * $$_self.mult)
    }
  }
}
function $$anonym1($$_self, origCallee) {
  $$logEntry(this, "$$anonym1", arguments, origCallee);
  var arrTicks = [];
  for(var i = $$_self.startDomain;i <= $$_self.stopDomain;i++) {
    if($$_self.categorical) {
      arrTicks.push([$$_self.val($$_self.categories[i]), $$_self.categories[i]])
    }else {
      arrTicks.push([$$_self.val(i), i])
    }
  }
  return $$logExit("$$anonym1", arrTicks)
}
function $$anonym2(year, self, origCallee) {
  $$logEntry(this, "$$anonym2", arguments, origCallee);
  self.OnYearClick(year);
  $$logExit("$$anonym2")
}
function $$anonym3(week, self, origCallee) {
  $$logEntry(this, "$$anonym3", arguments, origCallee);
  self.OnWeekClick(week);
  $$logExit("$$anonym3")
}
function $$anonym4(self, origCallee) {
  $$logEntry(this, "$$anonym4", arguments, origCallee);
  self.play();
  $$logExit("$$anonym4")
}
function $$anonym5(self, origCallee) {
  $$logEntry(this, "$$anonym5", arguments, origCallee);
  self.pause();
  $$logExit("$$anonym5")
}
function $$anonym6(self, origCallee) {
  $$logEntry(this, "$$anonym6", arguments, origCallee);
  self.incrementWeek();
  $$logExit("$$anonym6")
}
function $$anonym7(self, origCallee) {
  $$logEntry(this, "$$anonym7", arguments, origCallee);
  self.incrementYear();
  $$logExit("$$anonym7")
}
function $$anonym8(self, origCallee) {
  $$logEntry(this, "$$anonym8", arguments, origCallee);
  self.decrementWeek();
  $$logExit("$$anonym8")
}
function $$anonym9(self, origCallee) {
  $$logEntry(this, "$$anonym9", arguments, origCallee);
  self.decrementYear();
  $$logExit("$$anonym9")
}
function $$anonym10(year, $$_self, origCallee) {
  $$logEntry(this, "$$anonym10", arguments, origCallee);
  $$_self.setTime(year, $$_self.currentTime["week"]);
  $$_self.view.clearSongCharts();
  $$logExit("$$anonym10")
}
function $$anonym11(week, $$_self, origCallee) {
  $$logEntry(this, "$$anonym11", arguments, origCallee);
  $$_self.setTime($$_self.currentTime["year"], week);
  $$logExit("$$anonym11")
}
function $$anonym12(year, week, $$_self, origCallee) {
  $$logEntry(this, "$$anonym12", arguments, origCallee);
  $$_self.currentTime = {year:year, week:week};
  $$_self.view.setCurrentTime($$_self.currentTime);
  $$_self.updateView();
  $$logExit("$$anonym12")
}
function $$anonym13(dictDates, $$_self, origCallee) {
  $$logEntry(this, "$$anonym13", arguments, origCallee);
  var newYear = $$_self.currentTime["year"];
  var newWeek = $$_self.currentTime["week"];
  newWeek++;
  if(dictDates[newYear] != null && dictDates[newYear][newWeek - 1] != null) {
    $$_self.setTime(newYear, newWeek)
  }else {
    newYear++;
    newWeek = 1;
    if(dictDates[newYear] != null && dictDates[newYear][newWeek - 1] != null) {
      $$_self.setTime(newYear, newWeek);
      $$_self.view.clearSongCharts()
    }else {
      return $$logExit("$$anonym13")
    }
  }
  $$logExit("$$anonym13")
}
function $$anonym14(dictDates, $$_self, origCallee) {
  $$logEntry(this, "$$anonym14", arguments, origCallee);
  var newYear = $$_self.currentTime["year"];
  newYear++;
  if(dictDates[newYear] != null && dictDates[newYear][1] != null) {
    $$_self.setTime(newYear, 1);
    $$_self.view.clearSongCharts()
  }
  $$logExit("$$anonym14")
}
function $$anonym15(dictDates, $$_self, origCallee) {
  $$logEntry(this, "$$anonym15", arguments, origCallee);
  var newYear = $$_self.currentTime["year"];
  var newWeek = $$_self.currentTime["week"];
  newWeek--;
  if(dictDates[newYear] != null && dictDates[newYear][newWeek] != null) {
    $$_self.setTime(newYear, newWeek)
  }else {
    newYear--;
    if(dictDates[newYear] != null) {
      if(dictDates[newYear][53] != null) {
        newWeek = 53
      }else {
        newWeek = 52
      }
      if(dictDates[newYear] != null && dictDates[newYear][newWeek] != null) {
        $$_self.view.clearSongCharts();
        $$_self.setTime(newYear, newWeek)
      }else {
        return $$logExit("$$anonym15")
      }
    }else {
      return $$logExit("$$anonym15")
    }
  }
  $$logExit("$$anonym15")
}
function $$anonym16(dictDates, $$_self, origCallee) {
  $$logEntry(this, "$$anonym16", arguments, origCallee);
  var newYear = $$_self.currentTime["year"];
  newYear--;
  if(dictDates[newYear] != null && dictDates[newYear][1] != null) {
    $$_self.setTime(newYear, 1);
    $$_self.view.clearSongCharts()
  }
  $$logExit("$$anonym16")
}
function $$anonym17(plotData, dictYears, $$_self, origCallee) {
  $$logEntry(this, "$$anonym17", arguments, origCallee);
  $$_self.view.setCurrentTime($$_self.currentTime);
  var tracks = dictYears[$$_self.currentTime["year"]][$$_self.currentTime["week"]];
  plotData(tracks);
  $$logExit("$$anonym17")
}
function $$anonym18(itm, genre, strTracks, origCallee) {
  $$logEntry(this, "$$anonym18", arguments, origCallee);
  return $$logExit("$$anonym18", strTracks[itm["track"]]["genre"].toLowerCase() == genre.toLowerCase())
}
function $$anonym19(genre, strTracks, $$anonym18, dictYears, $$_self, origCallee) {
  $$logEntry(this, "$$anonym19", arguments, origCallee);
  var genreData = {};
  for(var i = 1957;i < 2009;i++) {
    var yearScore = 0;
    for(var j = 1;j < 54;j++) {
      if(dictYears[i] != null && dictYears[i][j] != null) {
        var lst = dictYears[i][j];
        lst = lst.filter(function(itm) {
          return $$anonym18(itm, genre, strTracks, arguments.callee)
        });
        yearScore += lst.length
      }
    }
    genreData[i] = yearScore
  }
  $$_self.view.drawGenreChart(genre, genreData);
  $$logExit("$$anonym19")
}
function $$anonym20(songPrefix, findTrack, dictYears, $$_self, origCallee) {
  $$logEntry(this, "$$anonym20", arguments, origCallee);
  var songData = {};
  var i = $$_self.currentTime["year"];
  for(var j = 1;j < 54;j++) {
    if(dictYears[i] != null && dictYears[i][j] != null) {
      var lst = dictYears[i][j];
      var trackInfo = findTrack(songPrefix, lst);
      if(trackInfo != null) {
        songData[j] = trackInfo["pos"]
      }
    }
  }
  $$_self.view.drawSongChart(songPrefix, songData);
  $$logExit("$$anonym20")
}
function $$anonym21(origCallee) {
  $$logEntry(this, "$$anonym21", arguments, origCallee);
  intervalId = setInterval("timelineController.incrementWeek()", 2E3);
  $$logExit("$$anonym21")
}
function $$anonym22(intervalId, origCallee) {
  $$logEntry(this, "$$anonym22", arguments, origCallee);
  clearInterval(intervalId);
  $$logExit("$$anonym22")
}
function $$anonym23(self, origCallee) {
  $$logEntry(this, "$$anonym23", arguments, origCallee);
  self.OnPlayClick();
  self.playBtn.hide();
  self.pauseBtn.show();
  $$logExit("$$anonym23")
}
function $$anonym24(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym24", arguments, origCallee);
  $$_self.attr("stroke-width", 2);
  $$logExit("$$anonym24")
}
function $$anonym25(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym25", arguments, origCallee);
  $$_self.attr("stroke-width", 0);
  $$logExit("$$anonym25")
}
function $$anonym26(self, origCallee) {
  $$logEntry(this, "$$anonym26", arguments, origCallee);
  self.OnPauseClick();
  self.pauseBtn.hide();
  self.playBtn.show();
  $$logExit("$$anonym26")
}
function $$anonym27(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym27", arguments, origCallee);
  $$_self.attr("stroke-width", 2);
  $$logExit("$$anonym27")
}
function $$anonym28(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym28", arguments, origCallee);
  $$_self.attr("stroke-width", 0);
  $$logExit("$$anonym28")
}
function $$anonym29(self, origCallee) {
  $$logEntry(this, "$$anonym29", arguments, origCallee);
  self.OnNextWeekClick();
  $$logExit("$$anonym29")
}
function $$anonym30(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym30", arguments, origCallee);
  $$_self.attr("stroke-width", 2);
  $$logExit("$$anonym30")
}
function $$anonym31(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym31", arguments, origCallee);
  $$_self.attr("stroke-width", 0);
  $$logExit("$$anonym31")
}
function $$anonym32(self, origCallee) {
  $$logEntry(this, "$$anonym32", arguments, origCallee);
  self.OnPrevWeekClick();
  $$logExit("$$anonym32")
}
function $$anonym33(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym33", arguments, origCallee);
  $$_self.attr("stroke-width", 2);
  $$logExit("$$anonym33")
}
function $$anonym34(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym34", arguments, origCallee);
  $$_self.attr("stroke-width", 0);
  $$logExit("$$anonym34")
}
function $$anonym35(self, origCallee) {
  $$logEntry(this, "$$anonym35", arguments, origCallee);
  self.OnNextYearClick();
  $$logExit("$$anonym35")
}
function $$anonym36(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym36", arguments, origCallee);
  $$_self.attr("stroke-width", 2);
  $$logExit("$$anonym36")
}
function $$anonym37(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym37", arguments, origCallee);
  $$_self.attr("stroke-width", 0);
  $$logExit("$$anonym37")
}
function $$anonym38(self, origCallee) {
  $$logEntry(this, "$$anonym38", arguments, origCallee);
  self.OnPrevYearClick();
  $$logExit("$$anonym38")
}
function $$anonym39(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym39", arguments, origCallee);
  $$_self.attr("stroke-width", 2);
  $$logExit("$$anonym39")
}
function $$anonym40(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym40", arguments, origCallee);
  $$_self.attr("stroke-width", 0);
  $$logExit("$$anonym40")
}
function $$anonym41(key, $$_self, origCallee) {
  $$logEntry(this, "$$anonym41", arguments, origCallee);
  var lines = $$_self.songCharts;
  for(key in lines) {
    $$_self.songCharts[key].remove()
  }
  $$logExit("$$anonym41")
}
function $$anonym42(event, rotate, self, $$_self, origCallee) {
  $$logEntry(this, "$$anonym42", arguments, origCallee);
  if(rotate) {
    self.OnYearClick($$_self.node["data"])
  }else {
    self.OnWeekClick($$_self.node["data"])
  }
  $$logExit("$$anonym42")
}
function $$anonym43(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym43", arguments, origCallee);
  $$_self.node["text"].attr("fill", "#1f77b4");
  $$logExit("$$anonym43")
}
function $$anonym44(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym44", arguments, origCallee);
  $$_self.node["text"].attr("fill", "lightGrey");
  $$logExit("$$anonym44")
}
function $$anonym45(startX, startY, endX, endY, ticks, rotate, $$anonym42, $$anonym43, p, $$anonym44, $$_self, origCallee) {
  $$logEntry(this, "$$anonym45", arguments, origCallee);
  var axis = p.path("M" + startX + " " + startY + " L" + endX + " " + endY).attr("stroke", "white");
  for(var i = 0;i < ticks.length;i++) {
    if(startY == endY) {
      p.path("M" + ticks[i][0] + " " + startY + " L" + ticks[i][0] + " " + (startY + 5)).attr("stroke", "white");
      var t = p.text(ticks[i][0], startY + 20, ticks[i][1]).attr("fill", "lightGrey");
      if(rotate) {
        t.attr("rotation", "-90")
      }
      var r = p.rect(ticks[i][0] - 7.5, startY + 5, 15, 30).attr("fill", "white").attr("fill-opacity", "0.01");
      r.node["data"] = ticks[i][1];
      r.node["text"] = t;
      r.node.style.cursor = "hand";
      r.toFront();
      var self = $$_self;
      r.click(function(event) {
        return $$anonym42(event, rotate, self, this, arguments.callee)
      });
      r.hover(function(event) {
        return $$anonym43(event, this, arguments.callee)
      }, function(event) {
        return $$anonym44(event, this, arguments.callee)
      })
    }else {
    }
  }
  $$logExit("$$anonym45")
}
function $$anonym46(currentTime, p, $$_self, origCallee) {
  $$logEntry(this, "$$anonym46", arguments, origCallee);
  var year = currentTime["year"];
  var week = currentTime["week"];
  var yearPos = $$_self.yearTimelineXMap.val(year);
  var weekPos = $$_self.weekTimelineXMap.val(week);
  if($$_self.yearSliderThingy == null) {
    $$_self.yearSliderThingy = p.rect($$_self.yearTimelineStartPosX, $$_self.yearTimelineStopPosY - 12, 5, 10).attr("fill", "#1f77b4")
  }
  if($$_self.weekSliderThingy == null) {
    $$_self.weekSliderThingy = p.rect($$_self.weekTimelineStartPosX, $$_self.weekTimelineStopPosY - 12, 5, 10).attr("fill", "#1f77b4")
  }
  var newYearWidth = yearPos - $$_self.yearTimelineStartPosX < 2 ? 5 : yearPos - $$_self.yearTimelineStartPosX;
  var newWeekWidth = weekPos - $$_self.weekTimelineStartPosX < 2 ? 5 : weekPos - $$_self.weekTimelineStartPosX;
  $$_self.yearSliderThingy.animate({width:newYearWidth}, 300, ">");
  $$_self.weekSliderThingy.animate({width:newWeekWidth}, 300, ">");
  $$logExit("$$anonym46")
}
function $$anonym47(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym47", arguments, origCallee);
  $$_self.attr("stroke-width", 4);
  var t = $$_self.node["text"];
  t.attr("x", event.offsetX).attr("y", event.offsetY - 20).show();
  $$logExit("$$anonym47")
}
function $$anonym48(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym48", arguments, origCallee);
  $$_self.attr("stroke-width", 2);
  $$_self.node["text"].hide();
  $$logExit("$$anonym48")
}
function $$anonym49(genre, data, AxisMapper, lstColors, p, $$anonym47, $$anonym48, $$_self, origCallee) {
  $$logEntry(this, "$$anonym49", arguments, origCallee);
  if($$_self.genreCharts[genre] != null) {
    var l = $$_self.genreCharts[genre];
    l.remove();
    $$_self.genreCharts[genre] = null;
    return $$logExit("$$anonym49")
  }
  var maxVal = 0;
  for(var i = 1957;i < 2009;i++) {
    if(data[i] > maxVal) {
      maxVal = data[i]
    }
  }
  $$_self.yearTimelineYMap = new AxisMapper(0, maxVal, $$_self.yearTimelineStopPosY, $$_self.yearTimelineStartPosY);
  var pathString = "";
  for(var i = 1957;i < 2009;i++) {
    var x = $$_self.yearTimelineXMap.val(i);
    var y = $$_self.yearTimelineYMap.val(data[i]) - 20;
    if(i == 1957) {
      pathString += "M " + x + " " + y
    }else {
      pathString += " L " + x + " " + y
    }
  }
  var l = p.path(pathString).attr("stroke", lstColors[Math.floor(Math.random() * 12)]).attr("stroke-width", 2);
  var t = p.text(0, 0, genre).attr("fill", "white").hide();
  l.node["text"] = t;
  l.node["genre"] = genre;
  l.hover(function(event) {
    return $$anonym47(event, this, arguments.callee)
  }, function(event) {
    return $$anonym48(event, this, arguments.callee)
  });
  $$_self.genreCharts[genre] = l;
  $$logExit("$$anonym49")
}
function $$anonym50(event, findTrack, currentTracks, $$_self, origCallee) {
  $$logEntry(this, "$$anonym50", arguments, origCallee);
  $$_self.attr("stroke-width", 4);
  var t = $$_self.node["text"];
  t.attr("x", event.offsetX).attr("y", event.offsetY - 20).show();
  var track = findTrack($$_self.node["prefix"], currentTracks);
  if(track != null && track["point"].attr("stroke-width") != 3) {
    track["point"].attr("stroke-width", 2)
  }
  $$logExit("$$anonym50")
}
function $$anonym51(event, findTrack, currentTracks, $$_self, origCallee) {
  $$logEntry(this, "$$anonym51", arguments, origCallee);
  $$_self.attr("stroke-width", 2);
  $$_self.node["text"].hide();
  var track = findTrack($$_self.node["prefix"], currentTracks);
  if(track != null && track["point"].attr("stroke-width") != 3) {
    track["point"].attr("stroke-width", 0)
  }
  $$logExit("$$anonym51")
}
function $$anonym52(songPrefix, data, $$anonym50, $$anonym51, findTrack, currentTracks, lstColors, p, strTracks, $$_self, origCallee) {
  $$logEntry(this, "$$anonym52", arguments, origCallee);
  if($$_self.songCharts[songPrefix] != null) {
    var l = $$_self.songCharts[songPrefix];
    l.remove();
    $$_self.songCharts[songPrefix] = null;
    return $$logExit("$$anonym52")
  }
  var trackName = strTracks[songPrefix]["artist"] + " " + strTracks[songPrefix]["name"];
  var pathString = "";
  for(var i = 1;i < 54;i++) {
    if(data[i] != null) {
      var x = Math.round($$_self.weekTimelineXMap.val(i) * 100) / 100;
      var y = Math.round($$_self.weekTimelineYMap.val(data[i]) * 100) / 100 - 20;
      if(pathString.length == 0) {
        pathString += "M " + x + " " + y
      }else {
        pathString += " L " + x + " " + y
      }
    }
  }
  var l = p.path(pathString).attr("stroke", lstColors[Math.floor(Math.random() * 12)]).attr("stroke-width", 2);
  var t = p.text(0, 0, trackName).attr("fill", "white").hide();
  l.node["text"] = t;
  l.node["trackName"] = trackName;
  l.node["prefix"] = songPrefix;
  l.hover(function(event) {
    return $$anonym50(event, findTrack, currentTracks, this, arguments.callee)
  }, function(event) {
    return $$anonym51(event, findTrack, currentTracks, this, arguments.callee)
  });
  $$_self.songCharts[songPrefix] = l;
  $$logExit("$$anonym52")
}
function $$anonym53(event, timelineController, $$_self, origCallee) {
  $$logEntry(this, "$$anonym53", arguments, origCallee);
  timelineController.displayGenreChart($$_self.node["data"]);
  $$logExit("$$anonym53")
}
function $$anonym54(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym54", arguments, origCallee);
  $$_self.node["text"].attr("fill", "#1f77b4");
  $$logExit("$$anonym54")
}
function $$anonym55(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym55", arguments, origCallee);
  $$_self.node["text"].attr("fill", "lightGrey");
  $$logExit("$$anonym55")
}
function $$anonym56(event, track, timelineController, origCallee) {
  $$logEntry(this, "$$anonym56", arguments, origCallee);
  timelineController.displaySongChart(track["prefix"]);
  $$logExit("$$anonym56")
}
function $$anonym57(event, $$_self, origCallee) {
  $$logEntry(this, "$$anonym57", arguments, origCallee);
  $$_self.attr("stroke-width", "3").attr("stroke", "white");
  $$logExit("$$anonym57")
}
function $$anonym58(event, timelineView, $$_self, origCallee) {
  $$logEntry(this, "$$anonym58", arguments, origCallee);
  if($$_self.attr("stroke-width") != 3) {
    $$_self.attr({"stroke-width":2, stroke:"white"})
  }
  var t = $$_self.node["text"];
  t.attr("x", event.offsetX).attr("y", event.offsetY - 20).show();
  if(timelineView.songCharts[$$_self.node["prefix"]] != null) {
    timelineView.songCharts[$$_self.node["prefix"]].attr("stroke-width", "4")
  }
  $$logExit("$$anonym58")
}
function $$anonym59(event, timelineView, $$_self, origCallee) {
  $$logEntry(this, "$$anonym59", arguments, origCallee);
  if($$_self.attr("stroke-width") == 2) {
    $$_self.attr({"stroke-width":0})
  }
  $$_self.node["text"].hide();
  if(timelineView.songCharts[$$_self.node["prefix"]]) {
    timelineView.songCharts[$$_self.node["prefix"]].attr("stroke-width", "2")
  }
  $$logExit("$$anonym59")
}
;