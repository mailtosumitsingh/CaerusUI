var ptSelector = false;
var pullupmode = false;
var clonemode = false;
var currShapeFacet = null;
var currShapeConnector = null;
var bndryMoveMode=true;
var moveShapeMode = false;
var controlMode = false;
var defaultScaleX = .5;
var defaultScaleY = .5;

/*
 * pull up is implemented by drawing a shape with a facet
 * then when we pull up that facet we create a facet clone at dx
 * and then add n facets more where n is number of segments
 * then add pooints to that facet based on the original segments from increasing x then reverse virtual points!
 * the id of virtual points are created by id as original id + v_
 */


function bringShapeConnFront(sid,fid,cid){
	selectFacetConnector(fid,cid);
	if(shapeElementsDrawn[sid+fid+cid]!=null){
	shapeElementsDrawn[sid+fid+cid].toFront();
	shapeElementsDrawn[sid+fid+cid].attr("fill","white");
	}
	if(shapeElementsDrawn[sid+fid+cid+"bndry"]!=null){
	var ar = shapeElementsDrawn[sid+fid+cid+"bndry"];
	for(var i=0;i<ar.length;i++){
		var a = ar[i];
		a.toFront();
		a.attr("stroke","black");
	}
	}
}

function saveShape(){
	removeNodeById(globalShape.id);
	addObjectToGraph(globalShape);
}
function selectShape(id){
	if(id==null)id=prompt("Enter id");
	 gs = findNodeById(id);
	Object.setPrototypeOf(gs, Shape.prototype)
	globalShape = gs;
	currShapeConnector=null;
	currShapeFacet = null;
}
function newShape(id){
	if(id==null)id=prompt("Enter id");
	globalShape = new Shape(id);
}

function createFacet(id){
	if(id==null)id=prompt("Enter id");
	var f = globalShape.createFacet(id);
	selectShapeFacet(id);
	return id;
}
function createCurrFacetSelector(id){
	if(id==null)id=prompt("Enter id");
	if(currShapeFacet!=null){
		var c = currShapeFacet.createConnector(id);
		var cc = selectShapeConnector(id);
		return cc;
	}
}
function createConnector(fid,id){
	var f = 	selectShapeFacet(fid);
	if(f!=null){
		var c = f.createConnector(id);
		var cc = selectShapeConnector(id);
		return cc;
	}
}
function pullupOn(){
	pullupmode=true;
}
function pullupOff(){
	pullupmode=false;
}
function clonemodeOn(){
	clonemode =true;
}
function clonemodeOff(){
	clonemode =false;
}

function pointSelectorOn(){
	ptSelector = true;
}
function pointSelectorOff(){
	ptSelector = false;
}
function selectShapeFacet(id){
	for ( var i = 0; i < globalShape.facets.length; i++) {
	var o = globalShape.facets[i];
	if(o.id==id){
		currShapeFacet = o;
	}
	}
}
function selectShapeConnector(id){
	for ( var i = 0; i < currShapeFacet .connectors.length; i++) {
	var o = currShapeFacet .connectors[i];
	if(o.id==id){
		currShapeConnector = o;
	}
	}
}
function selectFacetConnector(fid,cid){
	selectShapeFacet(fid);
	selectShapeConnector(cid);
	
}
var ShapePointDragger = function() {
	this.ox = this.attr("cx") ;
	this.oy = this.attr("cy") ;
	this.animate({
		"fill-opacity" : .2
	}, 50);
}, ShapePointMove = function(dx, dy) {
	if(ptSelector==true ||controlMode==true){
		return;
	}
		var att = {
		cx : mouseX ,
		cy : mouseY 
};
	this.attr(att);
	var myid = this.node.getAttribute("eleid");
	var mysid = this.node.getAttribute("shapeid");

	if (myid != null) {
		var gs = findNodeById(mysid);
		Object.setPrototypeOf(gs, Shape.prototype)
		if(gs!=null){
		var node = gs.getPoint(myid);
		if(node!=null){
			gs.updatePoint(myid,att.cx,att.cy,node.z);
		}
		}
	}
}, ShapePointUp = function() {
	if(ptSelector==true){
		if(currShapeConnector!=null){
			var ptStr = this.node.getAttribute("eleid");
			var mysid = this.node.getAttribute("shapeid");
			console.log("adding point to current connector: "+ptStr)
			Object.setPrototypeOf(currShapeConnector, Connector.prototype)
			currShapeConnector.addPoint(ptStr);
		}
	}else if(controlMode==true){
		var eleid = this.node.getAttribute("eleid");
		var mysid = this.node.getAttribute("shapeid");
		var gs = findNodeById(mysid);
		Object.setPrototypeOf(gs, Shape.prototype)
		if(gs!=null){
			var node = gs.getPoint(eleid);
			Object.setPrototypeOf(node, Point.prototype)
			var node2 = globalShape.getPoint(eleid);
			if(node2!=null)
			Object.setPrototypeOf(node2, Point.prototype)
			if(node!=null){
				if(isControlPoint(node)){
					node.convertToPosition();
					if(node2!=null)
					node2.convertToPosition();
					
				}else{
					node.convertToControl();
					if(node2!=null)
					node2.convertToControl();
				}
			}
		}
	}else{
		draw();
	}
	
};

