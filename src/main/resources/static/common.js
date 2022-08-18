function getShapeFromPointsArrayEx(pts) {
	var pstr = "";
	var started = false;
	var isQuadCurve = false;
	var isCubicCurve = false;
	var shape = "var shape = new THREE.Shape();"+"\n";
	for (var i = 0; i < pts.length; i++) {
		var pt = pts[i];
		var ox = pt.x;
		var oy = pt.y;
		if (!started) {
			pstr += "M " + floatVal(ox) + " " + floatVal(oy) + " ";
			shape +="shape.moveTo( "+floatVal(ox) + " , " + floatVal(oy) +");"+"\n";
			started = true;
		} else {
			if(isControlPoint(pts[i])){
				if(pts.length-i>1){
					if(isControlPoint(pts[i+1])){
						//bezier curve
						if(isCubicCurve||isQuadCurve){
							pstr += " " +floatVal( ox) + " " + floatVal( oy ) + " ";
							shape+=", " + floatVal( ox ) + " , " + floatVal( oy )+" ";
						}else{
							pstr += "C " + floatVal( ox )+ " " + floatVal( oy )+ " ";
							shape +="shape.bezierCurveTo( "+ floatVal( ox )+ " , " + floatVal( oy )+ " ";
						}
						isCubicCurve = true;	
					}else{
						if(isCubicCurve || isQuadCurve){
							pstr += "  " + floatVal( ox )+ " " + floatVal( oy )+ " ";
							shape +=" , " + floatVal( ox ) + " , " + floatVal( oy )+" ";
						}else{
							//quadtratic curve	
							pstr += "Q " + floatVal( ox )+ " " + floatVal( oy )+ " ";
							shape +="shape.quadraticCurveTo( "+ floatVal( ox )+ " , " + floatVal( oy )+ " ";
							isQuadCurve = true;
						}
					}
				}else {
						if(isQuadCurve||isCubicCurve){
							pstr += "  " + floatVal( ox )+ " " + floatVal( oy );
							pstr += "  " + floatVal( pts[0].x )+ " " + floatVal( pts[0].y );
							shape  += " " + floatVal( ox ) + " , " + floatVal( oy );
							shape += " " + floatVal( pts[0].x )+ " , " + floatVal( pts[0].y );
							shape +=");\n";
						}else{
							pstr += " Q " + floatVal( ox ) + " " + floatVal( oy );
							pstr += "  " + floatVal( pts[0].x )+ " " + floatVal( pts[0].y );
							shape +="shape.quadraticCurveTo( "+ floatVal( ox )+ " , " + floatVal( oy )+ " ";
							shape += "  " + floatVal( pts[0].x )+ " , " + floatVal( pts[0].y );
							shape +=");\n";

						}
				}
			}else {
				if(isQuadCurve||isCubicCurve){
					pstr += "  " + floatVal( ox ) + " " + floatVal( oy );
					shape+=" , " + floatVal( ox ) + " , " + floatVal( oy )+");\n";
					isQuadCurve = false;
					isCubicCurve = false;
				}else{
				pstr += " L " + floatVal( ox )+ " " + floatVal( oy );
				shape+="shape.lineTo("+floatVal( ox )+ " , " + floatVal( oy )+");\n";
				}
			}
		}
	}
	console.log("ex: "+pstr)
	console.log("shape: "+shape)
	return shape;
}
function floatVal(v){
	return parseFloat(v).toFixed(1);
}
//from here
function getLineFromPointsArrayEx(pts) {
	var ox = pts[0].x;
	var oy = pts[0].y;
	var ox2 = pts[1].x;
	var oy2 = pts[1].y;
	return  ("M " + floatVal(ox) + " " + floatVal(oy) + " L " + floatVal(ox2 )+ " " + floatVal(oy2) );
}

