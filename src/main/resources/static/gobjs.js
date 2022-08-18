var pData = {};
var undoGraph = new Array();
var redoGraph = new Array();
var objects = [];
var p = [];
var connectors = [];
pData.data=new Array();
class Point{
	constructor(x,y,z)
	{
		this.x= x;
		this.y = y;
		if(z==null)
			this.z=0;
		else
			this.z=z;
		this.id =getUniqId();
		this.pointType="Position";//Control
		this.type="ShapePoint";
	}
	static clonePoint(pt){
		var ret = new Point(pt.x,pt.y);
		ret.z = pt.z;
		ret.pointType = pt.pointType;
		ret.type = pt.type;
		ret.id = pt.id+"_v";
		return ret;
	}
	convertToPosition(){
		this.pointType = "Position";
	}
	convertToControl(){
		this.pointType = "Control";
	}
} 
class Connector{
   constructor(id)
   {
		this.id=id;
		this.pts = new Array();
		//StraightLine,Bezier,Quadratic,Arc,Manhattan,
		//StraightLineClose,BezierClose,QuadraticClose,ArcClose,ManhattanClose
		this.connectortype="StraightLineClose";
		this.type="ShapeConnector"
		this.opacity=.7;
		this.fill="90-#00c6ff-#0072ff"
	    this.stroke="black";
		this.visible = true;
	
   }
   static cloneConnector(c){
	   var cc = new Connector(c.id+"_v");
	   for(var i=0;i<c.pts.length;i++){
		   cc.addPoint(c.pts[i]+"_v");
	   }
	   return cc;
   }
	addPoint(ptid){
		var exists  = false;
		for ( var i = 0; i < this.pts.length; i++) {
			var obj = this.pts[i];
			if(obj.id==ptid)
				exists = true;
		}
		if(exists == false ){
			this.pts.push(ptid);
		}else{
			//if last pt == first pt!
			if(pts[0].id==ptid){
				this.pts.push(ptid);
			}
		}
	}
	addPoints(arr){
		for ( var i = 0; i < arr.length; i++) {
			var obj = arr[i];
			this.pts.push(obj);
		}
	}
	getPoints(){
		return this.pts;
	}
	addPointAfter(previd,prev2id,ptid){
	var pts2 = new Array();
	var f1 = false;
	var f2 = false;
	for ( var i = 0; i < this.pts.length; i++) {
		var obj = this.pts[i];
		if(obj==previd){
			f1 =true;
		}
		if(obj==prev2id){
			f2 =true;
		}
	}
	if(f1==false || f2 ==false) return; //only add if on same connector
		for ( var i = 0; i < this.pts.length; i++) {
			var obj = this.pts[i];
			if(obj==previd){
				if(i==this.pts.length-1){//reached last add after since we are doing point parts now!
					pts2.push(obj);
					pts2.push(ptid);
				}else{//not last
					if(this.pts[i+1]==prev2id){
						pts2.push(obj);
						pts2.push(ptid);
					}else{
						pts2.push(ptid);
						pts2.push(obj);
					}
				}
			}else{
				pts2.push(obj);
			}
		}
		this.pts = pts2;
	}
}
class Facet{
    constructor(id)
	{
		this.id=id;
	    this.connectors = new Array();
	    this.type="ShapeFacet";
		this.opacity=.7;
		this.fill="0xff0000"
	    this.stroke="black";
		this.visible = true;
	}
    addConnector(conn){
    	this.connectors.push(conn);
    }
    deleteConnector(id){
		return removeItemFromArrayById(this.connectors,id);
		
	}
	createConnector(id){
		var c = new Connector(id);
		this.connectors.push(c);
		return c;
	}
	getPoints(){
		var ar = new Array();
		for(var i=0;i<this.connectors.length;i++){
			var c = this.connectors[i];
			Object.setPrototypeOf(c, Connector.prototype)
			var ar2  = c.getPoints();
			for(var j=0;j<ar2.length;j++){
				ar.push(ar2[j]);
			}
		}
		return ar;
	}
	addPointAfter(previd,prev2id,pid){
		for(var i=0;i<this.connectors.length;i++){
			var c = this.connectors[i];
			Object.setPrototypeOf(c, Connector.prototype)

			c.addPointAfter(previd,prev2id,pid);
		}
	}
	getConnector(id){
		for(var i=0;i<this.connectors.length;i++){
			var c = this.connectors[i];
			if(c.id==id)
				return c;
		}
		return null;
	}
}
class Shape{
	constructor(id)
	{
		this.id= id;
		this.pts = new Array();
		this.facets = new Array();
		this.type="ShapeShape"
		this.visible=true;
		this.compName="arbit"
		this.data={};
		this.shapeType="simple";//2d extruded
	}
	addPointToFacet(fid,prev,prev2,p){
		this.addPoint(p);
		var addtovolume = true;
		if(addtovolume){
			for(var i=0;i<this.facets.length;i++){
				var f = this.facets[i];
				Object.setPrototypeOf(f, Facet.prototype)
				f.addPointAfter(prev,prev2,p.id);
			}
		}else{
		var f = this.getFacet(fid);
		Object.setPrototypeOf(f, Facet.prototype)
		f.addPointAfter(prev,prev2,p.id);
		}
	}
	addPoint(p){
		this.pts.push(p);
	}
	addFacet(f){
		this.facets.push(f);
	}
	deleteFacet(id){
		return removeItemFromArrayById(this.facets,id);
		
	}
	deleteFacetEx(id){
		var fct = this.getFacet(id);
		Object.setPrototypeOf(fct, Facet.prototype)
		var ptstemp = fct.getPoints();
		removeItemFromArrayById(this.facets,id);
		var pts2 = new Array();
		
		for(var i=0;i<this.pts.length;i++){
			var id  = this.pts[i].id;
			var found = false;
			for(var j=0;j<ptstemp.length;j++){
				if(ptstemp[j]==id){
					found =true;
					break;
				}
			}
			if(!found)
			pts2.push(this.pts[i]);
		}
		this.pts =pts2;
	}
	createFacet(id){
		var f = new Facet(id);
		this.facets.push(f);
		return f;
	}
	movePoints(arr,dx,dy,dz){
		var m  = this.getPointMap();
		for ( var i = 0; i < arr.length; i++) {
			var point = m[arr[i]];
			if(point!=null){
				point.x = point.x+dx;
				point.y = point.y+dy;
				point.z = point.z+dz;
			}
		}
	}
	moveFacet(fid,dx,dy,dz){
		var m  = this.getPointMap();
		for ( var i = 0; i < this.facets.length; i++) {
			var f = this.facets[i];
			if(f.id==fid){
			for(var j=0;j<f.connectors.length;j++){
				var c = f.connectors[j];
				for(var k=0;k<c.pts.length;k++){
					var pt = c.pts[k];
					var point = m[pt];
					if(point!=null){
						point.x = point.x+dx;
						point.y = point.y+dy;
						point.z = point.z+dz;
					}
				}
			}
		}
		}
	}
	moveAllPoints(myid,dx,dy,dz){
		for ( var i = 0; i < this.pts.length; i++) {
			var point = this.pts[i];
			if(point!=null){
				point.x = point.x+dx;
				point.y = point.y+dy;
				point.z = point.z+dz;
			}
		}
		
	}
	cloneFacet(fid,dx,dy,dz){
		var cf = null;
		var m  = this.getPointMap();
		for ( var i = 0; i < this.facets.length; i++) {
			var f = this.facets[i];
			if(f.id==fid){
				cf = this.createFacet(f.id+"_"+getUniqId()+"_v");
				Object.setPrototypeOf(f, Facet.prototype)
				var ptoc = f.getPoints();
				for(var j=0;j<ptoc.length;j++){
					var ptt = m[ptoc[j]];
					var ptt2 = Point.clonePoint(ptt);
					ptt2.x=ptt2.x+dx;
					ptt2.y=ptt2.y+dy;
					ptt2.z=ptt2.z+dz;
					this.addPoint(ptt2);
				}
				for (var j=0;j<f.connectors.length;j++){
					var c = f.connectors[j];
					Object.setPrototypeOf(c, Connector.prototype)
					var cc = Connector.cloneConnector(c);
					cf.addConnector(cc);
				}
			}
		}
		return cf;
	}
	pullUpFacet(fid,dx,dy,dz){
		var cf = this.cloneFacet(fid,dx,dy,dz);
		var ptmap = this.getPointMap();
		for(var i=0;i<cf.connectors.length;i++){
			var c  = cf.connectors[i];
			var arr = c.getPoints();
			for(var j=0;j<arr.length;){ 
				var ar2 = new Array();
				if(j<arr.length-1){
					var found = false;
					ar2.push(arr[j]);
					while(found==false && j <arr.length-1){
					j++;
					ar2.push(arr[j]);
					found = isControlPoint(ptmap[arr[j]])==false?true:false;
					}
				}else{
					ar2.push(arr[j]);
					ar2.push(arr[0]);
					j++
					}
			
			var cf2 = this.createFacet(getUniqId());
			var c = cf2.createConnector(cf2.id+"_"+getUniqId());
			var ar3 = new Array();
			for(var k=0;k<ar2.length;k++){
				var a1 = ar2[k].substring(0,ar2[k].length-2);
				ar3.push(a1);
				//var cir = pCanvas.circle(ptmap[a1].x,ptmap[a1].y,3);
				//cir.attr("fill","purple");	
			}
			for(var k=ar2.length-1;k>=0;k--){
				ar3.push(ar2[k]);	
				//var cir = pCanvas.circle(ptmap[ar2[k]].x,ptmap[ar2[k]].y,3);
				//cir.attr("fill","pink");	

			}
			c.addPoints(ar3);

			

		}
		}
	}
	pullUpFacetOld(fid,dx,dy,dz){
		var cf = this.cloneFacet(fid,dx,dy,dz);
		for(var i=0;i<cf.connectors.length;i++){
			var c  = cf.connectors[i];
			var arr = c.getPoints();
			for(var j=0;j<arr.length;j++){
				var ar2 = new Array();
				if(j<arr.length-1){
					ar2.push(arr[j]);
					ar2.push(arr[j+1]);
				}else{
					ar2.push(arr[j]);
					ar2.push(arr[0]);
					}
			
			var cf2 = this.createFacet(getUniqId());
			var c = cf2.createConnector(cf2.id+"_"+getUniqId());
			var a1 = ar2[0].substring(0,ar2[0].length-2);
			var a2 = ar2[1].substring(0,ar2[1].length-2);
			c.addPoints([a1,a2,ar2[1],ar2[0]]);
		}
		}
	}
	updatePoint(id,newx,newy,newz){
		for ( var i = 0; i < this.pts.length; i++) {
			var obj = this.pts[i];
			if(obj.id==id){
				obj.x=newx;
				obj.y=newy;
				obj.z=newz;
			}
		}
	}
	getPointMap(){
		var m = {};
		for ( var i = 0; i < this.pts.length; i++) {
			var obj = this.pts[i];
			m[obj.id] = obj;
		}
		return m;
	}
	getPoint(id){
		for ( var i = 0; i < this.pts.length; i++) {
			var obj = this.pts[i];
			if(obj.id==id)return obj;
		}
		return null;
	}
	getFacet(id){
		for(var i=0;i<this.facets.length;i++){
			if(this.facets[i].id==id){
				return this.facets[i];
			}
		}
		return null;
	}
	getFacetPoints(id){
		var ret = new Array();
		var pm = this.getPointMap();
		for(var i=0;i<this.facets.length;i++){
			if(this.facets[i].id==id){
				Object.setPrototypeOf(this.facets[i], Facet.prototype)
				var points= this.facets[i].getPoints();
				for(var j=0;j<points.length;j++){
					var ptt = points[j];
					if(pm[ptt]!=null){
						ret.push(pm[ptt]);
					}
				}
			}
		}
		return ret;
	}
}
function isControlPoint(pt){
	if(pt.pointType=="Control"||pt.pointType=="control"){
		return true;
	}
	return false;
}

