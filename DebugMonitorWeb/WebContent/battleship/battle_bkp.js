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

function $$restOfInit(){
	$$oldRand = Math.random;
	Math.random = function(){

		var val = $$oldRand();
		console.log('rand' + val);
		$$sendLog("$$RAND", val, new Date().getTime());
		return val;
	}
	
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
			var props = [];
			var minObject = $$addPropsFound(props, item);
			outputItem = ["$$" + className, minObject];
		}
		else if (className.match(/HTML[a-zA-Z0-9]*Element$/i)){
			var props = ["length"];
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
    	
    	$$sendLog($$currFunc, $$currArgs, $$currFuncTime);
    	$$currFunc = null;
    	$$currArgs = null;
    }
	
	//return what was returned by original function
	return arguments[arguments.length - 1];
}

function $$sendLog(funcName, funcArgs, funcTime){
	var row = [funcName, funcArgs, funcTime];
	var logJSON = JSON.stringify(row);
	
	var logWhere = (funcName == "$$RAND" ? "../carjs/log_rand.jsp" : "../carjs/log_func.jsp");
	/*$.post(logWhere, {log: logJSON}, function(data){
		//console.log(data);
	});*/
	$.ajax({
        url: logWhere,
        data: {log: logJSON},
        async:   false
   });
	//console.log("logged");
}



// Input 0
function setupPlayer(ispc) {
  $$logEntry(this, "setupPlayer", arguments);
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
      console.log(shiptypes[s][0] + i + " @ " + cy + cx);
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
  $$logEntry(this, "setImage", arguments);
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
  $$logEntry(this, "showGrid", arguments);
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
  $$logEntry(this, "gridClick", arguments);
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
  $$logEntry(this, "computerMove", arguments);
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
  $$logEntry(this, "sinkShip", arguments);
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
  $$logEntry(this, "knowYourEnemy", arguments);
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
  $$logEntry(this, "updateStatus", arguments);
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
  $$logEntry(this, "setStatus", arguments);
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
  $$logEntry(this, "imagePreload", arguments);
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
  $$logEntry(this, "$$appInit", arguments);
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