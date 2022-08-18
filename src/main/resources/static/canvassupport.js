var pCanvas = {};
var globalShape = null;
var handlers = {};
// var pData = {};


// pData.data = null;
// pData.data = new Array();

var screenWidth = 6000;
var screenHeight = 6000;
var ie = true;
var maxX = screenWidth;
var maxY = screenHeight;
var mouseX = 0;
var mouseY = 0;
var realMouseX = 0;
var realMouseY = 0;
var graphDivId="graph";
var clickcount = 0;
var x1= 0, y1= 0,x2= 0,y2 = 0;
var lastShape = null;
var lastAdded  = null;

var mxpts = new Array();
var mypts = new Array();

mxpts[0] = -1;
mxpts[1] = -1;
mxpts[2] = -1;
mypts[0] = -1;
mypts[1] = -1;
mypts[2] = -1;

var leftWidth = 0;
var topWidth = 0;


handlers["shape"]={
}
handlers["shape"].handle=function (nd){
	console.log("Drawing shape: "+nd.id);
	for(var i=0;i<nd["c"].length;i++){
		var node = nd["c"][i];
		drawPointEle(node.x,node.y,node.id,nd.id,node.pointType);
	}
	var path = getPathFromPointsArrayEx(nd["c"]);
    path =  path + "  Z ";
    var pp = pCanvas.path(path);
    var clr = Raphael.getColor();
    pp.attr("stroke",clr);
    pp.attr("fill","90-#00c6ff-#0072ff")
    pp.attr("opacity",.5);
    pp.node.setAttribute("shapeid",nd.id);
    pp.click(function (evt){
    	var xx = evt.offsetX;
    	var yy = evt.offsetY;
    	var a = pCanvas.circle(xx,yy,6);
    	
    });
}
function draw(){
	setTimeout(_draw,100);
}
function _draw(){
	pCanvas.clear();
	for(var i = 0;i<pData.data.length;i++){
		var obj = pData.data[i];
		if(obj.type=="ShapeShape"){
			currShapeRenderer.renderShape(obj);	
		}else if(obj.type=="Point"){
			console.log("got point")
		}else{
		handlers[obj.type].handle(obj);
		}
	}
}
function setup() {
	setupRaphael();
	pCanvas = Raphael(graphDivId, screenWidth, screenHeight);
	ie = document.all ? true : false;
	document.onmousemove = captureMousePosition2;
	if(pData.data!=null && pData.data.length>0)
		globalShape = pData.data[0];
	draw();
}

function drawPointEle(x1,y1,id,gid,pointType){
	p1 = pCanvas.circle(x1, y1, 4, 4);
	p1.attr("stroke-width", "2");
	if(pointType=="simple"){
		p1.attr("stroke", "orange");
		p1.attr("fill", "yellow");
	}else if(pointType=="control"){
		p1.attr("stroke", "green");
		p1.attr("fill", "blue");
	}	
	p1.node.setAttribute("eleid", id);
	p1.node.setAttribute("shapeid", gid);
	p1.click(function (evt){
		var id = this.node.getAttribute("shapeid");
		var nd = findNodeById(id);
		for(var i=0;i<nd["c"].length;i++){
			var node = nd["c"][i];
			if(node.id==this.node.getAttribute("eleid")){
			if(node.pointType=="control"){
				node.pointType = "simple";
				this.attr("stroke", "orange");
				this.attr("fill", "yellow");
			}else if(node.pointType=="simple"){
				node.pointType = "control";
				this.attr("stroke", "green");
				this.attr("fill", "blue");
			}
			}
		}
	});
	p1.drag(ShapePointMove,ShapePointDragger,ShapePointUp);
	return p1;
}

var ShapePointDragger = function() {
	this.ox = this.attr("cx") ;
	this.oy = this.attr("cy") ;
	this.animate({
		"fill-opacity" : .2
	}, 500);
}, ShapePointMove = function(dx, dy) {
		var att = {
		cx : mouseX ,
		cy : mouseY 
		};
	this.attr(att);
	var myid = this.node.getAttribute("eleid");
	var mysid = this.node.getAttribute("shapeid");
	if (myid != null) {
		var gs = findNodeById(mysid);
		if(gs!=null){
			var pt = getPointFromShape(gs, myid);
			if(pt!=null){
				pt.x  = att.cx;
				pt.y  = att.cy;
			}
		}
	}
}, ShapePointUp = function() {
			var ptStr = this.node.getAttribute("eleid");
			var mysid = this.node.getAttribute("shapeid");
			draw();
};