function getPathFromPointsArrayEx(pts) {
	var pstr = "";
	var started = false;
	var isQuadCurve = false;
	var isCubicCurve = false;
	for (var i = 0; i < pts.length; i++) {
		var pt = pts[i];
		var ox = pt.x;
		var oy = pt.y;
		if (!started) {
			pstr += "M " + floatVal(ox) + " " + floatVal(oy) + " ";
			started = true;
		} else {
			if(isControlPoint(pts[i])){
				if(pts.length-i>1){
					if(isControlPoint(pts[i+1])){
						//bezier curve
						if(isCubicCurve||isQuadCurve){
							pstr += " " +floatVal( ox) + " " + floatVal( oy ) + " ";
						}else{
							pstr += "C " + floatVal( ox )+ " " + floatVal( oy )+ " ";
						}
						isCubicCurve = true;	
					}else{
						if(isCubicCurve || isQuadCurve){
							pstr += "  " + floatVal( ox )+ " " + floatVal( oy )+ " ";
						}else{
							//quadtratic curve	
							pstr += "Q " + floatVal( ox )+ " " + floatVal( oy )+ " ";
							isQuadCurve = true;
						}
					}
				}else {
						if(isQuadCurve||isCubicCurve){
							pstr += "  " + floatVal( ox )+ " " + floatVal( oy );
							pstr += "  " + floatVal( pts[0].x )+ " " + floatVal( pts[0].y );
						}else{
							pstr += " Q " + floatVal( ox ) + " " + floatVal( oy );
							pstr += "  " + floatVal( pts[0].x )+ " " + floatVal( pts[0].y );
						}
				}
			}else {
				if(isQuadCurve||isCubicCurve){
					pstr += "  " + floatVal( ox ) + " " + floatVal( oy );
					isQuadCurve = false;
					isCubicCurve = false;
				}else{
				pstr += " L " + floatVal( ox )+ " " + floatVal( oy );
				}
			}
		}
	}
	console.log("ex: "+pstr)
	getShapeFromPointsArrayEx(pts);
	return pstr;
}
function floatVal(v){
	return parseFloat(v).toFixed(1);
}
function getUniqId() {
	var str = "Random_" + Math.ceil(Math.random() * 1000);
	var ret = findNodeById(str);
	var i = 0;
	while (ret != null) {
		str = str + "_" + i;
		ret = findNodeById(str);
		i++;
	}
	return str;

}

function distance(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var vdist = Math.sqrt(dx * dx + dy * dy);
	return vdist;
}
function dist(x1, y1, x2, y2) {
	return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function findnearItemCollWithSkip(x1, y1, coll,skipid) {
	var ldist = 10000;
	var pt = null;
	for (var i =0;i<coll.length;i++) {
		if(skipid!=null && coll[i].id==skipid)continue;
		var vdist = dist(coll[i].x,coll[i].y,x1,y1)
			if (vdist < ldist) {
				ldist = vdist;
				pt = {};
				pt.x = coll[i].x;
				pt.y = coll[i].y;
				pt.id = coll[i].id;
				pt.dist = ldist
		}
	}
	return pt;
}

function toDegrees (angle) {
	  return angle * (180 / Math.PI);
	}

function toRadians (angle) {
	  return angle * (Math.PI / 180);
	}
//////////////delete this
//printAngle(pData.data[0].facets[0].connectors[0].pts);
function getPointFromGraph(id){
    var c = pData.data[0].pts;
    for(var i=0;i<c.length;i++){
        if(c[i].id==id){
        return c[i];
        }
    }
    return null;
}

function printAngle(c){
	var pts = new Array();
	for(var i=0;i<c.length;i++){
	    var pid = c[i];
	    var pt = getPointFromGraph(pid);
	    if(pt!=null){
	    pts.push(pt);
	    }
	}
	var p1 = new jsts.geom.Coordinate(floatVal(pts[0].x),floatVal(pts[0].y))
	var p2 = new jsts.geom.Coordinate(floatVal(pts[1].x),floatVal(pts[1].y))
	var p3 = new jsts.geom.Coordinate(floatVal(pts[2].x),floatVal(pts[2].y))
	var p4 = new jsts.geom.Coordinate(floatVal(pts[3].x),floatVal(pts[3].y))
	var ls = new jsts.geom.LineSegment(p1,p2)
	var ls2 = new jsts.geom.LineSegment(p2,p3)
	var a1 = ls.angle()
	var a2 = ls2.angle()
	var d1 = toDegrees(a1);
	var d2 = toDegrees(a2);
	console.log(d1);
	// console.log(d2);
	}
////////////delete this
function cloneItem(a) {
	return JSON.parse(JSON.stringify(a));
}