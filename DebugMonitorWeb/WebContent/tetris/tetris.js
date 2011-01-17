$$logEntry(this, "$$script$$");

// Input 0
function Tetris() {
  $$logEntry(this, "Tetris", arguments, arguments.callee);
  var self = this;
  this.stats = new Stats;
  this.puzzle = null;
  this.area = null;
  this.unit = 20;
  this.areaX = 20;
  this.areaY = 20;
  this.highscores = new Highscores(10);
  this.start = function() {
    return $$anonym0(Area, self, Puzzle, arguments.callee)
  };
  this.reset = function() {
    return $$anonym1(self, arguments.callee)
  };
  this.gameOver = function() {
    return $$anonym2(self, this, arguments.callee)
  };
  this.up = function() {
    return $$anonym3(self, arguments.callee)
  };
  this.down = function() {
    return $$anonym4(self, arguments.callee)
  };
  this.left = function() {
    return $$anonym5(self, arguments.callee)
  };
  this.right = function() {
    return $$anonym6(self, arguments.callee)
  };
  this.space = function() {
    return $$anonym7(self, arguments.callee)
  };
  var helpwindow = new Window("tetris-help");
  var highscores = new Window("tetris-highscores");
  document.getElementById("tetris-menu-start").onclick = function() {
    return $$anonym8(helpwindow, self, highscores, this, arguments.callee)
  };
  document.getElementById("tetris-menu-reset").onclick = function() {
    return $$anonym9(helpwindow, self, highscores, this, arguments.callee)
  };
  document.getElementById("tetris-menu-help").onclick = function() {
    return $$anonym10(helpwindow, highscores, this, arguments.callee)
  };
  document.getElementById("tetris-help-close").onclick = helpwindow.close;
  document.getElementById("tetris-menu-highscores").onclick = function() {
    return $$anonym11(helpwindow, self, highscores, this, arguments.callee)
  };
  document.getElementById("tetris-highscores-close").onclick = highscores.close;
  document.getElementById("tetris-keyboard-up").onclick = function() {
    return $$anonym12(self, this, arguments.callee)
  };
  document.getElementById("tetris-keyboard-down").onclick = function() {
    return $$anonym13(self, this, arguments.callee)
  };
  document.getElementById("tetris-keyboard-left").onclick = function() {
    return $$anonym14(self, this, arguments.callee)
  };
  document.getElementById("tetris-keyboard-right").onclick = function() {
    return $$anonym15(self, this, arguments.callee)
  };
  var keyboard = new Keyboard;
  keyboard.set(keyboard.n, this.start);
  keyboard.set(keyboard.r, this.reset);
  keyboard.set(keyboard.up, this.up);
  keyboard.set(keyboard.down, this.down);
  keyboard.set(keyboard.left, this.left);
  keyboard.set(keyboard.right, this.right);
  keyboard.set(keyboard.space, this.space);
  document.onkeydown = keyboard.event;
  function Window(id) {
    $$logEntry(this, "Window", arguments, arguments.callee);
    this.id = id;
    this.el = document.getElementById(this.id);
    var self = this;
    this.activate = function() {
      return $$anonym16(self, arguments.callee)
    };
    this.close = function() {
      return $$anonym17(self, arguments.callee)
    };
    this.isActive = function() {
      return $$anonym18(self, arguments.callee)
    };
    $$logExit("Window")
  }
  function Keyboard() {
    $$logEntry(this, "Keyboard", arguments, arguments.callee);
    this.up = 38;
    this.down = 40;
    this.left = 37;
    this.right = 39;
    this.n = 78;
    this.r = 82;
    this.space = 32;
    this.f12 = 123;
    this.escape = 27;
    this.keys = [];
    this.funcs = [];
    var self = this;
    this.set = function(key, func) {
      return $$anonym19(key, func, this, arguments.callee)
    };
    this.event = function(e) {
      return $$anonym20(e, self, arguments.callee)
    };
    $$logExit("Keyboard")
  }
  function Stats() {
    $$logEntry(this, "Stats", arguments, arguments.callee);
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
      return $$anonym21(this, arguments.callee)
    };
    this.stop = function() {
      return $$anonym22(this, arguments.callee)
    };
    this.reset = function() {
      return $$anonym23(this, arguments.callee)
    };
    this.incTime = function() {
      return $$anonym24(self, arguments.callee)
    };
    this.setScore = function(i) {
      return $$anonym25(i, this, arguments.callee)
    };
    this.setLevel = function(i) {
      return $$anonym26(i, this, arguments.callee)
    };
    this.setLines = function(i) {
      return $$anonym27(i, this, arguments.callee)
    };
    this.setPuzzles = function(i) {
      return $$anonym28(i, this, arguments.callee)
    };
    this.setActions = function(i) {
      return $$anonym29(i, this, arguments.callee)
    };
    this.getScore = function() {
      return $$anonym30(this, arguments.callee)
    };
    this.getLevel = function() {
      return $$anonym31(this, arguments.callee)
    };
    this.getLines = function() {
      return $$anonym32(this, arguments.callee)
    };
    this.getPuzzles = function() {
      return $$anonym33(this, arguments.callee)
    };
    this.getActions = function() {
      return $$anonym34(this, arguments.callee)
    };
    $$logExit("Stats")
  }
  function Area(unit, x, y, id) {
    $$logEntry(this, "Area", arguments, arguments.callee);
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
      return $$anonym35(this, arguments.callee)
    };
    this.removeFullLines = function() {
      return $$anonym36(this, arguments.callee)
    };
    this.isLineFull = function(y) {
      return $$anonym37(y, this, arguments.callee)
    };
    this.removeLine = function(y) {
      return $$anonym38(y, this, arguments.callee)
    };
    this.getBlock = function(y, x) {
      return $$anonym39(y, x, this, arguments.callee)
    };
    this.addElement = function(el) {
      return $$anonym40(el, this, arguments.callee)
    };
    $$logExit("Area")
  }
  function Puzzle(tetris, area) {
    $$logEntry(this, "Puzzle", arguments, arguments.callee);
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
      return $$anonym41(random, this, arguments.callee)
    };
    this.nextType = random(this.puzzles.length);
    this.reset();
    this.isRunning = function() {
      return $$anonym42(this, arguments.callee)
    };
    this.isStopped = function() {
      return $$anonym43(this, arguments.callee)
    };
    this.getX = function() {
      return $$anonym44(this, arguments.callee)
    };
    this.getY = function() {
      return $$anonym45(this, arguments.callee)
    };
    this.mayPlace = function() {
      return $$anonym46(this, arguments.callee)
    };
    this.place = function() {
      return $$anonym47(this, arguments.callee)
    };
    this.destroy = function() {
      return $$anonym48(this, arguments.callee)
    };
    this.createEmptyPuzzle = function(y, x) {
      return $$anonym49(y, x, Array, arguments.callee)
    };
    this.fallDown = function() {
      return $$anonym50(self, arguments.callee)
    };
    this.forceMoveDown = function() {
      return $$anonym51(self, arguments.callee)
    };
    this.stop = function() {
      return $$anonym52(this, arguments.callee)
    };
    this.mayRotate = function() {
      return $$anonym53(this, arguments.callee)
    };
    this.rotate = function() {
      return $$anonym54(this, arguments.callee)
    };
    this.mayMoveDown = function() {
      return $$anonym55(this, arguments.callee)
    };
    this.moveDown = function() {
      return $$anonym56(this, arguments.callee)
    };
    this.mayMoveLeft = function() {
      return $$anonym57(this, arguments.callee)
    };
    this.moveLeft = function() {
      return $$anonym58(this, arguments.callee)
    };
    this.mayMoveRight = function() {
      return $$anonym59(this, arguments.callee)
    };
    this.moveRight = function() {
      return $$anonym60(this, arguments.callee)
    };
    $$logExit("Puzzle")
  }
  function random(i) {
    $$logEntry(this, "random", arguments, arguments.callee);
    return $$logExit("Tetris", $$logExit("random", Math.floor(Math.random() * i)))
  }
  function Highscores(maxscores) {
    $$logEntry(this, "Highscores", arguments, arguments.callee);
    this.maxscores = maxscores;
    this.scores = [];
    this.load = function() {
      return $$anonym61(Cookie, Number, Score, this, arguments.callee)
    };
    this.save = function() {
      return $$anonym62(Cookie, this, arguments.callee)
    };
    this.mayAdd = function(score) {
      return $$anonym63(score, this, arguments.callee)
    };
    this.add = function(name, score) {
      return $$anonym64(name, score, Score, this, arguments.callee)
    };
    this.getScores = function() {
      return $$anonym65(this, arguments.callee)
    };
    this.toHtml = function() {
      return $$anonym66(this, arguments.callee)
    };
    this.sort = function() {
      return $$anonym67(this, arguments.callee)
    };
    function Score(name, score) {
      $$logEntry(this, "Score", arguments, arguments.callee);
      this.name = name;
      this.score = score;
      $$logExit("Score")
    }
    this.load();
    $$logExit("Highscores")
  }
  function Cookie() {
    $$logEntry(this, "Cookie", arguments, arguments.callee);
    this.get = function(name) {
      return $$anonym68(name, unescape, arguments.callee)
    };
    this.set = function(name, value, seconds, path, domain, secure) {
      return $$anonym69(name, value, seconds, path, domain, secure, Date, escape, arguments.callee)
    };
    this.del = function(name) {
      return $$anonym70(name, arguments.callee)
    };
    $$logExit("Cookie")
  }
  $$logExit("Tetris")
}
if(!String.prototype.trim) {
  String.prototype.trim = function() {
    return $$anonym71(this, arguments.callee)
  }
}
if(!Array.prototype.removeByIndex) {
  Array.prototype.removeByIndex = function(index) {
    return $$anonym72(index, this, arguments.callee)
  }
}
if(!String.prototype.format) {
  String.prototype.format = function() {
    return $$anonym73(this, arguments.callee)
  }
}
function $$anonym0(Area, self, Puzzle, origCallee) {
  $$logEntry(this, "$$anonym0", arguments, origCallee);
  self.reset();
  self.stats.start();
  document.getElementById("tetris-nextpuzzle").style.display = "block";
  self.area = new Area(self.unit, self.areaX, self.areaY, "tetris-area");
  self.puzzle = new Puzzle(self, self.area);
  if(self.puzzle.mayPlace()) {
    self.puzzle.place()
  }else {
    self.gameOver()
  }
  $$logExit("$$anonym0")
}
function $$anonym1(self, origCallee) {
  $$logEntry(this, "$$anonym1", arguments, origCallee);
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
  self.stats.reset();
  $$logExit("$$anonym1")
}
function $$anonym2(self, $$_self, origCallee) {
  $$logEntry(this, "$$anonym2", arguments, origCallee);
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
  $$logExit("$$anonym2")
}
function $$anonym3(self, origCallee) {
  $$logEntry(this, "$$anonym3", arguments, origCallee);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    if(self.puzzle.mayRotate()) {
      self.puzzle.rotate();
      self.stats.setActions(self.stats.getActions() + 1)
    }
  }
  $$logExit("$$anonym3")
}
function $$anonym4(self, origCallee) {
  $$logEntry(this, "$$anonym4", arguments, origCallee);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    if(self.puzzle.mayMoveDown()) {
      self.stats.setScore(self.stats.getScore() + 5 + self.stats.getLevel());
      self.puzzle.moveDown();
      self.stats.setActions(self.stats.getActions() + 1)
    }
  }
  $$logExit("$$anonym4")
}
function $$anonym5(self, origCallee) {
  $$logEntry(this, "$$anonym5", arguments, origCallee);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    if(self.puzzle.mayMoveLeft()) {
      self.puzzle.moveLeft();
      self.stats.setActions(self.stats.getActions() + 1)
    }
  }
  $$logExit("$$anonym5")
}
function $$anonym6(self, origCallee) {
  $$logEntry(this, "$$anonym6", arguments, origCallee);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    if(self.puzzle.mayMoveRight()) {
      self.puzzle.moveRight();
      self.stats.setActions(self.stats.getActions() + 1)
    }
  }
  $$logExit("$$anonym6")
}
function $$anonym7(self, origCallee) {
  $$logEntry(this, "$$anonym7", arguments, origCallee);
  if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
    self.puzzle.stop();
    self.puzzle.forceMoveDown()
  }
  $$logExit("$$anonym7")
}
function $$anonym8(helpwindow, self, highscores, $$_self, origCallee) {
  $$logEntry(this, "$$anonym8", arguments, origCallee);
  helpwindow.close();
  highscores.close();
  self.start();
  $$_self.blur();
  $$logExit("$$anonym8")
}
function $$anonym9(helpwindow, self, highscores, $$_self, origCallee) {
  $$logEntry(this, "$$anonym9", arguments, origCallee);
  helpwindow.close();
  highscores.close();
  self.reset();
  $$_self.blur();
  $$logExit("$$anonym9")
}
function $$anonym10(helpwindow, highscores, $$_self, origCallee) {
  $$logEntry(this, "$$anonym10", arguments, origCallee);
  highscores.close();
  helpwindow.activate();
  $$_self.blur();
  $$logExit("$$anonym10")
}
function $$anonym11(helpwindow, self, highscores, $$_self, origCallee) {
  $$logEntry(this, "$$anonym11", arguments, origCallee);
  helpwindow.close();
  document.getElementById("tetris-highscores-content").innerHTML = self.highscores.toHtml();
  highscores.activate();
  $$_self.blur();
  $$logExit("$$anonym11")
}
function $$anonym12(self, $$_self, origCallee) {
  $$logEntry(this, "$$anonym12", arguments, origCallee);
  self.up();
  $$_self.blur();
  $$logExit("$$anonym12")
}
function $$anonym13(self, $$_self, origCallee) {
  $$logEntry(this, "$$anonym13", arguments, origCallee);
  self.down();
  $$_self.blur();
  $$logExit("$$anonym13")
}
function $$anonym14(self, $$_self, origCallee) {
  $$logEntry(this, "$$anonym14", arguments, origCallee);
  self.left();
  $$_self.blur();
  $$logExit("$$anonym14")
}
function $$anonym15(self, $$_self, origCallee) {
  $$logEntry(this, "$$anonym15", arguments, origCallee);
  self.right();
  $$_self.blur();
  $$logExit("$$anonym15")
}
function $$anonym16(self, origCallee) {
  $$logEntry(this, "$$anonym16", arguments, origCallee);
  self.el.style.display = self.el.style.display == "block" ? "none" : "block";
  $$logExit("$$anonym16")
}
function $$anonym17(self, origCallee) {
  $$logEntry(this, "$$anonym17", arguments, origCallee);
  self.el.style.display = "none";
  $$logExit("$$anonym17")
}
function $$anonym18(self, origCallee) {
  $$logEntry(this, "$$anonym18", arguments, origCallee);
  return $$logExit("$$anonym18", self.el.style.display == "block")
}
function $$anonym19(key, func, $$_self, origCallee) {
  $$logEntry(this, "$$anonym19", arguments, origCallee);
  $$_self.keys.push(key);
  $$_self.funcs.push(func);
  $$logExit("$$anonym19")
}
function $$anonym20(e, self, origCallee) {
  $$logEntry(this, "$$anonym20", arguments, origCallee);
  if(!e) {
    e = window.event
  }
  for(var i = 0;i < self.keys.length;i++) {
    if((e.keyCode || e.keyIdentifier) == self.keys[i]) {
      self.funcs[i]()
    }
  }
  $$logExit("$$anonym20")
}
function $$anonym21($$_self, origCallee) {
  $$logEntry(this, "$$anonym21", arguments, origCallee);
  $$_self.reset();
  $$_self.timerId = setInterval($$_self.incTime, 1E3);
  $$logExit("$$anonym21")
}
function $$anonym22($$_self, origCallee) {
  $$logEntry(this, "$$anonym22", arguments, origCallee);
  if($$_self.timerId) {
    clearInterval($$_self.timerId)
  }
  $$logExit("$$anonym22")
}
function $$anonym23($$_self, origCallee) {
  $$logEntry(this, "$$anonym23", arguments, origCallee);
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
  $$logExit("$$anonym23")
}
function $$anonym24(self, origCallee) {
  $$logEntry(this, "$$anonym24", arguments, origCallee);
  self.time++;
  self.el.time.innerHTML = self.time;
  self.apm = parseInt(self.actions / self.time * 60);
  self.el.apm.innerHTML = self.apm;
  $$logExit("$$anonym24")
}
function $$anonym25(i, $$_self, origCallee) {
  $$logEntry(this, "$$anonym25", arguments, origCallee);
  $$_self.score = i;
  $$_self.el.score.innerHTML = $$_self.score;
  $$logExit("$$anonym25")
}
function $$anonym26(i, $$_self, origCallee) {
  $$logEntry(this, "$$anonym26", arguments, origCallee);
  $$_self.level = i;
  $$_self.el.level.innerHTML = $$_self.level;
  $$logExit("$$anonym26")
}
function $$anonym27(i, $$_self, origCallee) {
  $$logEntry(this, "$$anonym27", arguments, origCallee);
  $$_self.lines = i;
  $$_self.el.lines.innerHTML = $$_self.lines;
  $$logExit("$$anonym27")
}
function $$anonym28(i, $$_self, origCallee) {
  $$logEntry(this, "$$anonym28", arguments, origCallee);
  $$_self.puzzles = i;
  $$logExit("$$anonym28")
}
function $$anonym29(i, $$_self, origCallee) {
  $$logEntry(this, "$$anonym29", arguments, origCallee);
  $$_self.actions = i;
  $$logExit("$$anonym29")
}
function $$anonym30($$_self, origCallee) {
  $$logEntry(this, "$$anonym30", arguments, origCallee);
  return $$logExit("$$anonym30", $$_self.score)
}
function $$anonym31($$_self, origCallee) {
  $$logEntry(this, "$$anonym31", arguments, origCallee);
  return $$logExit("$$anonym31", $$_self.level)
}
function $$anonym32($$_self, origCallee) {
  $$logEntry(this, "$$anonym32", arguments, origCallee);
  return $$logExit("$$anonym32", $$_self.lines)
}
function $$anonym33($$_self, origCallee) {
  $$logEntry(this, "$$anonym33", arguments, origCallee);
  return $$logExit("$$anonym33", $$_self.puzzles)
}
function $$anonym34($$_self, origCallee) {
  $$logEntry(this, "$$anonym34", arguments, origCallee);
  return $$logExit("$$anonym34", $$_self.actions)
}
function $$anonym35($$_self, origCallee) {
  $$logEntry(this, "$$anonym35", arguments, origCallee);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        $$_self.el.removeChild($$_self.board[y][x]);
        $$_self.board[y][x] = 0
      }
    }
  }
  $$logExit("$$anonym35")
}
function $$anonym36($$_self, origCallee) {
  $$logEntry(this, "$$anonym36", arguments, origCallee);
  var lines = 0;
  for(var y = $$_self.y - 1;y > 0;y--) {
    if($$_self.isLineFull(y)) {
      $$_self.removeLine(y);
      lines++;
      y++
    }
  }
  return $$logExit("$$anonym36", lines)
}
function $$anonym37(y, $$_self, origCallee) {
  $$logEntry(this, "$$anonym37", arguments, origCallee);
  for(var x = 0;x < $$_self.x;x++) {
    if(!$$_self.board[y][x]) {
      return $$logExit("$$anonym37", false)
    }
  }
  return $$logExit("$$anonym37", true)
}
function $$anonym38(y, $$_self, origCallee) {
  $$logEntry(this, "$$anonym38", arguments, origCallee);
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
  $$logExit("$$anonym38")
}
function $$anonym39(y, x, $$_self, origCallee) {
  $$logEntry(this, "$$anonym39", arguments, origCallee);
  if(y < 0) {
    return $$logExit("$$anonym39", 0)
  }
  if(y < $$_self.y && x < $$_self.x) {
    return $$logExit("$$anonym39", $$_self.board[y][x])
  }else {
    throw"Area.getBlock(" + y + ", " + x + ") failed";
  }
}
function $$anonym40(el, $$_self, origCallee) {
  $$logEntry(this, "$$anonym40", arguments, origCallee);
  var x = parseInt(el.offsetLeft / $$_self.unit);
  var y = parseInt(el.offsetTop / $$_self.unit);
  if(y >= 0 && y < $$_self.y && x >= 0 && x < $$_self.x) {
    $$_self.board[y][x] = el
  }else {
  }
  $$logExit("$$anonym40")
}
function $$anonym41(random, $$_self, origCallee) {
  $$logEntry(this, "$$anonym41", arguments, origCallee);
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
  $$logExit("$$anonym41")
}
function $$anonym42($$_self, origCallee) {
  $$logEntry(this, "$$anonym42", arguments, origCallee);
  return $$logExit("$$anonym42", $$_self.running)
}
function $$anonym43($$_self, origCallee) {
  $$logEntry(this, "$$anonym43", arguments, origCallee);
  return $$logExit("$$anonym43", $$_self.stopped)
}
function $$anonym44($$_self, origCallee) {
  $$logEntry(this, "$$anonym44", arguments, origCallee);
  return $$logExit("$$anonym44", $$_self.x)
}
function $$anonym45($$_self, origCallee) {
  $$logEntry(this, "$$anonym45", arguments, origCallee);
  return $$logExit("$$anonym45", $$_self.y)
}
function $$anonym46($$_self, origCallee) {
  $$logEntry(this, "$$anonym46", arguments, origCallee);
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
          return $$logExit("$$anonym46", false)
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
  return $$logExit("$$anonym46", true)
}
function $$anonym47($$_self, origCallee) {
  $$logEntry(this, "$$anonym47", arguments, origCallee);
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
  $$logExit("$$anonym47")
}
function $$anonym48($$_self, origCallee) {
  $$logEntry(this, "$$anonym48", arguments, origCallee);
  for(var i = 0;i < $$_self.elements.length;i++) {
    $$_self.area.el.removeChild($$_self.elements[i])
  }
  $$_self.elements = [];
  $$_self.board = [];
  $$_self.reset();
  $$logExit("$$anonym48")
}
function $$anonym49(y, x, Array, origCallee) {
  $$logEntry(this, "$$anonym49", arguments, origCallee);
  var puzzle = [];
  for(var y2 = 0;y2 < y;y2++) {
    puzzle.push(new Array);
    for(var x2 = 0;x2 < x;x2++) {
      puzzle[y2].push(0)
    }
  }
  return $$logExit("$$anonym49", puzzle)
}
function $$anonym50(self, origCallee) {
  $$logEntry(this, "$$anonym50", arguments, origCallee);
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
  $$logExit("$$anonym50")
}
function $$anonym51(self, origCallee) {
  $$logEntry(this, "$$anonym51", arguments, origCallee);
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
  $$logExit("$$anonym51")
}
function $$anonym52($$_self, origCallee) {
  $$logEntry(this, "$$anonym52", arguments, origCallee);
  $$_self.running = false;
  $$logExit("$$anonym52")
}
function $$anonym53($$_self, origCallee) {
  $$logEntry(this, "$$anonym53", arguments, origCallee);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        var newY = $$_self.getY() + $$_self.board.length - 1 - x;
        var newX = $$_self.getX() + y;
        if(newY >= $$_self.area.y) {
          return $$logExit("$$anonym53", false)
        }
        if(newX < 0) {
          return $$logExit("$$anonym53", false)
        }
        if(newX >= $$_self.area.x) {
          return $$logExit("$$anonym53", false)
        }
        if($$_self.area.getBlock(newY, newX)) {
          return $$logExit("$$anonym53", false)
        }
      }
    }
  }
  return $$logExit("$$anonym53", true)
}
function $$anonym54($$_self, origCallee) {
  $$logEntry(this, "$$anonym54", arguments, origCallee);
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
  $$logExit("$$anonym54")
}
function $$anonym55($$_self, origCallee) {
  $$logEntry(this, "$$anonym55", arguments, origCallee);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        if($$_self.getY() + y + 1 >= $$_self.area.y) {
          $$_self.stopped = true;
          return $$logExit("$$anonym55", false)
        }
        if($$_self.area.getBlock($$_self.getY() + y + 1, $$_self.getX() + x)) {
          $$_self.stopped = true;
          return $$logExit("$$anonym55", false)
        }
      }
    }
  }
  return $$logExit("$$anonym55", true)
}
function $$anonym56($$_self, origCallee) {
  $$logEntry(this, "$$anonym56", arguments, origCallee);
  for(var i = 0;i < $$_self.elements.length;i++) {
    $$_self.elements[i].style.top = $$_self.elements[i].offsetTop + $$_self.area.unit + "px"
  }
  $$_self.y++;
  $$logExit("$$anonym56")
}
function $$anonym57($$_self, origCallee) {
  $$logEntry(this, "$$anonym57", arguments, origCallee);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        if($$_self.getX() + x - 1 < 0) {
          return $$logExit("$$anonym57", false)
        }
        if($$_self.area.getBlock($$_self.getY() + y, $$_self.getX() + x - 1)) {
          return $$logExit("$$anonym57", false)
        }
      }
    }
  }
  return $$logExit("$$anonym57", true)
}
function $$anonym58($$_self, origCallee) {
  $$logEntry(this, "$$anonym58", arguments, origCallee);
  for(var i = 0;i < $$_self.elements.length;i++) {
    $$_self.elements[i].style.left = $$_self.elements[i].offsetLeft - $$_self.area.unit + "px"
  }
  $$_self.x--;
  $$logExit("$$anonym58")
}
function $$anonym59($$_self, origCallee) {
  $$logEntry(this, "$$anonym59", arguments, origCallee);
  for(var y = 0;y < $$_self.board.length;y++) {
    for(var x = 0;x < $$_self.board[y].length;x++) {
      if($$_self.board[y][x]) {
        if($$_self.getX() + x + 1 >= $$_self.area.x) {
          return $$logExit("$$anonym59", false)
        }
        if($$_self.area.getBlock($$_self.getY() + y, $$_self.getX() + x + 1)) {
          return $$logExit("$$anonym59", false)
        }
      }
    }
  }
  return $$logExit("$$anonym59", true)
}
function $$anonym60($$_self, origCallee) {
  $$logEntry(this, "$$anonym60", arguments, origCallee);
  for(var i = 0;i < $$_self.elements.length;i++) {
    $$_self.elements[i].style.left = $$_self.elements[i].offsetLeft + $$_self.area.unit + "px"
  }
  $$_self.x++;
  $$logExit("$$anonym60")
}
function $$anonym61(Cookie, Number, Score, $$_self, origCallee) {
  $$logEntry(this, "$$anonym61", arguments, origCallee);
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
  $$logExit("$$anonym61")
}
function $$anonym62(Cookie, $$_self, origCallee) {
  $$logEntry(this, "$$anonym62", arguments, origCallee);
  var cookie = new Cookie;
  var a = [];
  for(var i = 0;i < $$_self.scores.length;++i) {
    a.push($$_self.scores[i].name + ":" + $$_self.scores[i].score)
  }
  var s = a.join("|");
  cookie.set("tetris-highscores", s, 3600 * 24 * 1E3);
  $$logExit("$$anonym62")
}
function $$anonym63(score, $$_self, origCallee) {
  $$logEntry(this, "$$anonym63", arguments, origCallee);
  if($$_self.scores.length < $$_self.maxscores) {
    return $$logExit("$$anonym63", true)
  }
  for(var i = $$_self.scores.length - 1;i >= 0;--i) {
    if($$_self.scores[i].score < score) {
      return $$logExit("$$anonym63", true)
    }
  }
  return $$logExit("$$anonym63", false)
}
function $$anonym64(name, score, Score, $$_self, origCallee) {
  $$logEntry(this, "$$anonym64", arguments, origCallee);
  name = name.replace(/[;=:|]/g, "?");
  name = name.replace(/</g, "<").replace(/>/g, ">");
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
  $$logExit("$$anonym64")
}
function $$anonym65($$_self, origCallee) {
  $$logEntry(this, "$$anonym65", arguments, origCallee);
  return $$logExit("$$anonym65", $$_self.scores)
}
function $$anonym66($$_self, origCallee) {
  $$logEntry(this, "$$anonym66", arguments, origCallee);
  var s = '<table cellspacing="0" cellpadding="2"><tr><th></th><th>Name</th><th>Score</th></tr>';
  for(var i = 0;i < $$_self.scores.length;++i) {
    s += "<tr><td>?.</td><td>?</td><td>?</td></tr>".format(i + 1, $$_self.scores[i].name, $$_self.scores[i].score)
  }
  s += "</table>";
  return $$logExit("$$anonym66", s)
}
function $$anonym67($$_self, origCallee) {
  $$logEntry(this, "$$anonym67", arguments, origCallee);
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
  $$logExit("$$anonym67")
}
function $$anonym68(name, unescape, origCallee) {
  $$logEntry(this, "$$anonym68", arguments, origCallee);
  var cookies = document.cookie.split(";");
  for(var i = 0;i < cookies.length;++i) {
    var a = cookies[i].split("=");
    if(a.length == 2) {
      a[0] = a[0].trim();
      a[1] = a[1].trim();
      if(a[0] == name) {
        return $$logExit("$$anonym68", unescape(a[1]))
      }
    }
  }
  return $$logExit("$$anonym68", "")
}
function $$anonym69(name, value, seconds, path, domain, secure, Date, escape, origCallee) {
  $$logEntry(this, "$$anonym69", arguments, origCallee);
  var cookie = name + "=" + escape(value);
  if(seconds) {
    var date = new Date((new Date).getTime() + seconds * 1E3);
    cookie += "; expires=" + date.toGMTString()
  }
  cookie += path ? "; path=" + path : "";
  cookie += domain ? "; domain=" + domain : "";
  cookie += secure ? "; secure" : "";
  document.cookie = cookie;
  $$logExit("$$anonym69")
}
function $$anonym70(name, origCallee) {
  $$logEntry(this, "$$anonym70", arguments, origCallee);
  document.cookie = name + "=; expires=Thu, 01-Jan-70 00:00:01 GMT";
  $$logExit("$$anonym70")
}
function $$anonym71($$_self, origCallee) {
  $$logEntry(this, "$$anonym71", arguments, origCallee);
  return $$logExit("$$anonym71", $$_self.replace(/^\s*|\s*$/g, ""))
}
function $$anonym72(index, $$_self, origCallee) {
  $$logEntry(this, "$$anonym72", arguments, origCallee);
  $$_self.splice(index, 1);
  $$logExit("$$anonym72")
}
function $$anonym73($$_self, origCallee) {
  $$logEntry(this, "$$anonym73", arguments, origCallee);
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
  return $$logExit("$$anonym73", s)
}
;

$$logExit("$$script$$")