function addClickHandler(){
	clickcount = 0;
	dojo.byId(graphDivId).onclick = function(evt) {
			x1 = mouseX-4;
			y1 = mouseY;
			x1= Math.round(x1);
			y1= Math.round(y1);
			var point = createPointEle(x1,y1);
			p1= drawPointEle(x1,y1,point.id,lastShape.id,"simple");
	
		
			
			lastShape["c"].push(point);
			clickcount++;
	}
}

function removeClickHandler(){
	dojo.byId(graphDivId).onclick = function(evt) {
			}
}

function clientWidth() {
	return filterResults(
			window.innerWidth ? window.innerWidth : 0,
			document.documentElement ? document.documentElement.clientWidth : 0,
			document.body ? document.body.clientWidth : 0);
}
function clientHeight() {
	return filterResults(window.innerHeight ? window.innerHeight : 0,
			document.documentElement ? document.documentElement.clientHeight
					: 0, document.body ? document.body.clientHeight : 0);
}
function scrollLeft() {
	return filterResults(window.pageXOffset ? window.pageXOffset : 0,
			document.documentElement ? document.documentElement.scrollLeft : 0,
			document.body ? document.body.scrollLeft : 0);
}
function scrollTop() {
	return filterResults(window.pageYOffset ? window.pageYOffset : 0,
			document.documentElement ? document.documentElement.scrollTop : 0,
			document.body ? document.body.scrollTop : 0);
}
function filterResults(n_win, n_docel, n_body) {
	var n_result = n_win ? n_win : 0;
	if (n_docel && (!n_result || (n_result > n_docel)))
		n_result = n_docel;
	return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
}