function createNodeEle(id,type, x, y,w,h,name,icon) {
	var newNode = {};
	newNode["type"] = type;
	newNode["id"] = id;
	newNode["x"] = x;
	newNode["y"] = y;
	newNode["r"] = w;
	newNode["b"] = h;
	newNode["name"] = name;
	newNode["icon"] = icon;
	newNode["c"/* childs */]=new Array();
	return newNode
}

function removeObjectFromGraph(i, j,noundo) {
	if(noundo==null ||noundo==false)
	undoGraph.push(dojo.toJson(pData.data));
	pData.data.splice(i, j);

}
function addObjectToGraph(obj) {
	lastAdded = obj;
	undoGraph.push(dojo.toJson(pData.data));
	pData.data.push(obj);
}
function addObjectToGraphNoUndo(obj) {
	// undoGraph.push(dojo.toJson(pData.data));
	pData.data.push(obj);
}
function removeObjectFromGraphNoUndo(i, j) {
	// undoGraph.push(dojo.toJson(pData.data));
	pData.data.splice(i, j);

}
function addShape(){
	lastShape = createShapeEle(getUniqId());
	addClickHandler();
}

function stopShape(){
	addObjectToGraph(lastShape);
	lastShape = null;
	removeClickHandler();
}
function createShapeEle() {
	var id  = getUniqId();
	return createNodeEle(id,"shape", 0,0,0,0,id,"") 
}
function createPointEle(x,y) {
	var id  = getUniqId();
	node =  createNodeEle(id,"point", x,y,0,0,id,"") 
	node.pointType="simple";
	return node;
}
function createControlPointEle(x,y) {
	var node  = createPointEle(x,y);
	node.pointType="control";
	return node;
}
function getShapePoint(shapeid,id){
	var nd = findNodeById(shapeid);
	return getPointFromShape(nd,id)
}
function getPointFromShape(nd,id){
	for(var i=0;i<nd["c"].length;i++){
		var node = nd["c"][i];
		if(node.id==id){
			return node;
		}
		}
	return null;
}
function findNodeById(id) {
	var nodeRequired = null;
	for ( var i = 0; i < pData.data.length; i++) {
			var obj = pData.data[i];
			if (obj.id == id)nodeRequired = obj;
	}
	return nodeRequired;
}
function removeNodeById(id,noundo) {
	var nodeRequired = null;
	for ( var i = 0; i < pData.data.length; i++) {
		// if(pData.data[i].type != 'connection')
		{
			var obj = pData.data[i];
			if (obj.id == id) {
				removeObjectFromGraph(i, 1,noundo);
				return obj;
			}
		}
	}
	return nodeRequired;
}