function beginShapePoints(notusedid){
	var a = dojo.byId("graph");
	//console.log(a);
	a.onmousedown = function (e){
	var mxx = 0;
	var myy = 0;
	    if (!e)
			var e = window.event;
		if (e.pageX || e.pageY) {
			mxx = e.pageX;
			myy = e.pageY;
		} else if (e.clientX || e.clientY) {
			mxx = e.clientX + document.body.scrollLeft
					+ document.documentElement.scrollLeft;
			myy = e.clientY + document.body.scrollTop
					+ document.documentElement.scrollTop;
		}
	var hgt = 10;
	c = pCanvas.circle(mxx,myy-topWidth,hgt);
	c.attr("fill","orange");
	var p = new Point(mxx,myy-topWidth);
	if(currShapeConnector!=null)
		p.id = globalShape.id+"_"+currShapeConnector.id+"_"+p.id
		else{
			p.id = globalShape.id+"_"+getUniqId()+"_"+p.id
		}
	c.node.setAttribute("eleid",p.id);
	globalShape.addPoint(p);
	c.drag(ShapePointMove,ShapePointDragger,ShapePointUp);
	if(currShapeConnector!=null){
		currShapeConnector.addPoint(p.id);
	}
	}
}
function stopShapePoints(){
	var a = dojo.byId("graph");
	a.onmousedown = function (e){}
	saveShape();
	draw();
}
function createDefaultFacet(fid,cid){
	globalShape.createFacet(fid).createConnector(cid);
	selectFacetConnector(fid,cid);
}
function createFacetShapeId(sid,fid,cid){
	var gs = findNodeById(sid);
	Object.setPrototypeOf(gs, Shape.prototype);
	gs.createFacet(fid).createConnector(cid);
}
function createConnectorShapeId(sid,fid,cid){
	var gs = findNodeById(sid);
	Object.setPrototypeOf(gs, Shape.prototype);
	var f = gs.getFacet(fid);
	Object.setPrototypeOf(f, Facet.prototype);
	f.createConnector(cid);
}
function createTopFacet(){
	createDefaultFacet("top", "1");	
}
function createBottomFacet(){
	createDefaultFacet("bottom", "1");	
}
function createFrontFacet(){
	createDefaultFacet("front", "1");	
}
function createBackFacet(){
	createDefaultFacet("back", "1");	
}
function createLeftFacet(){
	createDefaultFacet("left", "1");	
}
function createRightFacet(){
	createDefaultFacet("right", "1");	
}

var FacetDragger = function() {
	this.odx = 0;
	this.ody = 0;
	this.animate({
		"fill-opacity" : .2
	}, 50);
}, FacetMove = function(dx, dy) {
	this.translate(dx - this.odx, dy - this.ody);
	this.odx = dx;
	this.ody = dy;
	console.log("moved: "+this.odx+" , "+this.ody);
	var mysid = this.node.getAttribute("shapeid");
	var myid = this.node.getAttribute("facetid");
	if (myid != null) {
		var gs = findNodeById(mysid);
		Object.setPrototypeOf(gs, Shape.prototype)
		if(gs!=null){
		 //gs.moveFacet(myid,this.odx,this.ody,0);
		}
	}
}, FacetUp = function() {
	if(this.odx==0 && this.ody==0)return;
	 this.animate({"fill-opacity": 1}, 10);
	 var mysid = this.node.getAttribute("shapeid");
	 var myid = this.node.getAttribute("facetid");
		if (myid != null) {
			var gs = findNodeById(mysid);
			Object.setPrototypeOf(gs, Shape.prototype)
			if(gs!=null){
			if(clonemode==true){
				gs.cloneFacet(myid,this.odx,this.ody,0);
			}else if(pullupmode ==true){
				gs.pullUpFacet(myid,this.odx,this.ody,0);
			}else{
				if(moveShapeMode==false){
				gs.moveFacet(myid,this.odx,this.ody,0);
				}else{
				gs.moveAllPoints(myid,this.odx,this.ody,0);
				}
			}
			}
		}
		draw();
};

