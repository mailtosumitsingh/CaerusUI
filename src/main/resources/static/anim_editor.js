function playAnim(){
	var arr = new Array();
	for(var i=0;i<pData.data.length;i++){
		var o = pData.data[i];
		if(o.type=="myanim"){
			arr.push(o);
		}
	}
	arr.sort(function (a,b){
		return a.st- b.st;
		});
	for(var i=0;i<arr.length;i++){
		var o = arr[i];
		console.log(o.name);
	}

}
class myanim{
	constructor(sx,sy,w,h,name)
	{
		this.type="myanim";
		this.sx = sx;
		this.sy=sy;
		this.w = w;
		this.h = h;
		this.id = getUniqId();
		this.name=name;
	
	}
	
}

function createAnim(name){
	a = new myanim(name);
	addObjectToGraph(a);
	return a;
}

function saveAnim(a){
	removeNodeById(a.id);
	addObjectToGraph(a);
}
function renderMyAnim(obj){
	var a = pCanvas.rect(obj.sx,obj.sy,obj.w,obj.h,4);
	a.node.setAttribute("eleid",obj.id);

	var b = a.getBBox();
	console.log(b)
	var l  =  pCanvas.rect(b.x-5,b.y+b.height/2,5,5,3);
	var r  =  pCanvas.rect(b.x+b.width,b.y+b.height/2,5,5,3);
	
	var d  =  pCanvas.rect(b.x+b.width-4,b.y+b.height-4,4,4,1);

	
	a.attr("stroke",Raphael.getColor());
	a.attr("opacity",.7);
	a.attr("fill",Raphael.getColor());

	l.attr("stroke","green");
	l.attr("opacity",.5);
	l.attr("fill","green");

	r.attr("stroke","green");
	r.attr("opacity",.5);
	r.attr("fill","green");

	d.attr("stroke","red");
	d.attr("opacity",.5);
	d.attr("fill","red");

	
	(function(a,l,r){
	a.mouseover(function (){
	a.attr("opacity",.5);
	});
	a.mouseout(function (){
	a.attr("opacity",.7);
	});


	})(a,l,r);



	(function (a,mm){
	var sx=0,sy=0;
	var m = mm;
	anim_start = function(){
	sx = this.getBBox().x;
	sy = this.getBBox().y;
	},
	anim_move = function(dx,dy){
	var b = m.getBBox();
	var pos = {x:sx+dx,y:sy};
	var w = pos.x -b.x+this.getBBox().width;
	if(w>7){
	m.attr("width",w);
	this.attr(pos);
	}
	},anim_up = function(){
	var b = m.getBBox();
	var w = b.x+b.width;
	if(sx!=this.getBBox().x || sy!=this.getBBox().y){
		anim_updateSize(m);
	}
	}
	a.drag(anim_move,anim_start,anim_up);
	})(r,a);

	(function (a,mm){
	var sx=0,sy=0;
	var m = mm;
	anim_start2 = function(){
	sx = this.getBBox().x;
	sy = this.getBBox().y;
	},
	anim_move2 = function(dx,dy){
	var b = m.getBBox();
	var pos = {x:sx+dx,y:sy};
	var w = b.x+b.width-pos.x;

	if(w>7){
	m.attr("width",w);
	m.attr("x",pos.x);
	this.attr(pos);
	}
	},anim_up2 = function(){
	var b = m.getBBox();
	var w = b.x+b.width;
	if(sx!=this.getBBox().x || sy!=this.getBBox().y){
		anim_updateSize(m);
	}
	}
	a.drag(anim_move2,anim_start2,anim_up2);
	})(l,a);

	(function (a,l,r){
	var sx=0,sy=0;
	var lx=0,ly=0,rx=0,ry=0;
	anim_start3 = function(){
	sx = this.getBBox().x;
	sy = this.getBBox().y;

	rx = r.getBBox().x;
	ry = r.getBBox().y;


	lx = l.getBBox().x;
	ly = l.getBBox().y;

	},
	anim_move3 = function(dx,dy){
	var b = a.getBBox();
	var pos = {x:sx+dx,y:sy+dy};
	this.attr(pos);
	l.attr({x:lx+dx,y:ly+dy});
	r.attr({x:rx+dx,y:ry+dy});
	if(sx!=this.getBBox().x || sy!=this.getBBox().y){
		anim_updateSize(a);
	}
	},anim_up3 = function(){
	var b = a.getBBox();
	var w = b.x+b.width;
	if(sx!=this.getBBox().x || sy!=this.getBBox().y){
		anim_updateSize(a);
	}
	}
	a.drag(anim_move3,anim_start3,anim_up3);
	})(a,l,r);

	(function (a,mm){
		var sx=0,sy=0;
		var m = mm;
		anim_start4 = function(){
		sx = this.getBBox().x;
		sy = this.getBBox().y;
		},
		anim_move4 = function(dx,dy){
		var b = m.getBBox();
		var pos = {x:sx+dx,y:sy+dy};
		var w = b.x+b.width-pos.x;
		var h = b.y+b.height-pos.y;

		if(w>4 && h>4){
		m.attr("width",w);
		m.attr("x",pos.x);
		m.attr("height",h);
		m.attr("y",pos.y);
		this.attr(pos);
		}
			
		},anim_up4 = function(){
		var b = m.getBBox();
		var w = b.x+b.width;
		var h = b.y+b.height;
		if(sx!=this.getBBox().x || sy!=this.getBBox().y){
			anim_updateSizeD(m);
		}
		}
		a.drag(anim_move4,anim_start4,anim_up4);
		})(d,a);
	
	function anim_updateSize(a){
	var b = a.getBBox();
	var w = b.x+b.width;
	//update element 
	var id = a.node.getAttribute("eleid");
	var obj = findNodeById(id);
	if(obj!=null){
	obj.sx = b.x;
	obj.en=b.x+b.width;
	}
	}
	function anim_updateSizeD(a){
		var b = a.getBBox();
		var w = b.x+b.width;
		//update element 
		var id = a.node.getAttribute("eleid");
		var obj = findNodeById(id);
		if(obj!=null){
		obj.sx = b.x;
		obj.en=b.x+b.width;
		}
		}
}