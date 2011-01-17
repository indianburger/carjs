function dgebi(a){return document.getElementById(a);}

var curX=0;
var curY=0;
var circles=[];
var w=window.innerWidth;
var h=window.innerHeight;
var c;
var cr=false;
var fps=0;
var fps_r=33;
var fps_e;
var fps_max=33;

var anx=w/2;
var any=h/2;
var ano=true;

var anxs=5;
var anys=0;
// ha:  circleAddInterval,circleDirChangeInterval,loopInterval,RFactor,GFactor,BFactor,backgroundColor,deleteCircleRadius
var ha;

function an(){
	if(ano){
	circles.push([anx,any,0]);
	anx+=anxs;
	any+=anys;
	if(any>=h) anys=anys*-1;
	if(anx>=w) anxs=anxs*-1;
	if(any<0)  anys=Math.abs(anys);
	if(anx<0)  anxs=Math.abs(anxs);
	}


}
function ans(){
	anys+=(Math.random()>0.5?-1:1);
	anxs+=(Math.random()>0.5?-1:1);
	if(anys>10){
		anys-=5;
	}
	if(anys<-10){
		anys+=5;
	}
	if(anxs>10){
		anxs-=5;
	}
	if(anxs<-10){
		anxs+=5;
	}
}
function addCircle(){
	circles.push([curX,curY,0]);
}
function updtMouse(e){
	curX=e.pageX;
	curY=e.pageY;
	if(cr){
		circles.push([curX,curY,0]);
	}
	
}
function loop(){
	c.fillRect(0,0,w,h);
	for(var i=0;i<circles.length;i++){
		var cc=circles[i];
		c.strokeStyle="rgb("+((255-cc[2]*ha[3])<0?0:(255-cc[2]*ha[3]))+","+Math.round((255-cc[2]*ha[4])<0?0:(255-cc[2]*ha[4]))+","+Math.round(255-cc[2]*ha[5])+")";
		c.beginPath();
		c.arc(cc[0],cc[1],cc[2],0,Math.PI*2,true);
		c.closePath();
		c.stroke();
		circles[i][2]+=Math.round(fps_max/fps_r);
		if(circles[i][2]>ha[7]){
			
			circles.splice(i,1);
		}
	}
	fps++;


}
function ccfps(){
	fps_e.innerHTML="FPS: "+fps+" Circles: "+circles.length;
	fps_r=fps;
	fps=0;
}
function init(){
	ha=location.hash.replace("#","");;
	if(ha){
		ha=ha.split(",");
	}
	else{
		ha=[];
	}
	/*if(ha.length!=8){
		
	}*/
	var had=[30,100,30,2,4,1,"black",255];
	for(var i=ha.length;i<8;i++){
		ha[i]=had[i];
	}
	document.body.onmousedown=function(a){cr=true;}
	document.body.onmouseup=function(a){cr=false;}
	fps_e=dgebi("fps");
	fps_max=1000/ha[2];
	setInterval(ccfps,1000);
	setInterval(an,ha[0]);
	setInterval(ans,ha[1]);
	setInterval(loop,ha[2]);
	c.fillStyle=ha[6];
	
}
window.addEventListener("load",function(){document.body.addEventListener("click",addCircle,true);},true);
window.addEventListener("load",function(){dgebi("canv").width=window.innerWidth;dgebi("canv").height=window.innerHeight;c=dgebi("canv").getContext("2d");init();},true);

document.onmousemove=updtMouse;