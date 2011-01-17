//inject library javascript that we need
/*	document.writeln("<script src='../carjs/json2.js'></script>");
	document.writeln("<script src='../carjs/json_parse.js'></script>");
	document.writeln("<script src='../carjs/jquery.js'></script>");*/
$(function(){
	$$captureInit();
});

function $$captureInit(){

	$.post('../carjs/delete_log.jsp', null, function(){
		$$restOfInit();
	});
}

//$$randCacheSize = 100;
function $$restOfInit(){
	$$oldRand = Math.random;
	Math.random = function(){
		var val = $$oldRand();
		$$randCache += val + ",";
		return val;
	}
	
	$$randCache = "";
	$$funcCache = [];
	
	//log the rands every so many milliseconds
	setInterval(function(){
		$$sendLog();
		$$funcCache = [];
		$$randCache = "";
	}, 5000);
	
	//alert = $$devnull; 

	$$counter = 0; 	//global counter for objects
	$$map = []; 	//global map of objects


	$$currFunc = null;
	$$currArgs = null;
	$$currFuncTime = null;
	$$appInit();
}
function $$logEntry(whatWasThis, funcName, origArgs) {
	//inject a counter in that object for knowing that object's global counter value
	if (!(whatWasThis.constructor.name == "DOMWindow")){
		whatWasThis.$$counter = $$counter; 
		$$map[$$counter] = whatWasThis;	
		$$counter++;
	}
	if (!$$currFunc){
		$$currFunc = funcName;
		$$currArgs = $$processArgs(origArgs);
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


function $$processArgs(origArgs){
	//each argument is a row in the array output
	//this is obviously expensive. Let's see how this goes and then optimize it later
	var output = [];
	for (x in origArgs){
		var item = origArgs[x];
		var outputItem;
		var className = item.constructor.name;
		if ( className == "KeyboardEvent" || className == "MouseEvent"){
			var props = ["type","keyCode","keyIdentifier"];
			var minObject = $$addPropsFound(props, item);
			outputItem = ["$$" + className, minObject];
		}
		else if (className.match(/HTML[a-zA-Z0-9]*Element$/i)){
			var props = ["innerHTML","reset","elements","removeChild","length","type","offsetTop","blur","id","style","name","className","appendChild","offsetLeft"];
			var minObject = ""//$$addPropsFound(props, item);
				outputItem = ["$$" + className, minObject];

		}
		else if (className == "DOMWindow"){
			alert('this program send windows as param??');
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
			else{
				alert("we have an object without counter. ");
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
	if ($$currFunc == funcName){
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
		$.ajax({
			url: "../carjs/log_rand.jsp",
			data: {log: $$randCache},
			async:   false, 
			type: "POST"
		});
	}
	var data = "";
	for (var i = 0; i < $$funcCache.length; i++){
		data += JSON.stringify($$funcCache[i]) + "__";
	}
	if (data.length > 0){
		$.ajax({
			url: "../carjs/log_func.jsp",
			data: {log: data},
			async:   false,
			type: "POST"
		});
	}

}



// Input 0
function Tetris() {
  $$logEntry(this, "Tetris", arguments);
  var self = this;
  this.stats = new Stats;
  this.puzzle = null;
  this.area = null;
  this.unit = 20;
  this.areaX = 20;
  this.areaY = 20;
  this.highscores = new Highscores(10);
  this.paused = false;
  this.start = function() {
    return $$anonym0(Area, self, Puzzle)
  };
  this.reset = function() {
    return $$anonym1(self)
  };
  this.pause = function() {
    return $$anonym2(self)
  };
  this.gameOver = function() {
    return $$anonym3(self, this)
  };
  this.up = function() {
    return $$anonym4(self)
  };
  this.down = function() {
    return $$anonym5(self)
  };
  this.left = function() {
    return $$anonym6(self)
  };
  this.right = function() {
    return $$anonym7(self)
  };
  this.space = function() {
    return $$anonym8(self)
  };
  var helpwindow = new Window("tetris-help");
  var highscores = new Window("tetris-highscores");
  document.getElementById("tetris-menu-start").onclick = function() {
    return $$anonym9(helpwindow, self, highscores, this)
  };
  document.getElementById("tetris-menu-pause").onclick = function() {
    return $$anonym10(self, this)
  };
  document.getElementById("tetris-menu-resume").onclick = function() {
    return $$anonym11(self, this)
  };
  document.getElementById("tetris-menu-help").onclick = function() {
    return $$anonym12(helpwindow, highscores, this)
  };
  document.getElementById("tetris-help-close").onclick = helpwindow.close;
  document.getElementById("tetris-menu-highscores").onclick = function() {
    return $$anonym13(helpwindow, self, highscores, this)
  };
  document.getElementById("tetris-highscores-close").onclick = highscores.close;
  var keyboard = new Keyboard;
  keyboard.set(keyboard.n, this.start);
  keyboard.set(keyboard.p, this.pause);
  keyboard.set(keyboard.up, this.up);
  keyboard.set(keyboard.down, this.down);
  keyboard.set(keyboard.left, this.left);
  keyboard.set(keyboard.right, this.right);
  keyboard.set(keyboard.space, this.space);
  document.onkeydown = keyboard.event;
  function Window(id) {
    $$logEntry(this, "Tetris::Window", arguments);
    this.id = id;
    this.el = document.getElementById(this.id);
    var self = this;
    this.activate = function() {
      return $$anonym14(self)
    };
    this.close = function() {
      return $$anonym15(self)
    };
    this.isActive = function() {
      return $$anonym16(self)
    };
    $$logExit("Tetris::Window")
  }
  function Keyboard() {
    $$logEntry(this, "Tetris::Keyboard", arguments);
    this.up = 38;
    this.down = 40;
    this.left = 37;
    this.right = 39;
    this.n = 78;
    this.p = 80;
    this.r = 82;
    this.space = 32;
    this.f12 = 123;
    this.escape = 27;
    this.keys = [];
    this.funcs = [];
    var self = this;
    this.set = function(key, func) {
      return $$anonym17(key, func, this)
    };
    this.event = function(e) {
      return $$anonym18(e, self)
    };
    $$logExit("Tetris::Keyboard")
  }
  function Stats() {
    $$logEntry(this, "Tetris::Stats", arguments);
    this.level;
    this.time;
    this.apm;
    this.lines;
    this.score;
    this.puzzles;
    this.actions;
    this.el = {level:document.getElementById("tetris-stats-level"), time:document.getElementById("tetris-stats-time"), apm:document.getElementById("tetris-stats-apm"), lines:document.getElementById("tetris-stats-lines"), score:document.getElementById("tetris-stats-score")};
    this.timerId = null;
    var self = this;
    this.start = function() {
      return $$anonym19(this)
    };
    this.stop = function() {
      return $$anonym20(this)
    };
    this.reset = function() {
      return $$anonym21(this)
    };
    this.incTime = function() {
      return $$anonym22(self)
    };
    this.setScore = function(i) {
      return $$anonym23(i, this)
    };
    this.setLevel = function(i) {
      return $$anonym24(i, this)
    };
    this.setLines = function(i) {
      return $$anonym25(i, this)
    };
    this.setPuzzles = function(i) {
      return $$anonym26(i, this)
    };
    this.setActions = function(i) {
      return $$anonym27(i, this)
    };
    this.getScore = function() {
      return $$anonym28(this)
    };
    this.getLevel = function() {
      return $$anonym29(this)
    };
    this.getLines = function() {
      return $$anonym30(this)
    };
    this.getPuzzles = function() {
      return $$anonym31(this)
    };
    this.getActions = function() {
      return $$anonym32(this)
    };
    $$logExit("Tetris::Stats")
  }
  function Area(unit, x, y, id) {
    $$logEntry(this, "Tetris::Area", arguments);
    this.unit = unit;
    this.x = x;
    this.y = y;
    this.el = document.getElementById(id);
    this.board = [];
    for(var y = 0;y < this.y;y++) {
      this.board.push(new Array);
      for(var x = 0;x < this.x;x++) {
        this.board[y].push(0)
      }
    }
    this.destroy = function() {
      return $$anonym33(this)
    };
    this.removeFullLines = function() {
      return $$anonym34(this)
    };
    this.isLineFull = function(y) {
      return $$anonym35(y, this)
    };
    this.removeLine = function(y) {
      return $$anonym36(y, this)
    };
    this.getBlock = function(y, x) {
      return $$anonym37(y, x, this)
    };
    this.addElement = function(el) {
      return $$anonym38(el, this)
    };
    $$logExit("Tetris::Area")
  }
  function Puzzle(tetris, area) {
    $$logEntry(this, "Tetris::Puzzle", arguments);
    var self = this;
    this.tetris = tetris;
    this.area = area;
    this.fallDownID = null;
    this.forceMoveDownID = null;
    this.type = null;
    this.nextType = null;
    this.position = null;
    this.speed = null;
    this.running = null;
    this.stopped = null;
    this.board = [];
    this.elements = [];
    this.nextElements = [];
    this.x = null;
    this.y = null;
    this.puzzles = [[[0, 0, 1], [1, 1, 1], [0, 0, 0]], [[1, 0, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 1], [1, 1, 0], [0, 0, 0]], [[1, 1, 0], [0, 1, 1], [0, 0, 0]], [[0, 1, 0], [1, 1, 1], [0, 0, 0]], [[1, 1], [1, 1]], [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]]];
    this.reset = function() {
      return $$anonym39(random, this)
    };
    this.nextType = random(this.puzzles.length);
    this.reset();
    this.isRunning = function() {
      return $$anonym40(this)
    };
    this.isStopped = function() {
      return $$anonym41(this)
    };
    this.getX = function() {
      return $$anonym42(this)
    };
    this.getY = function() {
      return $$anonym43(this)
    };
    this.mayPlace = function() {
      return $$anonym44(this)
    };
    this.place = function() {
      return $$anonym45(this)
    };
    this.destroy = function() {
      return $$anonym46(this)
    };
    this.createEmptyPuzzle = function(y, x) {
      return $$anonym47(y, x, Array)
    };
    this.fallDown = function() {
      return $$anonym48(self)
    };
    this.forceMoveDown = function() {
      return $$anonym49(self)
    };
    this.stop = function() {
      return $$anonym50(this)
    };
    this.mayRotate = function() {
      return $$anonym51(this)
    };
    this.rotate = function() {
      return $$anonym52(this)
    };
    this.mayMoveDown = function() {
      return $$anonym53(this)
    };
    this.moveDown = function() {
      return $$anonym54(this)
    };
    this.mayMoveLeft = function() {
      return $$anonym55(this)
    };
    this.moveLeft = function() {
      return $$anonym56(this)
    };
    this.mayMoveRight = function() {
      return $$anonym57(this)
    };
    this.moveRight = function() {
      return $$anonym58(this)
    };
    $$logExit("Tetris::Puzzle")
  }
  function random(i) {
    $$logEntry(this, "Tetris::random", arguments);
    return $$logExit("Tetris", $$logExit("Tetris::random", Math.floor(Math.random() * i)))
  }
  function Highscores(maxscores) {
    $$logEntry(this, "Tetris::Highscores", arguments);
    this.maxscores = maxscores;
    this.scores = [];
    this.load = function() {
      return $$anonym59(Cookie, Number, Score, this)
    };
    this.save = function() {
      return $$anonym60(Cookie, this)
    };
    this.mayAdd = function(score) {
      return $$anonym61(score, this)
    };
    this.add = function(name, score) {
      return $$anonym62(name, score, Score, this)
    };
    this.getScores = function() {
      return $$anonym63(this)
    };
    this.toHtml = function() {
      return $$anonym64(this)
    };
    this.sort = function() {
      return $$anonym65(this)
    };
    function Score(name, score) {
      $$logEntry(this, "Tetris::Highscores::Score", arguments);
      this.name = name;
      this.score = score;
      $$logExit("Tetris::Highscores::Score")
    }
    this.load();
    $$logExit("Tetris::Highscores")
  }
  function Cookie() {
    $$logEntry(this, "Tetris::Cookie", arguments);
    this.get = function(name) {
      return $$anonym66(name, unescape)
    };
    this.set = function(name, value, seconds, path, domain, secure) {
      return $$anonym67(name, value, seconds, path, domain, secure, Date, escape, this)
    };
    this.del = function(name) {
      return $$anonym68(name)
    };
    $$logExit("Tetris::Cookie")
  }
  $$logExit("Tetris")
}
if(!String.prototype.trim) {
  String.prototype.trim = function() {
    return $$anonym69(this)
  }
}
if(!Array.prototype.removeByIndex) {
  Array.prototype.removeByIndex = function(index) {
    return $$anonym70(index, this)
  }
}
if(!String.prototype.format) {
  String.prototype.format = function() {
    return $$anonym71(arguments, this)
  }
}
function $$appInit() {
  $$logEntry(this, "$$appInit", arguments);
  var tetris = new Tetris;
  tetris.unit = 14;
  tetris.areaX = 12;
  tetris.areaY = 22;
  $$logExit("$$appInit")
}
function $$anonym0(Area, self, Puzzle) {
  $$logEntry(this, "$$anonym0", arguments);
  if(self.puzzle && !confirm("Are you sure you want to start a new game ?")) {
    return $$logExit("$$anonym0")
  }
  self.reset();
  self.stats.start();
  document.getElementById("tetris-nextpuzzle").style.display = "block";
  document.getElementById("tetris-keys").style.display = "none";
  self.area = new Area(self.unit, self.areaX, self.areaY, "tetris-area");
  self.puzzle = new Puzzle(self, self.area);
  if(self.puzzle.mayPlace()) {
    self.puzzle.place()
  }else {
    self.gameOver()
  }
  $$logExit("$$anonym0")
}
function $$anonym1(self) {
  $$logEntry(this, "$$anonym1", arguments);
  if(self.puzzle) {
    self.puzzle.destroy();
    self.puzzle = null
  }
  if(self.area) {
    self.area.destroy();
    self.area = null
  }
  document.getElementById("tetris-gameover").style.display = "none";
  document.getElementById("tetris-nextpuzzle").style.display = "none";
  document.getElementById("tetris-keys").style.display = "block";
  self.stats.reset();
  self.paused = false;
  document.getElementById("tetris-pause").style.display = "block";
  document.getElementById("tetris-resume").style.display = "none";
  $$logExit("$$anonym1")
}
function $$anonym2(self) {
  $$logEntry(this, "$$anonym2", arguments);
  if(self.puzzle == null) {
    return $$logExit("$$anonym2")
  }
  if(self.paused) {
    self.puzzle.running = true;
    self.puzzle.fallDownID = setTimeout(self.puzzle.fallDown, self.puzzle.speed);
    document.getElementById("tetris-pause").style.display = "block";
    document.getElementById("tetris-resume").style.display = "none";
    self.stats.timerId = setInterval(self.stats.incTime, 1E3);
    self.paused = false
  }else {
    if(!self.puzzle.isRunning()) {
      return $$logExit("$$anonym2")
    }
    if(self.puzzle.fallDownID) {
      clearTimeout(self.puzzle.fallDownID)
    }
    document.getElementById("tetris-pause").style.display = "none";
    document.getElementById("tetris-resume").style.display = "block";
    clearTimeout(self.stats.timerId);
    self.paused = true;
    self.puzzle.running = false
  }
  $$logExit("$$anonym2")
}
function $$anonym3(self, $$_self) {
  $$logEntry(this, "$$anonym3", arguments);
  self.stats.stop();
  self.puzzle.stop();
  document.getElementById("tetris-nextpuzzle").style.display = "none";
  document.getElementById("tetris-gameover").style.display = "block";
  if($$_self.highscores.mayAdd($$_self.stats.getScore())) {
    var name = prompt("Game Over !\nEnter your name:", "");
    if(name && name.trim().length) {
      $$_self.highscores.add(name, $$_self.stats.getScore())
    }
  }
  $$logExit("$$anonym3")
}
function $$anonym4(self) {
  $$logEntry(this, "$$anonym4", arguments);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    if(self.puzzle.mayRotate()) {
      self.puzzle.rotate();
      self.stats.setActions(self.stats.getActions() + 1)
    }
  }
  $$logExit("$$anonym4")
}
function $$anonym5(self) {
  $$logEntry(this, "$$anonym5", arguments);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    if(self.puzzle.mayMoveDown()) {
      self.stats.setScore(self.stats.getScore() + 5 + self.stats.getLevel());
      self.puzzle.moveDown();
      self.stats.setActions(self.stats.getActions() + 1)
    }
  }
  $$logExit("$$anonym5")
}
function $$anonym6(self) {
  $$logEntry(this, "$$anonym6", arguments);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    if(self.puzzle.mayMoveLeft()) {
      self.puzzle.moveLeft();
      self.stats.setActions(self.stats.getActions() + 1)
    }
  }
  $$logExit("$$anonym6")
}
function $$anonym7(self) {
  $$logEntry(this, "$$anonym7", arguments);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    if(self.puzzle.mayMoveRight()) {
      self.puzzle.moveRight();
      self.stats.setActions(self.stats.getActions() + 1)
    }
  }
  $$logExit("$$anonym7")
}
function $$anonym8(self) {
  $$logEntry(this, "$$anonym8", arguments);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    self.puzzle.stop();
    self.puzzle.forceMoveDown()
  }
  $$logExit("$$anonym8")
}
function $$anonym9(helpwindow, self, highscores, $$_self) {
  $$logEntry(this, "$$anonym9", arguments);
  helpwindow.close();
  highscores.close();
  self.start();
  $$_self.blur();
  $$logExit("$$anonym9")
}
function $$anonym10(self, $$_self) {
  $$logEntry(this, "$$anonym10", arguments);
  self.pause();
  $$_self.blur();
  $$logExit("$$anonym10")
}
function $$anonym11(self, $$_self) {
  $$logEntry(this, "$$anonym11", arguments);
  self.pause();
  $$_self.blur();
  $$logExit("$$anonym11")
}
function $$anonym12(helpwindow, highscores, $$_self) {
  $$logEntry(this, "$$anonym12", arguments);
  highscores.close();
  helpwindow.activate();
  $$_self.blur();
  $$logExit("$$anonym12")
}
function $$anonym13(helpwindow, self, highscores, $$_self) {
  $$logEntry(this, "$$anonym13", arguments);
  helpwindow.close();
  document.getElementById("tetris-highscores-content").innerHTML = self.highscores.toHtml();
  highscores.activate();
  $$_self.blur();
  $$logExit("$$anonym13")
}
function $$anonym14(self) {
  $$logEntry(this, "$$anonym14", arguments);
  self.el.style.display = self.el.style.display == "block" ? "none" : "block";
  $$logExit("$$anonym14")
}
function $$anonym15(self) {
  $$logEntry(this, "$$anonym15", arguments);
  self.el.style.display = "none";
  $$logExit("$$anonym15")
}
function $$anonym16(self) {
  $$logEntry(this, "$$anonym16", arguments);
  return $$logExit("$$anonym16", self.el.style.display == "block")
}
function $$anonym17(key, func, $$_self) {
  $$logEntry(this, "$$anonym17", arguments);
  $$_self.keys.push(key);
  $$_self.funcs.push(func);
  $$logExit("$$anonym17")
}
function $$anonym18(e, self) {
  $$logEntry(this, "$$anonym18", arguments);
  if(!e) {
    e = window.event
  }
  for(var i = 0;i < self.keys.length;i++) {
    if(e.keyIdentifier == self.keys[i] || e.keyCode == self.keys[i]) {
      self.funcs[i]()
    }
  }
  $$logExit("$$anonym18")
}
function $$anonym19($$_self) {
  $$logEntry(this, "$$anonym19", arguments);
  $$_self.reset();
  $$_self.timerId = setInterval($$_self.incTime, 1E3);
  $$logExit("$$anonym19")
}
function $$anonym20($$_self) {
  $$logEntry(this, "$$anonym20", arguments);
  if($$_self.timerId) {
    clearInterval($$_self.timerId)
  }
  $$logExit("$$anonym20")
}
function $$anonym21($$_self) {
  $$logEntry(this, "$$anonym21", arguments);
  $$_self.stop();
  $$_self.level = 1;
  $$_self.time = 0;
  $$_self.apm = 0;
  $$_self.lines = 0;
  $$_self.score = 0;
  $$_self.puzzles = 0;
  $$_self.actions = 0;
  $$_self.el.level.innerHTML = $$_self.level;
  $$_self.el.time.innerHTML = $$_self.time;
  $$_self.el.apm.innerHTML = $$_self.apm;
  $$_self.el.lines.innerHTML = $$_self.lines;
  $$_self.el.score.innerHTML = $$_self.score;
  $$logExit("$$anonym21")
}
function $$anonym22(self) {
  $$logEntry(this, "$$anonym22", arguments);
  self.time++;
  self.el.time.innerHTML = self.time;
  self.apm = parseInt(self.actions / self.time * 60);
  self.el.apm.innerHTML = self.apm;
  $$logExit("$$anonym22")
}
function $$anonym23(i, $$_self) {
  $$logEntry(this, "$$anonym23", arguments);
  $$_self.score = i;
  $$_self.el.score.innerHTML = $$_self.score;
  $$logExit("$$anonym23")
}
function $$anonym24(i, $$_self) {
  $$logEntry(this, "$$anonym24", arguments);
  $$_self.level = i;
  $$_self.el.level.innerHTML = $$_self.level;
  $$logExit("$$anonym24")
}
function $$anonym25(i, $$_self) {
  $$logEntry(this, "$$anonym25", arguments);
  $$_self.lines = i;
  $$_self.el.lines.innerHTML = $$_self.lines;
  $$logExit("$$anonym25")
}
function $$anonym26(i, $$_self) {
  $$logEntry(this, "$$anonym26", arguments);
  $$_self.puzzles = i;
  $$logExit("$$anonym26")
}
function $$anonym27(i, $$_self) {
  $$logEntry(this, "$$anonym27", arguments);
  $$_self.actions = i;
  $$logExit("$$anonym27")
}
function $$anonym28($$_self) {
  $$logEntry(this, "$$anonym28", arguments);
  return $$logExit("$$anonym28", $$_self.score)
}
function $$anonym29($$_self) {
  $$logEntry(this, "$$anonym29", arguments);
  return $$logExit("$$anonym29", $$_self.level)
}
function $$anonym30($$_self) {
  $$logEntry(this, "$$anonym30", arguments);
  return $$logExit("$$anonym30", $$_self.lines)
}
function $$anonym31($$_self) {
  $$logEntry(this, "$$anonym31", arguments);
  return $$logExit("$$anonym31", $$_self.puzzles)
}
function $$anonym32($$_self) {
  $$logEntry(this, "$$anonym32", arguments);
  return $$logExit("$$anonym32", $$_self.actions)
}
function $$anonym33($$_self) {
  $$logEntry(this, "$$anonym33", arguments);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        $$_self.el.removeChild($$_self.board[y][x]);
        $$_self.board[y][x] = 0
      }
    }
  }
  $$logExit("$$anonym33")
}
function $$anonym34($$_self) {
  $$logEntry(this, "$$anonym34", arguments);
  var lines = 0;
  for(var y = $$_self.y - 1;y > 0;y--) {
    if($$_self.isLineFull(y)) {
      $$_self.removeLine(y);
      lines++;
      y++
    }
  }
  return $$logExit("$$anonym34", lines)
}
function $$anonym35(y, $$_self) {
  $$logEntry(this, "$$anonym35", arguments);
  for(var x = 0;x < $$_self.x;x++) {
    if(!$$_self.board[y][x]) {
      return $$logExit("$$anonym35", false)
    }
  }
  return $$logExit("$$anonym35", true)
}
function $$anonym36(y, $$_self) {
  $$logEntry(this, "$$anonym36", arguments);
  for(var x = 0;x < $$_self.x;x++) {
    $$_self.el.removeChild($$_self.board[y][x]);
    $$_self.board[y][x] = 0
  }
  y--;
  for(;y > 0;y--) {
    for(var x = 0;x < $$_self.x;x++) {
      if($$_self.board[y][x]) {
        var el = $$_self.board[y][x];
        el.style.top = el.offsetTop + $$_self.unit + "px";
        $$_self.board[y + 1][x] = el;
        $$_self.board[y][x] = 0
      }
    }
  }
  $$logExit("$$anonym36")
}
function $$anonym37(y, x, $$_self) {
  $$logEntry(this, "$$anonym37", arguments);
  if(y < 0) {
    return $$logExit("$$anonym37", 0)
  }
  if(y < $$_self.y && x < $$_self.x) {
    return $$logExit("$$anonym37", $$_self.board[y][x])
  }else {
    throw"Area.getBlock(" + y + ", " + x + ") failed";
  }
}
function $$anonym38(el, $$_self) {
  $$logEntry(this, "$$anonym38", arguments);
  var x = parseInt(el.offsetLeft / $$_self.unit);
  var y = parseInt(el.offsetTop / $$_self.unit);
  if(y >= 0 && y < $$_self.y && x >= 0 && x < $$_self.x) {
    $$_self.board[y][x] = el
  }else {
  }
  $$logExit("$$anonym38")
}
function $$anonym39(random, $$_self) {
  $$logEntry(this, "$$anonym39", arguments);
  if($$_self.fallDownID) {
    clearTimeout($$_self.fallDownID)
  }
  if($$_self.forceMoveDownID) {
    clearTimeout($$_self.forceMoveDownID)
  }
  $$_self.type = $$_self.nextType;
  $$_self.nextType = random($$_self.puzzles.length);
  $$_self.position = 0;
  $$_self.speed = 80 + 700 / $$_self.tetris.stats.getLevel();
  $$_self.running = false;
  $$_self.stopped = false;
  $$_self.board = [];
  $$_self.elements = [];
  for(var i = 0;i < $$_self.nextElements.length;i++) {
    document.getElementById("tetris-nextpuzzle").removeChild($$_self.nextElements[i])
  }
  $$_self.nextElements = [];
  $$_self.x = null;
  $$_self.y = null;
  $$logExit("$$anonym39")
}
function $$anonym40($$_self) {
  $$logEntry(this, "$$anonym40", arguments);
  return $$logExit("$$anonym40", $$_self.running)
}
function $$anonym41($$_self) {
  $$logEntry(this, "$$anonym41", arguments);
  return $$logExit("$$anonym41", $$_self.stopped)
}
function $$anonym42($$_self) {
  $$logEntry(this, "$$anonym42", arguments);
  return $$logExit("$$anonym42", $$_self.x)
}
function $$anonym43($$_self) {
  $$logEntry(this, "$$anonym43", arguments);
  return $$logExit("$$anonym43", $$_self.y)
}
function $$anonym44($$_self) {
  $$logEntry(this, "$$anonym44", arguments);
  var puzzle = $$_self.puzzles[$$_self.type];
  var areaStartX = parseInt(($$_self.area.x - puzzle[0].length) / 2);
  var areaStartY = 1;
  var lineFound = false;
  var lines = 0;
  for(var y = puzzle.length - 1;y >= 0;y--) {
    for(var x = 0;x < puzzle[y].length;x++) {
      if(puzzle[y][x]) {
        lineFound = true;
        if($$_self.area.getBlock(areaStartY, areaStartX + x)) {
          return $$logExit("$$anonym44", false)
        }
      }
    }
    if(lineFound) {
      lines++
    }
    if(areaStartY - lines < 0) {
      break
    }
  }
  return $$logExit("$$anonym44", true)
}
function $$anonym45($$_self) {
  $$logEntry(this, "$$anonym45", arguments);
  $$_self.tetris.stats.setPuzzles($$_self.tetris.stats.getPuzzles() + 1);
  if($$_self.tetris.stats.getPuzzles() >= 10 + $$_self.tetris.stats.getLevel() * 2) {
    $$_self.tetris.stats.setLevel($$_self.tetris.stats.getLevel() + 1);
    $$_self.tetris.stats.setPuzzles(0)
  }
  var puzzle = $$_self.puzzles[$$_self.type];
  var areaStartX = parseInt(($$_self.area.x - puzzle[0].length) / 2);
  var areaStartY = 1;
  var lineFound = false;
  var lines = 0;
  $$_self.x = areaStartX;
  $$_self.y = 1;
  $$_self.board = $$_self.createEmptyPuzzle(puzzle.length, puzzle[0].length);
  for(var y = puzzle.length - 1;y >= 0;y--) {
    for(var x = 0;x < puzzle[y].length;x++) {
      if(puzzle[y][x]) {
        lineFound = true;
        var el = document.createElement("div");
        el.className = "block" + $$_self.type;
        el.style.left = (areaStartX + x) * $$_self.area.unit + "px";
        el.style.top = (areaStartY - lines) * $$_self.area.unit + "px";
        $$_self.area.el.appendChild(el);
        $$_self.board[y][x] = el;
        $$_self.elements.push(el)
      }
    }
    if(lines) {
      $$_self.y--
    }
    if(lineFound) {
      lines++
    }
  }
  $$_self.running = true;
  $$_self.fallDownID = setTimeout($$_self.fallDown, $$_self.speed);
  var nextPuzzle = $$_self.puzzles[$$_self.nextType];
  for(var y = 0;y < nextPuzzle.length;y++) {
    for(var x = 0;x < nextPuzzle[y].length;x++) {
      if(nextPuzzle[y][x]) {
        var el = document.createElement("div");
        el.className = "block" + $$_self.nextType;
        el.style.left = x * $$_self.area.unit + "px";
        el.style.top = y * $$_self.area.unit + "px";
        document.getElementById("tetris-nextpuzzle").appendChild(el);
        $$_self.nextElements.push(el)
      }
    }
  }
  $$logExit("$$anonym45")
}
function $$anonym46($$_self) {
  $$logEntry(this, "$$anonym46", arguments);
  for(var i = 0;i < $$_self.elements.length;i++) {
    $$_self.area.el.removeChild($$_self.elements[i])
  }
  $$_self.elements = [];
  $$_self.board = [];
  $$_self.reset();
  $$logExit("$$anonym46")
}
function $$anonym47(y, x, Array) {
  $$logEntry(this, "$$anonym47", arguments);
  var puzzle = [];
  for(var y2 = 0;y2 < y;y2++) {
    puzzle.push(new Array);
    for(var x2 = 0;x2 < x;x2++) {
      puzzle[y2].push(0)
    }
  }
  return $$logExit("$$anonym47", puzzle)
}
function $$anonym48(self) {
  $$logEntry(this, "$$anonym48", arguments);
  if(self.isRunning()) {
    if(self.mayMoveDown()) {
      self.moveDown();
      self.fallDownID = setTimeout(self.fallDown, self.speed)
    }else {
      for(var i = 0;i < self.elements.length;i++) {
        self.area.addElement(self.elements[i])
      }
      var lines = self.area.removeFullLines();
      if(lines) {
        self.tetris.stats.setLines(self.tetris.stats.getLines() + lines);
        self.tetris.stats.setScore(self.tetris.stats.getScore() + 1E3 * self.tetris.stats.getLevel() * lines)
      }
      self.reset();
      if(self.mayPlace()) {
        self.place()
      }else {
        self.tetris.gameOver()
      }
    }
  }
  $$logExit("$$anonym48")
}
function $$anonym49(self) {
  $$logEntry(this, "$$anonym49", arguments);
  if(!self.isRunning() && !self.isStopped()) {
    if(self.mayMoveDown()) {
      self.tetris.stats.setScore(self.tetris.stats.getScore() + 5 + self.tetris.stats.getLevel());
      self.tetris.stats.setActions(self.tetris.stats.getActions() + 1);
      self.moveDown();
      self.forceMoveDownID = setTimeout(self.forceMoveDown, 30)
    }else {
      for(var i = 0;i < self.elements.length;i++) {
        self.area.addElement(self.elements[i])
      }
      var lines = self.area.removeFullLines();
      if(lines) {
        self.tetris.stats.setLines(self.tetris.stats.getLines() + lines);
        self.tetris.stats.setScore(self.tetris.stats.getScore() + 1E3 * self.tetris.stats.getLevel() * lines)
      }
      self.reset();
      if(self.mayPlace()) {
        self.place()
      }else {
        self.tetris.gameOver()
      }
    }
  }
  $$logExit("$$anonym49")
}
function $$anonym50($$_self) {
  $$logEntry(this, "$$anonym50", arguments);
  $$_self.running = false;
  $$logExit("$$anonym50")
}
function $$anonym51($$_self) {
  $$logEntry(this, "$$anonym51", arguments);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        var newY = $$_self.getY() + $$_self.board.length - 1 - x;
        var newX = $$_self.getX() + y;
        if(newY >= $$_self.area.y) {
          return $$logExit("$$anonym51", false)
        }
        if(newX < 0) {
          return $$logExit("$$anonym51", false)
        }
        if(newX >= $$_self.area.x) {
          return $$logExit("$$anonym51", false)
        }
        if($$_self.area.getBlock(newY, newX)) {
          return $$logExit("$$anonym51", false)
        }
      }
    }
  }
  return $$logExit("$$anonym51", true)
}
function $$anonym52($$_self) {
  $$logEntry(this, "$$anonym52", arguments);
  var puzzle = $$_self.createEmptyPuzzle($$_self.board.length, $$_self.board[0].length);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        var newY = puzzle.length - 1 - x;
        var newX = y;
        var el = $$_self.board[y][x];
        var moveY = newY - y;
        var moveX = newX - x;
        el.style.left = el.offsetLeft + moveX * $$_self.area.unit + "px";
        el.style.top = el.offsetTop + moveY * $$_self.area.unit + "px";
        puzzle[newY][newX] = el
      }
    }
  }
  $$_self.board = puzzle;
  $$logExit("$$anonym52")
}
function $$anonym53($$_self) {
  $$logEntry(this, "$$anonym53", arguments);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        if($$_self.getY() + y + 1 >= $$_self.area.y) {
          $$_self.stopped = true;
          return $$logExit("$$anonym53", false)
        }
        if($$_self.area.getBlock($$_self.getY() + y + 1, $$_self.getX() + x)) {
          $$_self.stopped = true;
          return $$logExit("$$anonym53", false)
        }
      }
    }
  }
  return $$logExit("$$anonym53", true)
}
function $$anonym54($$_self) {
  $$logEntry(this, "$$anonym54", arguments);
  for(var i = 0;i < $$_self.elements.length;i++) {
    $$_self.elements[i].style.top = $$_self.elements[i].offsetTop + $$_self.area.unit + "px"
  }
  $$_self.y++;
  $$logExit("$$anonym54")
}
function $$anonym55($$_self) {
  $$logEntry(this, "$$anonym55", arguments);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        if($$_self.getX() + x - 1 < 0) {
          return $$logExit("$$anonym55", false)
        }
        if($$_self.area.getBlock($$_self.getY() + y, $$_self.getX() + x - 1)) {
          return $$logExit("$$anonym55", false)
        }
      }
    }
  }
  return $$logExit("$$anonym55", true)
}
function $$anonym56($$_self) {
  $$logEntry(this, "$$anonym56", arguments);
  for(var i = 0;i < $$_self.elements.length;i++) {
    $$_self.elements[i].style.left = $$_self.elements[i].offsetLeft - $$_self.area.unit + "px"
  }
  $$_self.x--;
  $$logExit("$$anonym56")
}
function $$anonym57($$_self) {
  $$logEntry(this, "$$anonym57", arguments);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        if($$_self.getX() + x + 1 >= $$_self.area.x) {
          return $$logExit("$$anonym57", false)
        }
        if($$_self.area.getBlock($$_self.getY() + y, $$_self.getX() + x + 1)) {
          return $$logExit("$$anonym57", false)
        }
      }
    }
  }
  return $$logExit("$$anonym57", true)
}
function $$anonym58($$_self) {
  $$logEntry(this, "$$anonym58", arguments);
  for(var i = 0;i < $$_self.elements.length;i++) {
    $$_self.elements[i].style.left = $$_self.elements[i].offsetLeft + $$_self.area.unit + "px"
  }
  $$_self.x++;
  $$logExit("$$anonym58")
}
function $$anonym59(Cookie, Number, Score, $$_self) {
  $$logEntry(this, "$$anonym59", arguments);
  var cookie = new Cookie;
  var s = cookie.get("tetris-highscores");
  $$_self.scores = [];
  if(s.length) {
    var scores = s.split("|");
    for(var i = 0;i < scores.length;++i) {
      var a = scores[i].split(":");
      $$_self.scores.push(new Score(a[0], Number(a[1])))
    }
  }
  $$logExit("$$anonym59")
}
function $$anonym60(Cookie, $$_self) {
  $$logEntry(this, "$$anonym60", arguments);
  var cookie = new Cookie;
  var a = [];
  for(var i = 0;i < $$_self.scores.length;++i) {
    a.push($$_self.scores[i].name + ":" + $$_self.scores[i].score)
  }
  var s = a.join("|");
  cookie.set("tetris-highscores", s, 3600 * 24 * 1E3);
  $$logExit("$$anonym60")
}
function $$anonym61(score, $$_self) {
  $$logEntry(this, "$$anonym61", arguments);
  if($$_self.scores.length < $$_self.maxscores) {
    return $$logExit("$$anonym61", true)
  }
  for(var i = $$_self.scores.length - 1;i >= 0;--i) {
    if($$_self.scores[i].score < score) {
      return $$logExit("$$anonym61", true)
    }
  }
  return $$logExit("$$anonym61", false)
}
function $$anonym62(name, score, Score, $$_self) {
  $$logEntry(this, "$$anonym62", arguments);
  name = name.replace(/[;=:|]/g, "?");
  name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if($$_self.scores.length < $$_self.maxscores) {
    $$_self.scores.push(new Score(name, score))
  }else {
    for(var i = $$_self.scores.length - 1;i >= 0;--i) {
      if($$_self.scores[i].score < score) {
        $$_self.scores.removeByIndex(i);
        $$_self.scores.push(new Score(name, score));
        break
      }
    }
  }
  $$_self.sort();
  $$_self.save();
  $$logExit("$$anonym62")
}
function $$anonym63($$_self) {
  $$logEntry(this, "$$anonym63", arguments);
  return $$logExit("$$anonym63", $$_self.scores)
}
function $$anonym64($$_self) {
  $$logEntry(this, "$$anonym64", arguments);
  var s = '<table cellspacing="0" cellpadding="2"><tr><th></th><th>Name</th><th>Score</th></tr>';
  for(var i = 0;i < $$_self.scores.length;++i) {
    s += "<tr><td>?.</td><td>?</td><td>?</td></tr>".format(i + 1, $$_self.scores[i].name, $$_self.scores[i].score)
  }
  s += "</table>";
  return $$logExit("$$anonym64", s)
}
function $$anonym65($$_self) {
  $$logEntry(this, "$$anonym65", arguments);
  var scores = $$_self.scores;
  var len = scores.length;
  $$_self.scores = [];
  for(var i = 0;i < len;++i) {
    var el = null, index = null;
    for(var j = 0;j < scores.length;++j) {
      if(!el || scores[j].score > el.score) {
        el = scores[j];
        index = j
      }
    }
    scores.removeByIndex(index);
    $$_self.scores.push(el)
  }
  $$logExit("$$anonym65")
}
function $$anonym66(name, unescape) {
  $$logEntry(this, "$$anonym66", arguments);
  var cookies = document.cookie.split(";");
  for(var i = 0;i < cookies.length;++i) {
    var a = cookies[i].split("=");
    if(a.length == 2) {
      a[0] = a[0].trim();
      a[1] = a[1].trim();
      if(a[0] == name) {
        return $$logExit("$$anonym66", unescape(a[1]))
      }
    }
  }
  return $$logExit("$$anonym66", "")
}
function $$anonym67(name, value, seconds, path, domain, secure, Date, escape, $$_self) {
  $$logEntry(this, "$$anonym67", arguments);
  $$_self.del(name);
  if(!path) {
    path = "/"
  }
  var cookie = name + "=" + escape(value);
  if(seconds) {
    var date = new Date((new Date).getTime() + seconds * 1E3);
    cookie += "; expires=" + date.toGMTString()
  }
  cookie += path ? "; path=" + path : "";
  cookie += domain ? "; domain=" + domain : "";
  cookie += secure ? "; secure" : "";
  document.cookie = cookie;
  $$logExit("$$anonym67")
}
function $$anonym68(name) {
  $$logEntry(this, "$$anonym68", arguments);
  document.cookie = name + "=; expires=Thu, 01-Jan-70 00:00:01 GMT";
  $$logExit("$$anonym68")
}
function $$anonym69($$_self) {
  $$logEntry(this, "$$anonym69", arguments);
  return $$logExit("$$anonym69", $$_self.replace(/^\s*|\s*$/g, ""))
}
function $$anonym70(index, $$_self) {
  $$logEntry(this, "$$anonym70", arguments);
  $$_self.splice(index, 1);
  $$logExit("$$anonym70")
}
function $$anonym71(arguments, $$_self) {
  $$logEntry(this, "$$anonym71", arguments);
  if(!arguments.length) {
    throw"String.format() failed, no arguments passed, this = " + $$_self;
  }
  var tokens = $$_self.split("?");
  if(arguments.length != tokens.length - 1) {
    throw"String.format() failed, tokens != arguments, this = " + $$_self;
  }
  var s = tokens[0];
  for(var i = 0;i < arguments.length;++i) {
    s += arguments[i] + tokens[i + 1]
  }
  return $$logExit("$$anonym71", s)
}
;