function getPointFromGraph(id){
    var c = pData.data[0].pts;
    for(var i=0;i<c.length;i++){
        if(c[i].id==id){
        return c[i];
        }
    }
    return null;
}

function hideShape(sid){
	var sh = findNodeById(sid);
		if(sh.visible==false)
			sh.visible=true;
		else
			sh.visible=false;
}
function deleteShapeFacet(sid,fid){
	console.log(sid+"->>"+fid);
	var sh = findNodeById(sid);
	Object.setPrototypeOf(sh, Shape.prototype)
	sh.deleteFacet(fid);
}
function deleteShapeFacetEx(sid,fid){
	console.log(sid+"->>"+fid);
	var sh = findNodeById(sid);
	Object.setPrototypeOf(sh, Shape.prototype)
	sh.deleteFacetEx(fid);
}

function getShapeConn(sid,fid,cid){
	console.log(sid+"->"+fid+"->"+cid);
	var sh = findNodeById(sid);
	Object.setPrototypeOf(sh, Shape.prototype)
	var f = sh.getFacet(fid);
	Object.setPrototypeOf(f, Facet.prototype)
	var c = f.getConnector(cid);
	Object.setPrototypeOf(c, Connector.prototype)
	return c;
}
function logFacets(){
	for ( var i = 0; i < globalShape.facets.length; i++) {
		var obj  = facets[i];
		console.log("Facet: "+obj.id);
	}		
}
function logConnectors(){
	for ( var i = 0; i < globalShape.facets.length; i++) {
		var obj  = facets[i];
		for ( var j = 0; j < obj.connectors.length; j++) {
		console.log("Facet: "+obj.id+" > "+obj.connectors[j].id);
		}
	}		
}
function deleteShape(id){
	if(id==null)id=prompt("Enter id");
	removeNodeById(id);
}

	function scaleShape(sid,skewx,skewy){
		console.log("Skew: "+skewx+","+skewy)
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
		           pt.x = pt.x - mx;
		           pt.y = pt.y - my;
		           pt.x *=skewx;
		           pt.y *=skewy;
		           pt.x +=mx;
		           pt.y +=my;
		           
		        }
		        
		        
		    }
		}
	}
	
	