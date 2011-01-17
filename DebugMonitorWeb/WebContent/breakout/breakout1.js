$$logEntry(this, "$$script$$");

// Input 0
var timerID = null;
var INT = 10;
var loadFLG = 0;
var gameFLG = 0;
var missFLG = 0;
var tim = 0;
var blcol = new Array(5);
var blsta = new Array(40);
var blNO = new Array(40);
var blclr = 0;
var ballX = 0;
var ballY = 0;
var ballN = 5;
var ballDX = 0;
var ballDY = 0;
var tmpRL = 193;
var X = 0;
blcol[0] = "#FFFF00";
blcol[1] = "#FFCF00";
blcol[2] = "#FF7F00";
blcol[3] = "#FF3F00";
blcol[4] = "#FF0000";
blcol[5] = "#000000";
function mainF() {
  $$logEntry(this, "mainF", arguments, arguments.callee);
  clearTimeout(timerID);
  tim = tim + 1;
  with(Math) {
    tmptim = floor(tim / 10)
  }
  document.forms[0].TM.value = tmptim;
  ballX = ballX + ballDX;
  ballY = ballY + ballDY;
  outCHK();
  blkCHK();
  ball.style.posTop = ballY;
  ball.style.posLeft = ballX;
  racket.style.posLeft = tmpRL;
  if(gameFLG == 1) {
    timerID = setTimeout("mainF()", INT)
  }
  $$logExit("mainF")
}
function initG() {
  $$logEntry(this, "initG", arguments, arguments.callee);
  if(blclr >= 40) {
    blclr = 0;
    tim = 0;
    ballN = 3;
    with(Math) {
      tmptim = floor(tim / 10)
    }
    document.forms[0].TM.value = tmptim;
    clrmes.style.posTop = -1E3;
    clrmes.style.posLeft = -1E3;
    ovrmes.style.posTop = -1E3;
    ovrmes.style.posLeft = -1E3;
    for(ib = 0;ib < 5;ib++) {
      for(ia = 0;ia < 8;ia++) {
        chc(ib * 8 + ia + 1, ib);
        blsta[ib * 8 + ia] = ib
      }
    }
  }
  document.forms[0].BL.value = ballN;
  starter.style.posTop = -1E3;
  starter.style.posLeft = -1E3;
  gameFLG = 1;
  loadFLG = 1;
  ballX = 209;
  ballY = 270;
  ballDX = -8;
  ballDY = -8;
  tmpRL = 193;
  missFLG = 0;
  timerID = setTimeout("mainF()", INT);
  $$logExit("initG")
}
function SUP() {
  $$logEntry(this, "SUP", arguments, arguments.callee);
  UP.outerHTML = "<DIV ID='DN' STYLE='position:absolute'><A HREF='javascript:SDN()'>SPEED DOWN</A></DIV>";
  DN.style.posTop = 170;
  DN.style.posLeft = 432;
  INT = 10;
  $$logExit("SUP")
}
function SDN() {
  $$logEntry(this, "SDN", arguments, arguments.callee);
  DN.outerHTML = "<DIV ID='UP' STYLE='position:absolute'><A HREF='javascript:SUP()'>SPEED UP</A></DIV>";
  UP.style.posTop = 170;
  UP.style.posLeft = 432;
  INT = 100;
  $$logExit("SDN")
}
function MouseMv(event) {
  $$logEntry(this, "MouseMv", arguments, arguments.callee);
  X = event.x;
  if(loadFLG == 1) {
    tmpRL = X - 20;
    if(tmpRL < 16) {
      tmpRL = 16
    }
    if(tmpRL > 370) {
      tmpRL = 370
    }
  }
  $$logExit("MouseMv")
}
function outCHK() {
  $$logEntry(this, "outCHK", arguments, arguments.callee);
  if(ballX < 16) {
    ballX = 32 - ballX;
    ballDX = -ballDX
  }
  if(ballX > 401) {
    ballX = 802 - ballX;
    ballDX = -ballDX
  }
  if(ballY < 16) {
    ballY = 32 - ballY;
    ballDY = -ballDY
  }
  if(ballY >= 272) {
    if(missFLG == 0) {
      tmpX = ballDX / ballDY * (272 - ballY) + ballX;
      if(tmpX >= tmpRL - 12) {
        if(tmpX <= tmpRL + 42) {
          ballY = 272;
          ballDY = -ballDY;
          ballX = tmpX;
          ballRD = tmpX - tmpRL;
          with(Math) {
            ballDX = 8 * abs(ballDX) / ballDX
          }
          if(ballRD < -4) {
            ballDX = -15
          }
          if(ballRD > 36) {
            ballDX = 15
          }
          if(ballRD >= 14) {
            if(ballRD <= 16) {
              ballDX = -2
            }
          }
          if(ballRD >= 17) {
            if(ballRD <= 20) {
              ballDX = 2
            }
          }
          if(ballRD >= 0) {
            if(ballRD <= 4) {
              ballDX = -4
            }
          }
          if(ballRD >= 28) {
            if(ballRD <= 32) {
              ballDX = 4
            }
          }
          if(ballRD >= -4) {
            if(ballRD <= -1) {
              ballDX = -11
            }
          }
          if(ballRD >= 33) {
            if(ballRD <= 36) {
              ballDX = 11
            }
          }
        }
      }
      if(ballDY > 0) {
        missFLG = 1
      }
    }else {
      if(ballY > 290) {
        missFLG = 0;
        ballN = ballN - 1;
        gameEnd()
      }
    }
  }
  $$logExit("outCHK")
}
function blkCHK() {
  $$logEntry(this, "blkCHK", arguments, arguments.callee);
  tmpY = ballY + 4;
  tmpX = ballX + 4;
  if(tmpY >= 48) {
    if(tmpY <= 147) {
      if(tmpX >= 29) {
        if(tmpX <= 396) {
          with(Math) {
            ia = floor((tmpX - 29) / 46);
            ib = floor((tmpY - 48) / 20);
            ic = ib * 8 + ia
          }
          if(blsta[ic] <= 4) {
            tmpbc = blsta[ic] + 1;
            blsta[ic] = tmpbc;
            chc(ic + 1, tmpbc);
            if(tmpbc == 5) {
              blclr = blclr + 1
            }
            if(blclr >= 40) {
              gameEnd()
            }
            if(ballDX > 0) {
              iy = ballDY / ballDX * (29 + 46 * ia - tmpX) + tmpY;
              if(iy > 48 + 20 * ib + 18) {
                tmpY1 = 48 + 20 * ib + 18;
                tmpX1 = ballDX / ballDY * (48 + 20 * ib + 18 - tmpY) + tmpX;
                ballX = tmpX1 - 4;
                ballY = tmpY1 - 4;
                ballDY = -ballDY
              }else {
                if(iy < 44 + 20 * ib) {
                  tmpY1 = 48 + 20 * ib;
                  tmpX1 = ballDX / ballDY * (48 + 20 * ib - tmpY) + tmpX;
                  ballX = tmpX1 - 4;
                  ballY = tmpY1 - 4;
                  ballDY = -ballDY
                }else {
                  tmpX1 = 29 + 46 * ia;
                  tmpY1 = ballDY / ballDX * (29 + 46 * ia - tmpX) + tmpY;
                  ballX = tmpX1 - 4;
                  ballY = tmpY1 - 4;
                  ballDX = -ballDX
                }
              }
            }else {
              iy = ballDY / ballDX * (29 + 46 * ia + 44 - tmpX) + tmpY;
              if(iy > 48 + 20 * ib + 18) {
                tmpY1 = 48 + 20 * ib + 18;
                tmpX1 = ballDX / ballDY * (48 + 20 * ib + 18 - tmpY) + tmpX;
                ballX = tmpX1 - 4;
                ballY = tmpY1 - 4;
                ballDY = -ballDY
              }else {
                if(iy < 44 + 20 * ib) {
                  tmpY1 = 48 + 20 * ib;
                  tmpX1 = ballDX / ballDY * (48 + 20 * ib - tmpY) + tmpX;
                  ballX = tmpX1 - 4;
                  ballY = tmpY1 - 4;
                  ballDY = -ballDY
                }else {
                  tmpX1 = 29 + 46 * ia + 44;
                  tmpY1 = ballDY / ballDX * (29 + 46 * ia + 44 - tmpX) + tmpY;
                  ballX = tmpX1 - 4;
                  ballY = tmpY1 - 4;
                  ballDX = -ballDX
                }
              }
            }
          }
        }
      }
    }
  }
  $$logExit("blkCHK")
}
function gameEnd() {
  $$logEntry(this, "gameEnd", arguments, arguments.callee);
  document.forms[0].BL.value = ballN;
  gameFLG = 0;
  loadFLG = 0;
  starter.style.posTop = 200;
  starter.style.posLeft = 180;
  if(blclr >= 40) {
    clrmes.style.posTop = 150;
    clrmes.style.posLeft = 160
  }
  if(ballN <= 0) {
    ovrmes.style.posTop = 150;
    ovrmes.style.posLeft = 160;
    blclr = 40
  }
  $$logExit("gameEnd")
}
function onLD() {
  $$logEntry(this, "onLD", arguments, arguments.callee);
  bgIE.style.posTop = 16;
  bgIE.style.posLeft = 16;
  ball.style.posTop = 270;
  ball.style.posLeft = 209;
  racket.style.posTop = 280;
  racket.style.posLeft = 193;
  info.style.posTop = 16;
  info.style.posLeft = 432;
  starter.style.posTop = -1E3;
  starter.style.posLeft = -1E3;
  clrmes.style.posTop = -1E3;
  clrmes.style.posLeft = -1E3;
  ovrmes.style.posTop = -1E3;
  ovrmes.style.posLeft = -1E3;
  DN.style.posTop = 170;
  DN.style.posLeft = 432;
  for(ib = 0;ib < 5;ib++) {
    for(ia = 0;ia < 8;ia++) {
      blsta[ib * 8 + ia] = ib
    }
  }
  starter.style.posTop = 200;
  starter.style.posLeft = 180;
  $$logExit("onLD")
}
function chc(bno, bcl) {
  $$logEntry(this, "chc", arguments, arguments.callee);
  tmpbno = "b" + (bno - 1);
  eval(tmpbno).bgColor = blcol[bcl];
  $$logExit("chc")
}
;

$$logExit("$$script$$")