var BndryDragger = function() {
	this.odx = 0;
	this.ody = 0;
	this.animate({
		"fill-opacity" : .2
	}, 50);
}, BndryMove = function(dx, dy) {
	if(!bndryMoveMode)return;
	this.translate(dx - this.odx, dy - this.ody);
	this.odx = dx;
	this.ody = dy;
	console.log("moved: "+this.odx+" , "+this.ody);
	var mysid = this.node.getAttribute("shapeid");
	var myid = this.node.getAttribute("facetid");
	if (myid != null) {
		var gs = findNodeById(mysid);
		Object.setPrototypeOf(gs, Shape.prototype)
		if(gs!=null){
		 //gs.moveFacet(myid,this.odx,this.ody,0);
		}
	}
}, BndryUp = function() {
	if(bndryMoveMode){
	if(this.odx==0 && this.ody==0) return;
	 this.animate({"fill-opacity": 1}, 50);
	 var mysid = this.node.getAttribute("shapeid");
	 var myid = this.node.getAttribute("facetid");
 	var afterid = this.node.getAttribute("se");
	var beforeid = this.node.getAttribute("ee");
	 if (myid != null) {
			var gs = findNodeById(mysid);
			Object.setPrototypeOf(gs, Shape.prototype)
			if(gs!=null){
				gs.movePoints([afterid,beforeid],this.odx,this.ody,0);
			}
		}
		draw();
	}else{
        var x = mouseX, y = mouseY;
	       var c = pCanvas.circle(x,y,3);
	    	// now add point to path
	    	var myid = this.node.getAttribute("facetid");
	    	var mysid = this.node.getAttribute("shapeid");
	    	var afterid = this.node.getAttribute("se");
	    	var beforeid = this.node.getAttribute("ee");
	    	if (myid != null) {
	    		var gs = findNodeById(mysid);
	    		Object.setPrototypeOf(gs, Shape.prototype)
	    		if(gs!=null){
                 if(afterid!=null && beforeid!=null){
			    	var p = new Point(x,y);
			    	c.node.setAttribute("eleid",p.id);
			    	gs.addPointToFacet(myid,afterid,beforeid,p);
                 }
	    		}
	    	}
	    	draw();

	}
};
function rotateShape(sid,angle){
	for(var i=0;i<pData.data.length;i++){
	    var d = pData.data[i];
	    if (  d.type=="ShapeShape"  && d.id==sid){
	        var so = d;//found a shape object;
	        var mx = 0,my = 0 , mz = 0;
	        for(var k = 0; k < so.pts.length ; k++){
	           var pt = so.pts[k];
	            mx += pt.x;
	            my += pt.y;
	        }
	        mx = mx / so.pts.length;
	        my = my / so.pts.length;
	        for(var k = 0; k < so.pts.length ; k++){
	           var pt = so.pts[k];
	            var c = shapeElementsDrawn["pt_"+pt.id]
	            if(c!=null){
	                console.log(pt.id)
	                var tt = "rotate("+angle+" "+mx+","+my +")";
	                console.log(tt)
	            c.node.setAttribute("transform",tt);
	            console.log(c.node.getBoundingClientRect());
	            console.log(dojo.toJson(pt))
	            var br = c.node.getBoundingClientRect();
	            pt.x = br.x+br.width/2;
	            pt.y = br.y+br.height/2;
	            pt.y -= topWidth;
		        pt.y -= scrollTop();
	            console.log(dojo.toJson(pt))
	            var cc = pCanvas.circle(pt.x,pt.y,5);
	            cc.attr("fill","red")
	            
	            }
	        }	
	        
	        
	    }
	}
	}
/////////////////renderer///////////////////////
var renderDesignMode = true;
var shapeElementsDrawn={};

class BaseShapeRenderer{
	constructor(id)
	{
		this.id = id;
	}
	renderPoint(pt){
		
   }
   renderShape(shape){
	   console.log("BaseShapeRenderer renderShape: "+shape.id);
	}
	renderFacet(shape,facet){
		   console.log("BaseShapeRenderer renderFacet: "+shape.id);
	}
	renderConnector(shape,facet,connector){
		   console.log("BaseShapeRenderer renderConnector: "+shape.id);
	}
}

