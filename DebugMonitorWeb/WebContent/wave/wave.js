$$logEntry(this, "$$script$$");

// Input 0
function dgebi(a) {
  $$logEntry(this, "dgebi", arguments, arguments.callee);
  return $$logExit("dgebi", document.getElementById(a))
}
var curX = 0;
var curY = 0;
var circles = [];
var w = window.innerWidth;
var h = window.innerHeight;
var c;
var cr = false;
var fps = 0;
var fps_r = 33;
var fps_e;
var fps_max = 33;
var anx = w / 2;
var any = h / 2;
var ano = true;
var anxs = 5;
var anys = 0;
var ha;
function an() {
  $$logEntry(this, "an", arguments, arguments.callee);
  if(ano) {
    circles.push([anx, any, 0]);
    anx += anxs;
    any += anys;
    if(any >= h) {
      anys = anys * -1
    }
    if(anx >= w) {
      anxs = anxs * -1
    }
    if(any < 0) {
      anys = Math.abs(anys)
    }
    if(anx < 0) {
      anxs = Math.abs(anxs)
    }
  }
  //console.log("anx:" + anx + ", any" + any);
  $$logExit("an")
}
function ans() {
  $$logEntry(this, "ans", arguments, arguments.callee);
  anys += Math.random() > 0.5 ? -1 : 1;
  anxs += Math.random() > 0.5 ? -1 : 1;
  //console.log("anxS:" + anxs + ", anyS" + anys);
  if(anys > 10) {
    anys -= 5
  }
  if(anys < -10) {
    anys += 5
  }
  if(anxs > 10) {
    anxs -= 5
  }
  if(anxs < -10) {
    anxs += 5
  }
  $$logExit("ans")
}
function addCircle() {
  $$logEntry(this, "addCircle", arguments, arguments.callee);
  circles.push([curX, curY, 0]);
  $$logExit("addCircle")
}
function updtMouse(e) {
  $$logEntry(this, "updtMouse", arguments, arguments.callee);
  curX = e.pageX;
  curY = e.pageY;
  if(cr) {
    circles.push([curX, curY, 0])
    console.log("CUR: " + curX + "," + curY);
  }
  $$logExit("updtMouse")
}
function loop() {
  $$logEntry(this, "loop", arguments, arguments.callee);
  c.fillRect(0, 0, w, h);
  for(var i = 0;i < circles.length;i++) {
    var cc = circles[i];
    c.strokeStyle = "rgb(" + (255 - cc[2] * ha[3] < 0 ? 0 : 255 - cc[2] * ha[3]) + "," + Math.round(255 - cc[2] * ha[4] < 0 ? 0 : 255 - cc[2] * ha[4]) + "," + Math.round(255 - cc[2] * ha[5]) + ")";
    c.beginPath();
    c.arc(cc[0], cc[1], cc[2], 0, Math.PI * 2, true);
    c.closePath();
    c.stroke();
    circles[i][2] += Math.round(fps_max / fps_r);
    if(circles[i][2] > ha[7]) {
      circles.splice(i, 1)
    }
  }
  fps++;
  $$logExit("loop")
}
function ccfps() {
  $$logEntry(this, "ccfps", arguments, arguments.callee);
  fps_e.innerHTML = "FPS: " + fps + " Circles: " + circles.length;
  fps_r = fps;
  fps = 0;
  $$logExit("ccfps")
}
function init() {
  $$logEntry(this, "init", arguments, arguments.callee);
  ha = location.hash.replace("#", "");
  if(ha) {
    ha = ha.split(",")
  }else {
    ha = []
  }
  var had = [30, 100, 30, 2, 4, 1, "black", 255];
  for(var i = ha.length;i < 8;i++) {
    ha[i] = had[i]
  }
  document.body.onmousedown = function(a) {
    return $$anonym0(a, arguments.callee)
  };
  document.body.onmouseup = function(a) {
    return $$anonym1(a, arguments.callee)
  };
  fps_e = dgebi("fps");
  fps_max = 1E3 / ha[2];
  setInterval(ccfps, 1E3);
  setInterval(an, ha[0]);
  setInterval(ans, ha[1]);
  setInterval(loop, ha[2]);
  c.fillStyle = ha[6];
  $$logExit("init")
}
window.addEventListener("load", function() {
  return $$anonym2(addCircle, arguments.callee)
}, true);
window.addEventListener("load", function() {
  return $$anonym3(dgebi, init, arguments.callee)
}, true);
document.onmousemove = updtMouse;
function $$anonym0(a, origCallee) {
  $$logEntry(this, "$$anonym0", arguments, origCallee);
  cr = true;
  $$logExit("$$anonym0")
}
function $$anonym1(a, origCallee) {
  $$logEntry(this, "$$anonym1", arguments, origCallee);
  cr = false;
  $$logExit("$$anonym1")
}
function $$anonym2(addCircle, origCallee) {
  $$logEntry(this, "$$anonym2", arguments, origCallee);
  document.body.addEventListener("click", addCircle, true);
  $$logExit("$$anonym2")
}
function $$anonym3(dgebi, init, origCallee) {
  $$logEntry(this, "$$anonym3", arguments, origCallee);
  dgebi("canv").width = window.innerWidth;
  dgebi("canv").height = window.innerHeight;
  c = dgebi("canv").getContext("2d");
  init();
  $$logExit("$$anonym3")
}
;

$$logExit("$$script$$")