function setupRaphael() {
	Raphael.fn.line = function(x1, y1, x2, y2) {
		return this.path("M" + x1 + " " + y1 + " L" + x2 + " " + y2);
	};
	Raphael.fn.arrow = function(x1, y1, x2, y2, size) {
		var angle = Math.atan2(x1 - x2, y2 - y1);
		angle = (angle / (2 * Math.PI)) * 360;
		var arrowPath = this.path(
				"M" + x2 + " " + y2 + " L" + (x2 - size) + " " + (y2 - size)
						+ " L" + (x2 - size) + " " + (y2 + size) + " L" + x2
						+ " " + y2).attr("fill", "black").rotate((90 + angle),
				x2, y2);
		var linePath = this.path("M" + x1 + " " + y1 + " L" + x2 + " " + y2);
		return [ linePath, arrowPath ];
	}
	Raphael.fn.qarrow = function(x1, y1, x2, y2, size) {
		var angle = Math.atan2(x1 - x2, y2 - y1);
		angle = (angle / (2 * Math.PI)) * 360;
		var arrowPath = this.path(
				"M" + x2 + " " + y2 + " L" + (x2 - size) + " " + (y2 - size)
						+ " L" + (x2 - size) + " " + (y2 + size) + " L" + x2
						+ " " + y2).attr("fill", "black").rotate((90 + angle),
				x2, y2);
		var xm = (x1 + x2) / 2;
		var ym = (y1 + y2) / 2
		if ((y1 - y2) > 0) {
			ym -= 20;
		} else {

			ym += 20;
		}
		if ((x1 - x2) > 0) {
			xm -= 20;
		} else {
			xm += 20;
		}
		var linePath = this.path("M" + x1 + " " + y1 + " Q " + xm + " " + ym
				+ " " + x2 + " " + y2);
		return [ linePath, arrowPath ];
	}
	Raphael.fn.lightarrow = function(x1, y1, x2, y2, size) {
		var angle = Math.atan2(x1 - x2, y2 - y1);
		angle = (angle / (2 * Math.PI)) * 360;
		var arrowPath = this.path(
				"M" + x2 + " " + y2 + " L" + (x2 - size) + " " + (y2 - size)
						+ " L" + (x2 - size) + " " + (y2 + size) + " L" + x2
						+ " " + y2).attr("fill", "black").rotate((90 + angle),
				x2, y2);
		var xm = (x1 + x2) / 2;
		var ym = (y1 + y2) / 2
		if ((y1 - y2) > 0) {
			xm -= 20;
			ym -= 20;
		} else {
			xm += 20;
			ym += 20;
		}
		var linePath = this.path("M" + x1 + " " + y1 + " Q " + xm + " " + ym
				+ " " + x2 + " " + y2);
		return [ linePath, arrowPath ];
	}
	Raphael.fn.connectionarrow = function(bb1, bb2, size) {
		var linePath = this.connection(bb1, bb2);
		// var linePath2 = this.connectioWn(bb1,bb2);
		// linePath2.translate(2,2);
		// linePath2.attr("opacity",".5");
		var length = linePath.getTotalLength();
		var pt1 = linePath.getPointAtLength(length - 8);
		var pt2 = linePath.getPointAtLength(length);
		var x1 = pt1.x, y1 = pt1.y, x2 = pt2.x, y2 = pt2.y;
		var angle = Math.atan2(x1 - x2, y2 - y1);
		angle = (angle / (2 * Math.PI)) * 360;
		var arrowPath = this.path(
				"M" + x2 + " " + y2 + " L" + (x2 - size) + " " + (y2 - size)
						+ " L" + (x2 - size) + " " + (y2 + size) + " L" + x2
						+ " " + y2).attr("fill", "black").rotate((90 + angle),
				x2, y2);
		// var linePath = this.connection(bb1,bb2);
		return [ linePath, arrowPath ];
	}

	Raphael.fn.ball = function(x, y, r, hue) {
		hue = hue || 0;
		return this.set(this.ellipse(x, y + r - r / 5, r, r / 2).attr({
			fill : "rhsb(" + hue + ", 1, .25)-hsb(" + hue + ", 1, .25)",
			stroke : "none",
			opacity : 0
		}), this.ellipse(x, y, r, r).attr(
				{
					fill : "r(.5,.9)hsb(" + hue + ", 1, .75)-hsb(" + hue
							+ ", .5, .25)",
					stroke : "none"
				}), this.ellipse(x, y, r - r / 5, r - r / 20).attr({
			stroke : "none",
			fill : "r(.5,.1)#ccc-#ccc",
			opacity : 0
		}));
	}
	Raphael.fn.connection = function(bb1, bb2) {
		if (bb1.x != bb2.x || bb1.y != bb2.y) {
			var p = [ {
				x : bb1.x + bb1.width / 2,
				y : bb1.y - 1
			}, {
				x : bb1.x + bb1.width / 2,
				y : bb1.y + bb1.height + 1
			}, {
				x : bb1.x - 1,
				y : bb1.y + bb1.height / 2
			}, {
				x : bb1.x + bb1.width + 1,
				y : bb1.y + bb1.height / 2
			}, {
				x : bb2.x + bb2.width / 2,
				y : bb2.y - 1
			}, {
				x : bb2.x + bb2.width / 2,
				y : bb2.y + bb2.height + 1
			}, {
				x : bb2.x - 1,
				y : bb2.y + bb2.height / 2
			}, {
				x : bb2.x + bb2.width + 1,
				y : bb2.y + bb2.height / 2
			} ], d = {}, dis = [];
			for ( var i = 0; i < 4; i++) {
				for ( var j = 4; j < 8; j++) {
					var dx = Math.abs(p[i].x - p[j].x), dy = Math.abs(p[i].y
							- p[j].y);
					if ((i == j - 4)
							|| (((i != 3 && j != 6) || p[i].x < p[j].x)
									&& ((i != 2 && j != 7) || p[i].x > p[j].x)
									&& ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
						dis.push(dx + dy);
						d[dis[dis.length - 1]] = [ i, j ];
					}
				}
			}
			if (dis.length == 0) {
				var res = [ 0, 4 ];
			} else {
				res = d[Math.min.apply(Math, dis)];
			}
			var x1 = p[res[0]].x, y1 = p[res[0]].y, x4 = p[res[1]].x, y4 = p[res[1]].y;
			dx = Math.max(Math.abs(x1 - x4) / 2, 10);
			dy = Math.max(Math.abs(y1 - y4) / 2, 10);
			var x2 = [ x1, x1, x1 - dx, x1 + dx ][res[0]].toFixed(3), y2 = [
					y1 - dy, y1 + dy, y1, y1 ][res[0]].toFixed(3), x3 = [ 0, 0,
					0, 0, x4, x4, x4 - dx, x4 + dx ][res[1]].toFixed(3), y3 = [
					0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4 ][res[1]].toFixed(3);
			var path = [ "M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3,
					y3, x4.toFixed(3), y4.toFixed(3) ].join(",");
			return this.path(path);
		} else {
			var x = bb1.x + bb1.width / 2;
			var y = bb1.y;
			var x2 = bb1.x + bb1.width / 2;
			var y2 = bb1.y + bb1.height;

			var path = [ "M", x, y, "A", bb1.width / 1.4, bb1.height / 1.4, 0,
					1, 0, x2, y2 ];
			return this.path(path);
		}
	}
	var tokenRegex = /\{([^\}]+)\}/g, objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches
	replacer = function(all, key, obj) {
		var res = obj;
		key.replace(objNotationRegex, function(all, name, quote, quotedName,
				isFunc) {
			name = name || quotedName;
			if (res) {
				if (name in res) {
					res = res[name];
				}
				typeof res == "function" && isFunc && (res = res());
			}
		});
		res = (res == null || res == obj ? all : res) + "";
		return res;
	}, fill = function(str, obj) {
		return String(str).replace(tokenRegex, function(all, key) {
			return replacer(all, key, obj);
		});
	};
	Raphael.fn.popup = function(X, Y, set, pos, ret) {
		pos = String(pos || "top-middle").split("-");
		pos[1] = pos[1] || "middle";
		var r = 5, bb = set.getBBox(), w = Math.round(bb.width), h = Math
				.round(bb.height), x = Math.round(bb.x) - r, y = Math
				.round(bb.y)
				- r, gap = Math.min(h / 2, w / 2, 10), shapes = {
			top : "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}l-{right},0-{gap},{gap}-{gap}-{gap}-{left},0a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
			bottom : "M{x},{y}l{left},0,{gap}-{gap},{gap},{gap},{right},0a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
			right : "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}l0-{bottom}-{gap}-{gap},{gap}-{gap},0-{top}a{r},{r},0,0,1,{r}-{r}z",
			left : "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}l0,{top},{gap},{gap}-{gap},{gap},0,{bottom}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z"
		}, offset = {
			hx0 : X - (x + r + w - gap * 2),
			hx1 : X - (x + r + w / 2 - gap),
			hx2 : X - (x + r + gap),
			vhy : Y - (y + r + h + r + gap),
			"^hy" : Y - (y - gap)

		}, mask = [ {
			x : x + r,
			y : y,
			w : w,
			w4 : w / 4,
			h4 : h / 4,
			right : 0,
			left : w - gap * 2,
			bottom : 0,
			top : h - gap * 2,
			r : r,
			h : h,
			gap : gap
		}, {
			x : x + r,
			y : y,
			w : w,
			w4 : w / 4,
			h4 : h / 4,
			left : w / 2 - gap,
			right : w / 2 - gap,
			top : h / 2 - gap,
			bottom : h / 2 - gap,
			r : r,
			h : h,
			gap : gap
		}, {
			x : x + r,
			y : y,
			w : w,
			w4 : w / 4,
			h4 : h / 4,
			left : 0,
			right : w - gap * 2,
			top : 0,
			bottom : h - gap * 2,
			r : r,
			h : h,
			gap : gap
		} ][pos[1] == "middle" ? 1 : (pos[1] == "top" || pos[1] == "left") * 2];
		var dx = 0, dy = 0, out = this.path(fill(shapes[pos[0]], mask))
				.insertBefore(set);
		switch (pos[0]) {
		case "top":
			dx = X - (x + r + mask.left + gap);
			dy = Y - (y + r + h + r + gap);
			break;
		case "bottom":
			dx = X - (x + r + mask.left + gap);
			dy = Y - (y - gap);
			break;
		case "left":
			dx = X - (x + r + w + r + gap);
			dy = Y - (y + r + mask.top + gap);
			break;
		case "right":
			dx = X - (x - gap);
			dy = Y - (y + r + mask.top + gap);
			break;
		}
		out.translate(dx, dy);
		if (ret) {
			ret = out.attr("path");
			out.remove();
			return {
				path : ret,
				dx : dx,
				dy : dy
			};
		}
		set.translate(dx, dy);
		return out;
	};
	
}