class DefaultShapeRenderer extends BaseShapeRenderer{
	constructor()
	{
		super("DefaultShapeRenderer");
	}
	renderPoint(shape,obj){
		if(renderDesignMode){
		var c = pCanvas.circle(obj.x,obj.y,7);
		if(obj.pointType=="Control")
			c.attr("fill","red");
		else
			c.attr("fill","orange");
		c.node.setAttribute("eleid",obj.id);
		c.node.setAttribute("shapeid",shape.id);
		c.drag(ShapePointMove,ShapePointDragger,ShapePointUp);
		shapeElementsDrawn["pt_"+obj.id] = c;
	//	var tt = pCanvas.text(obj.x,obj.y,obj.id);
		return c;
		}else{
		return null
		}
	}
	renderShape(shape){
		if(shape.visible==false)return;
		for(var i=0;i<shape.facets.length;i++){
			var obj = shape.facets[i];
			this.renderFacet(shape,obj);
		}
		for(var i=0;i<shape.pts.length;i++){
			var c = this.renderPoint(shape,shape.pts[i]);
			if(c!=null)
			c.toFront();
		}
	}
	renderFacet(shape,facet){
		for(var i=0;i<facet.connectors.length;i++){
			var obj = facet.connectors[i];
			this.renderConnector(shape,facet,obj);
		}
	}
	renderConnector(shape,facet,connector){
			Object.setPrototypeOf(shape, Shape.prototype)
			var m = shape.getPointMap();
			// create point array
		    var arr = new Array();
		    if(connector.pts.length<1)return;
		    for(var i=0;i<connector.pts.length;i++){
		    	var pt = m[connector.pts[i]];
		    	arr.push(pt);
		    	if(i==0){
		    		if(renderDesignMode)
		    		var c = pCanvas.circle(pt.x,pt.y,13);
		    		
		    	}
		    	if(i==connector.pts.length-1){
		    		if(renderDesignMode){
		    		var c = pCanvas.circle(pt.x,pt.y,11);
		    		var c = pCanvas.circle(pt.x,pt.y,13);
		    		}
		    	}
		    }
		   
		    // getPathFromPointsArray
		    var path = getPathFromPointsArrayEx(arr);
		    // close
		    path =  path + "  Z ";
		    var pp = pCanvas.path(path);
		    var clr = Raphael.getColor();
		    if(renderDesignMode)
		    pp.attr("stroke",clr);
		    pp.attr("fill","90-#00c6ff-#0072ff")
		    pp.attr("opacity",.5);
		    pp.node.setAttribute("shapeid",shape.id);
		    pp.node.setAttribute("facetid",facet.id);
			pp.drag(FacetMove,FacetDragger,FacetUp);
			shapeElementsDrawn[shape.id+facet.id+connector.id]=pp;
			shapeElementsDrawn[shape.id+facet.id+connector.id+"bndry"]=new Array();
			
			if(renderDesignMode){
			for(var i=0;i<arr.length;i++){
				var ar2 = new Array();
				if(i<arr.length-1){
					ar2.push(arr[i]);
					ar2.push(arr[i+1]);
					var bndry = pCanvas.path(getLineFromPointsArrayEx(ar2));
				    var clr = "blue";
				    bndry.attr("stroke",clr);
				    bndry.attr("stroke-width",4);
				    bndry.node.setAttribute("shapeid",shape.id);
				    bndry.node.setAttribute("facetid",facet.id);
				    bndry.node.setAttribute("se",ar2[0].id);
				    bndry.node.setAttribute("ee",ar2[1].id);
				    bndry.drag(BndryMove,BndryDragger,BndryUp);
				    shapeElementsDrawn[shape.id+facet.id+connector.id+"bndry"].push(bndry);

				}else{
					ar2.push(arr[i]);
					ar2.push(arr[0]);
					var bndry = pCanvas.path(getLineFromPointsArrayEx(ar2));
				    var clr = "blue";
				    bndry.attr("stroke",clr);
				    bndry.attr("stroke-width",2);
				    bndry.node.setAttribute("shapeid",shape.id);
				    bndry.node.setAttribute("facetid",facet.id);
				    bndry.node.setAttribute("se",ar2[0].id);
				    bndry.node.setAttribute("ee",ar2[1].id);
				    bndry.drag(BndryMove,BndryDragger,BndryUp);
				    shapeElementsDrawn[shape.id+facet.id+connector.id+"bndry"].push(bndry);
				}
			}
			}
	}
}



var currShapeRenderer = new DefaultShapeRenderer();