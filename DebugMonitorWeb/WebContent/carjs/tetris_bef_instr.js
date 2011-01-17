// Input 0
function Tetris() {
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
    if(self.puzzle && !confirm("Are you sure you want to start a new game ?")) {
      return
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
  };
  this.reset = function() {
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
    document.getElementById("tetris-resume").style.display = "none"
  };
  this.pause = function() {
    if(self.puzzle == null) {
      return
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
        return
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
  };
  this.gameOver = function() {
    self.stats.stop();
    self.puzzle.stop();
    document.getElementById("tetris-nextpuzzle").style.display = "none";
    document.getElementById("tetris-gameover").style.display = "block";
    if(this.highscores.mayAdd(this.stats.getScore())) {
      var name = prompt("Game Over !\nEnter your name:", "");
      if(name && name.trim().length) {
        this.highscores.add(name, this.stats.getScore())
      }
    }
  };
  this.up = function() {
    if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
      if(self.puzzle.mayRotate()) {
        self.puzzle.rotate();
        self.stats.setActions(self.stats.getActions() + 1)
      }
    }
  };
  this.down = function() {
    if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
      if(self.puzzle.mayMoveDown()) {
        self.stats.setScore(self.stats.getScore() + 5 + self.stats.getLevel());
        self.puzzle.moveDown();
        self.stats.setActions(self.stats.getActions() + 1)
      }
    }
  };
  this.left = function() {
    if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
      if(self.puzzle.mayMoveLeft()) {
        self.puzzle.moveLeft();
        self.stats.setActions(self.stats.getActions() + 1)
      }
    }
  };
  this.right = function() {
    if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
      if(self.puzzle.mayMoveRight()) {
        self.puzzle.moveRight();
        self.stats.setActions(self.stats.getActions() + 1)
      }
    }
  };
  this.space = function() {
    if(self.puzzle && self.puzzle.isRunning() && !self.puzzle.isStopped()) {
      self.puzzle.stop();
      self.puzzle.forceMoveDown()
    }
  };
  var helpwindow = new Window("tetris-help");
  var highscores = new Window("tetris-highscores");
  document.getElementById("tetris-menu-start").onclick = function() {
    helpwindow.close();
    highscores.close();
    self.start();
    this.blur()
  };
  document.getElementById("tetris-menu-pause").onclick = function() {
    self.pause();
    this.blur()
  };
  document.getElementById("tetris-menu-resume").onclick = function() {
    self.pause();
    this.blur()
  };
  document.getElementById("tetris-menu-help").onclick = function() {
    highscores.close();
    helpwindow.activate();
    this.blur()
  };
  document.getElementById("tetris-help-close").onclick = helpwindow.close;
  document.getElementById("tetris-menu-highscores").onclick = function() {
    helpwindow.close();
    document.getElementById("tetris-highscores-content").innerHTML = self.highscores.toHtml();
    highscores.activate();
    this.blur()
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
    this.id = id;
    this.el = document.getElementById(this.id);
    var self = this;
    this.activate = function() {
      self.el.style.display = self.el.style.display == "block" ? "none" : "block"
    };
    this.close = function() {
      self.el.style.display = "none"
    };
    this.isActive = function() {
      return self.el.style.display == "block"
    }
  }
  function Keyboard() {
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
      this.keys.push(key);
      this.funcs.push(func)
    };
    this.event = function(e) {
      if(!e) {
        e = window.event
      }
      for(var i = 0;i < self.keys.length;i++) {
        if(e.keyCode == self.keys[i]) {
          self.funcs[i]()
        }
      }
    }
  }
  function Stats() {
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
      this.reset();
      this.timerId = setInterval(this.incTime, 1E3)
    };
    this.stop = function() {
      if(this.timerId) {
        clearInterval(this.timerId)
      }
    };
    this.reset = function() {
      this.stop();
      this.level = 1;
      this.time = 0;
      this.apm = 0;
      this.lines = 0;
      this.score = 0;
      this.puzzles = 0;
      this.actions = 0;
      this.el.level.innerHTML = this.level;
      this.el.time.innerHTML = this.time;
      this.el.apm.innerHTML = this.apm;
      this.el.lines.innerHTML = this.lines;
      this.el.score.innerHTML = this.score
    };
    this.incTime = function() {
      self.time++;
      self.el.time.innerHTML = self.time;
      self.apm = parseInt(self.actions / self.time * 60);
      self.el.apm.innerHTML = self.apm
    };
    this.setScore = function(i) {
      this.score = i;
      this.el.score.innerHTML = this.score
    };
    this.setLevel = function(i) {
      this.level = i;
      this.el.level.innerHTML = this.level
    };
    this.setLines = function(i) {
      this.lines = i;
      this.el.lines.innerHTML = this.lines
    };
    this.setPuzzles = function(i) {
      this.puzzles = i
    };
    this.setActions = function(i) {
      this.actions = i
    };
    this.getScore = function() {
      return this.score
    };
    this.getLevel = function() {
      return this.level
    };
    this.getLines = function() {
      return this.lines
    };
    this.getPuzzles = function() {
      return this.puzzles
    };
    this.getActions = function() {
      return this.actions
    }
  }
  function Area(unit, x, y, id) {
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
      for(var y = 0;y < this.board.length;y++) {
        for(var x = 0;x < this.board[y].length;x++) {
          if(this.board[y][x]) {
            this.el.removeChild(this.board[y][x]);
            this.board[y][x] = 0
          }
        }
      }
    };
    this.removeFullLines = function() {
      var lines = 0;
      for(var y = this.y - 1;y > 0;y--) {
        if(this.isLineFull(y)) {
          this.removeLine(y);
          lines++;
          y++
        }
      }
      return lines
    };
    this.isLineFull = function(y) {
      for(var x = 0;x < this.x;x++) {
        if(!this.board[y][x]) {
          return false
        }
      }
      return true
    };
    this.removeLine = function(y) {
      for(var x = 0;x < this.x;x++) {
        this.el.removeChild(this.board[y][x]);
        this.board[y][x] = 0
      }
      y--;
      for(;y > 0;y--) {
        for(var x = 0;x < this.x;x++) {
          if(this.board[y][x]) {
            var el = this.board[y][x];
            el.style.top = el.offsetTop + this.unit + "px";
            this.board[y + 1][x] = el;
            this.board[y][x] = 0
          }
        }
      }
    };
    this.getBlock = function(y, x) {
      if(y < 0) {
        return 0
      }
      if(y < this.y && x < this.x) {
        return this.board[y][x]
      }else {
        throw"Area.getBlock(" + y + ", " + x + ") failed";
      }
    };
    this.addElement = function(el) {
      var x = parseInt(el.offsetLeft / this.unit);
      var y = parseInt(el.offsetTop / this.unit);
      if(y >= 0 && y < this.y && x >= 0 && x < this.x) {
        this.board[y][x] = el
      }else {
      }
    }
  }
  function Puzzle(tetris, area) {
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
      if(this.fallDownID) {
        clearTimeout(this.fallDownID)
      }
      if(this.forceMoveDownID) {
        clearTimeout(this.forceMoveDownID)
      }
      this.type = this.nextType;
      this.nextType = random(this.puzzles.length);
      this.position = 0;
      this.speed = 80 + 700 / this.tetris.stats.getLevel();
      this.running = false;
      this.stopped = false;
      this.board = [];
      this.elements = [];
      for(var i = 0;i < this.nextElements.length;i++) {
        document.getElementById("tetris-nextpuzzle").removeChild(this.nextElements[i])
      }
      this.nextElements = [];
      this.x = null;
      this.y = null
    };
    this.nextType = random(this.puzzles.length);
    this.reset();
    this.isRunning = function() {
      return this.running
    };
    this.isStopped = function() {
      return this.stopped
    };
    this.getX = function() {
      return this.x
    };
    this.getY = function() {
      return this.y
    };
    this.mayPlace = function() {
      var puzzle = this.puzzles[this.type];
      var areaStartX = parseInt((this.area.x - puzzle[0].length) / 2);
      var areaStartY = 1;
      var lineFound = false;
      var lines = 0;
      for(var y = puzzle.length - 1;y >= 0;y--) {
        for(var x = 0;x < puzzle[y].length;x++) {
          if(puzzle[y][x]) {
            lineFound = true;
            if(this.area.getBlock(areaStartY, areaStartX + x)) {
              return false
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
      return true
    };
    this.place = function() {
      this.tetris.stats.setPuzzles(this.tetris.stats.getPuzzles() + 1);
      if(this.tetris.stats.getPuzzles() >= 10 + this.tetris.stats.getLevel() * 2) {
        this.tetris.stats.setLevel(this.tetris.stats.getLevel() + 1);
        this.tetris.stats.setPuzzles(0)
      }
      var puzzle = this.puzzles[this.type];
      var areaStartX = parseInt((this.area.x - puzzle[0].length) / 2);
      var areaStartY = 1;
      var lineFound = false;
      var lines = 0;
      this.x = areaStartX;
      this.y = 1;
      this.board = this.createEmptyPuzzle(puzzle.length, puzzle[0].length);
      for(var y = puzzle.length - 1;y >= 0;y--) {
        for(var x = 0;x < puzzle[y].length;x++) {
          if(puzzle[y][x]) {
            lineFound = true;
            var el = document.createElement("div");
            el.className = "block" + this.type;
            el.style.left = (areaStartX + x) * this.area.unit + "px";
            el.style.top = (areaStartY - lines) * this.area.unit + "px";
            this.area.el.appendChild(el);
            this.board[y][x] = el;
            this.elements.push(el)
          }
        }
        if(lines) {
          this.y--
        }
        if(lineFound) {
          lines++
        }
      }
      this.running = true;
      this.fallDownID = setTimeout(this.fallDown, this.speed);
      var nextPuzzle = this.puzzles[this.nextType];
      for(var y = 0;y < nextPuzzle.length;y++) {
        for(var x = 0;x < nextPuzzle[y].length;x++) {
          if(nextPuzzle[y][x]) {
            var el = document.createElement("div");
            el.className = "block" + this.nextType;
            el.style.left = x * this.area.unit + "px";
            el.style.top = y * this.area.unit + "px";
            document.getElementById("tetris-nextpuzzle").appendChild(el);
            this.nextElements.push(el)
          }
        }
      }
    };
    this.destroy = function() {
      for(var i = 0;i < this.elements.length;i++) {
        this.area.el.removeChild(this.elements[i])
      }
      this.elements = [];
      this.board = [];
      this.reset()
    };
    this.createEmptyPuzzle = function(y, x) {
      var puzzle = [];
      for(var y2 = 0;y2 < y;y2++) {
        puzzle.push(new Array);
        for(var x2 = 0;x2 < x;x2++) {
          puzzle[y2].push(0)
        }
      }
      return puzzle
    };
    this.fallDown = function() {
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
    };
    this.forceMoveDown = function() {
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
    };
    this.stop = function() {
      this.running = false
    };
    this.mayRotate = function() {
      for(var y = 0;y < this.board.length;y++) {
        for(var x = 0;x < this.board[y].length;x++) {
          if(this.board[y][x]) {
            var newY = this.getY() + this.board.length - 1 - x;
            var newX = this.getX() + y;
            if(newY >= this.area.y) {
              return false
            }
            if(newX < 0) {
              return false
            }
            if(newX >= this.area.x) {
              return false
            }
            if(this.area.getBlock(newY, newX)) {
              return false
            }
          }
        }
      }
      return true
    };
    this.rotate = function() {
      var puzzle = this.createEmptyPuzzle(this.board.length, this.board[0].length);
      for(var y = 0;y < this.board.length;y++) {
        for(var x = 0;x < this.board[y].length;x++) {
          if(this.board[y][x]) {
            var newY = puzzle.length - 1 - x;
            var newX = y;
            var el = this.board[y][x];
            var moveY = newY - y;
            var moveX = newX - x;
            el.style.left = el.offsetLeft + moveX * this.area.unit + "px";
            el.style.top = el.offsetTop + moveY * this.area.unit + "px";
            puzzle[newY][newX] = el
          }
        }
      }
      this.board = puzzle
    };
    this.mayMoveDown = function() {
      for(var y = 0;y < this.board.length;y++) {
        for(var x = 0;x < this.board[y].length;x++) {
          if(this.board[y][x]) {
            if(this.getY() + y + 1 >= this.area.y) {
              this.stopped = true;
              return false
            }
            if(this.area.getBlock(this.getY() + y + 1, this.getX() + x)) {
              this.stopped = true;
              return false
            }
          }
        }
      }
      return true
    };
    this.moveDown = function() {
      for(var i = 0;i < this.elements.length;i++) {
        this.elements[i].style.top = this.elements[i].offsetTop + this.area.unit + "px"
      }
      this.y++
    };
    this.mayMoveLeft = function() {
      for(var y = 0;y < this.board.length;y++) {
        for(var x = 0;x < this.board[y].length;x++) {
          if(this.board[y][x]) {
            if(this.getX() + x - 1 < 0) {
              return false
            }
            if(this.area.getBlock(this.getY() + y, this.getX() + x - 1)) {
              return false
            }
          }
        }
      }
      return true
    };
    this.moveLeft = function() {
      for(var i = 0;i < this.elements.length;i++) {
        this.elements[i].style.left = this.elements[i].offsetLeft - this.area.unit + "px"
      }
      this.x--
    };
    this.mayMoveRight = function() {
      for(var y = 0;y < this.board.length;y++) {
        for(var x = 0;x < this.board[y].length;x++) {
          if(this.board[y][x]) {
            if(this.getX() + x + 1 >= this.area.x) {
              return false
            }
            if(this.area.getBlock(this.getY() + y, this.getX() + x + 1)) {
              return false
            }
          }
        }
      }
      return true
    };
    this.moveRight = function() {
      for(var i = 0;i < this.elements.length;i++) {
        this.elements[i].style.left = this.elements[i].offsetLeft + this.area.unit + "px"
      }
      this.x++
    }
  }
  function random(i) {
    return 1
  }
  function Highscores(maxscores) {
    this.maxscores = maxscores;
    this.scores = [];
    this.load = function() {
      var cookie = new Cookie;
      var s = cookie.get("tetris-highscores");
      this.scores = [];
      if(s.length) {
        var scores = s.split("|");
        for(var i = 0;i < scores.length;++i) {
          var a = scores[i].split(":");
          this.scores.push(new Score(a[0], Number(a[1])))
        }
      }
    };
    this.save = function() {
      var cookie = new Cookie;
      var a = [];
      for(var i = 0;i < this.scores.length;++i) {
        a.push(this.scores[i].name + ":" + this.scores[i].score)
      }
      var s = a.join("|");
      cookie.set("tetris-highscores", s, 3600 * 24 * 1E3)
    };
    this.mayAdd = function(score) {
      if(this.scores.length < this.maxscores) {
        return true
      }
      for(var i = this.scores.length - 1;i >= 0;--i) {
        if(this.scores[i].score < score) {
          return true
        }
      }
      return false
    };
    this.add = function(name, score) {
      name = name.replace(/[;=:|]/g, "?");
      name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      if(this.scores.length < this.maxscores) {
        this.scores.push(new Score(name, score))
      }else {
        for(var i = this.scores.length - 1;i >= 0;--i) {
          if(this.scores[i].score < score) {
            this.scores.removeByIndex(i);
            this.scores.push(new Score(name, score));
            break
          }
        }
      }
      this.sort();
      this.save()
    };
    this.getScores = function() {
      return this.scores
    };
    this.toHtml = function() {
      var s = '<table cellspacing="0" cellpadding="2"><tr><th></th><th>Name</th><th>Score</th></tr>';
      for(var i = 0;i < this.scores.length;++i) {
        s += "<tr><td>?.</td><td>?</td><td>?</td></tr>".format(i + 1, this.scores[i].name, this.scores[i].score)
      }
      s += "</table>";
      return s
    };
    this.sort = function() {
      var scores = this.scores;
      var len = scores.length;
      this.scores = [];
      for(var i = 0;i < len;++i) {
        var el = null, index = null;
        for(var j = 0;j < scores.length;++j) {
          if(!el || scores[j].score > el.score) {
            el = scores[j];
            index = j
          }
        }
        scores.removeByIndex(index);
        this.scores.push(el)
      }
    };
    function Score(name, score) {
      this.name = name;
      this.score = score
    }
    this.load()
  }
  function Cookie() {
    this.get = function(name) {
      var cookies = document.cookie.split(";");
      for(var i = 0;i < cookies.length;++i) {
        var a = cookies[i].split("=");
        if(a.length == 2) {
          a[0] = a[0].trim();
          a[1] = a[1].trim();
          if(a[0] == name) {
            return unescape(a[1])
          }
        }
      }
      return""
    };
    this.set = function(name, value, seconds, path, domain, secure) {
      this.del(name);
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
      document.cookie = cookie
    };
    this.del = function(name) {
      document.cookie = name + "=; expires=Thu, 01-Jan-70 00:00:01 GMT"
    }
  }
}
if(!String.prototype.trim) {
  String.prototype.trim = function() {
    return this.replace(/^\s*|\s*$/g, "")
  }
}
if(!Array.prototype.removeByIndex) {
  Array.prototype.removeByIndex = function(index) {
    this.splice(index, 1)
  }
}
if(!String.prototype.format) {
  String.prototype.format = function() {
    if(!arguments.length) {
      throw"String.format() failed, no arguments passed, this = " + this;
    }
    var tokens = this.split("?");
    if(arguments.length != tokens.length - 1) {
      throw"String.format() failed, tokens != arguments, this = " + this;
    }
    var s = tokens[0];
    for(var i = 0;i < arguments.length;++i) {
      s += arguments[i] + tokens[i + 1]
    }
    return s
  }
}
;