function checkSizes() {
	var node = dojo.byId(graphDivId);
	var canvasPostion = dojo.position(node);
	leftWidth = canvasPostion.x;
	topWidth = canvasPostion.y;
}
function captureMousePosition2(e) {
	mouseX = 0;
	mouseY = 0;
	if (!e)
		var e = window.event;
	if (e.pageX || e.pageY) {
		mouseX = e.pageX;
		mouseY = e.pageY;
	} else if (e.clientX || e.clientY) {
		mouseX = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
		mouseY = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
	}
	realMouseX = mouseX;
	realMouseY = mouseY;
	checkSizes();
	mouseY -= topWidth;
	mouseY -= scrollTop();
	var up = false, down = false;
	var left = false, right = false;
	mxpts.shift();
	mypts.shift();
	mxpts[2] = mouseX;
	mypts[2] = mouseY;

	if ((mxpts[0] > mxpts[1]) && (mxpts[1] > mxpts[2]))
		left = true;
	if ((mxpts[0] < mxpts[1]) && (mxpts[1] < mxpts[2]))
		right = true;
	if ((mypts[0] > mypts[1]) && (mypts[1] > mypts[2]))
		up = true;
	if ((mypts[0] < mypts[1]) && (mypts[1] < mypts[2]))
		down = true;
}
