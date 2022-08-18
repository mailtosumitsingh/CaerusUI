///Object.setPrototypeOf(this.facets[i], Facet.prototype)
var debugShapePoints=false;		
class ShapeRenderer{
	constructor()
	{
		this.name="ShapeHandlerManager";
		this.handlers = {};
	}
	static somemethod(pt){
		var ret = new Point(pt.x,pt.y);
		ret.z = pt.z;
		ret.pointType = pt.pointType;
		ret.type = pt.type;
		ret.id = pt.id+"_v";
		return ret;
	}
	addHandler(handler){
		for(var i=0;i<handler.getTargetType().length;i++){
			var ele = handler.getTargetType()[i];
		this.handlers[ele] = handler;
	}
	}
	doRender(shape){
		if(shape.shapeType==null){
			if(shape.type!=null){
				this.handlers[shape.type].handle(shape);
			}else{
				this.handlers["simple"].handle(shape);
			}
		}else
			this.handlers[shape.shapeType].handle(shape);
	}
}
class RenderHandler{
	handle(shape){
		//do nothing
	}
	getTargetType(){
		return ["unk"];
	}
}
class SimpleRenderHandler extends RenderHandler{
	constructor(){
		super();
		console.log("SimpleRenderHandler constructor.");
		this.loader = new THREE.TextureLoader();
		this.texture = this.loader.load( "/textures/UV_Grid_Sm.jpg" );
		this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
		this.texture.repeat.set( 0.008, 0.008 );
		this.extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
		this.rot = new THREE.Vector3( Math.PI ,  0,0)

	}
	handle(shape){
		console.log("handle shape.");
		addShapeToView(shape,this.texture,this.extrudeSettings,this.rot);
	}
	getTargetType(){
		return ["simple","ShapeShape"];
	}
}

class LineRenderHandler extends RenderHandler{
	constructor(){
		super();

	}
	handle(shape){
		console.log("handle shape: Line.");
		_drawArcInScene(shape.fromx,shape.fromy,shape.fromz,shape.tox,shape.toy,shape.toz,shape.from,shape.to,true);

	}
	getTargetType(){
		return ["line"];
	}
}
var shapeRenderer=new ShapeRenderer();
shapeRenderer.addHandler(new RenderHandler());
shapeRenderer.addHandler(new SimpleRenderHandler());
shapeRenderer.addHandler(new LineRenderHandler());


function getShapeGraphObj(type,o){
	var sh = {};
	sh.type = type;
	sh.id = o.mid;
	
	sh.x = o.position.x;
	sh.y = o.position.y;
	sh.z = o.position.z;
	
	sh.rx=o.rotation.x;
	sh.ry=o.rotation.y;
	sh.rz=o.rotation.z;

	sh.sx=o.scale.x;
	sh.sy=o.scale.y;
	sh.sz=o.scale.z;

	var c = getCentroid(o);
	sh.cx = c.x;
	sh.cy = c.y;
	sh.cz = c.z;
	return sh;
}
function getCentroid(o2){
	var geometry = o2.geometry;
	var centroid = new THREE.Vector3(0,0,0);
	if(geometry!=null){
		geometry.computeBoundingBox();
		centroid.addVectors( geometry.boundingBox.min, geometry.boundingBox.max );
		centroid.multiplyScalar( 0.5 );
		centroid.applyMatrix4( o2.matrixWorld );
	}
	return centroid;
}

function addOrUpdateShape(sh){
	var nd = findNodeById(sh.id);
	if(nd==null){
		addObjectToGraph(sh);
	}else{
	nd.x = sh.x;
	nd.y = sh.y;
	nd.z = sh.z;
	
	
	nd.rx = sh.rx;
	nd.ry = sh.ry;
	nd.rz = sh.rz;
	
	nd.sx = sh.sx;
	nd.sy = sh.sy;
	nd.sz = sh.sz;
	
	nd.cx = sh.cx;
	nd.cy = sh.cy;
	nd.cz = sh.cz;
	}		
}




function addShapeToScene( shape, extrudeSettings, color) {
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	//var material = new THREE.MeshPhongMaterial({shininess: 1});
	var mat = new THREE.MeshLambertMaterial( { color: color } );
	if(shape.transp!=null){
	mat.opacity = shape.transp;
	mat.transparent = true;
	}else{
		mat.opacity = .9;
		mat.transparent = true;
	}
	var mesh = new THREE.Mesh( geometry, mat );
	return mesh;
}

function addShapeToView(shapeObj,texture,extrudeSettings,rot){
	console.log("Addshapetoview: "+shapeObj)
	var pts = new Array();
	Object.setPrototypeOf(shapeObj, Shape.prototype)
	if(shapeObj.visible==false)return;
	var m  = shapeObj.getPointMap();
	var facet = shapeObj.facets[0];
	Object.setPrototypeOf(facet, Facet.prototype)
	var connector = facet.connectors[0];
	if(connector.pts.length<1)return;
	var pt0 = {x:0,y:0,z:0,pointType:"Position"};
	
	for(var i=0;i<connector.pts.length;i++){
		var pt = m[connector.pts[i]];
		if(i==0){
			pts.push(pt0);
			pt0=pt;		
			pts.push(new Point(pt.x-pt0.x,pt.y-pt0.y));
			}else{
				var pttemp=new Point(pt.x-pt0.x,pt.y-pt0.y);
				pttemp.z = pt.z-pt0.z;
				pttemp.pointType=pt.pointType;
			pts.push(pttemp);
		}
	}
	var ptStr = getShapeFromPointsArrayEx(pts,pt0);
	var fn = function (){eval(ptStr); return shape;};
	var shape = fn();
	///add custom shape
	var tx = 0;
	var ty = 0;
	var tz=0;
	var sxx = 1,syy=1,szz=1;
	var rx = 1,ry=1,rz=1;
	if(shapeObj.x!=null) tx = shapeObj.x ;else tx = pt0.x;
	if(shapeObj.y!=null) ty = shapeObj.y ;else ty = pt0.y;
	if(shapeObj.z!=null) tz = shapeObj.z ;else tz = pt0.z;

	if(shapeObj.rx!=null) rx = shapeObj.rx ;else rx = rot.x;
	if(shapeObj.ry!=null) ry = shapeObj.ry ;else ry = rot.y;
	if(shapeObj.rz!=null) rz = shapeObj.rz ;else rz = rot.z;

	if(facet.fill==null)
		facet.fill	=0xF0F0F0;
	var sh = addShapeToScene( shape, extrudeSettings, facet.fill);
	sh.mid = shapeObj.id;
	sh.position.set( tx, ty, tz );
	sh.rotation.set( rx,ry,rz );
	
	if(shapeObj.sx !=null )
		sxx = shapeObj.sx;
	if(shapeObj.sy !=null )
		syy=shapeObj.sy;
	if(shapeObj.sz !=null )
		szz=shapeObj.sz;

	sh.scale.set( sxx,syy,szz );
		
	objects.push(sh);
	var obj = getShapeGraphObj("ShapeShape",sh);
	addOrUpdateShape(obj);
	var id = shapeObj.id;
	
	if( debugShapePoints==true){
	
	for(var i=0;i<pts.length;i++){
		var geometry2 = new THREE.SphereGeometry( 5, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		var sphere = new THREE.Mesh( geometry2, material );
		sphere.position.set( pts[i].x, pts[i].y,pts[i].z);
		sphere["mytype"]="shapepoint";
		sphere["groupid"]=id;
		sphere["mid"]=getUniqId()+"_"+id;
		sh.add(sphere);
	}
	}
	
	scene.add(sh);
}
function getRealPos(objMesh){
	scene.updateMatrixWorld(true);
	var position = new THREE.Vector3();
	position.getPositionFromMatrix( objMesh.matrixWorld );
	console.log(position.x + ',' + position.y + ',' + position.z);
	return position;
}
function addOrUpdateConnector(sh){
	var found = false;
	for(var i=0;i<pData.data.length;i++){
		var shold = pData.data[i];
		if(shold.id ==sh.id ){
			shold.fromx = sh.fromx;
			shold.fromy = sh.fromy;
			shold.fromz = sh.fromz;
			shold.tox = sh.tox;
			shold.toy = sh.toy;
			shold.toz = sh.toz;
			found = true;
		}
	}
	if(!found){
		addObjectToGraph(sh);
	}
}
function drawArc(){
	var o1 = clicked[""+1];
	var o2 = clicked[""+2];
	var c1 = getCentroid(o1)		
	var c2 = getCentroid(o2)		
	_drawArcInScene(c1.x,c1.y,c1.z,c2.x,c2.y,c2.z,o1.mid,o2.mid,true);
}

function updateShape(name){
	doGetHtml("/getshapetemplate?name="+name,function (param0){console.log(param0);
		aa = JSON.parse(param0);
		Object.setPrototypeOf(aa, Shape.prototype);
		
		for( var i=0; i<pData.data.length; i++ ){
			var ele = pData.data[i];
			Object.setPrototypeOf(ele, Shape.prototype);
			if(ele.compName==name){
				ele.facets = aa.facets;
				ele.pts = aa.pts;
				for(var j=0;j<objects.length;j++){
					if(objects[j].mid==ele.id){
						scene.remove(objects[j]);
						animate();
						objects.splice(j, 1);
						//render();
						break;
					}
				}
				console.log("doRender: "+renderer);
				shapeRenderer.doRender(ele);
			}
		}
	})
}
function addShape(name,x,y,z){
	console.log("adding name: "+name);
	doGetHtml("/getshapetemplate?name="+name,function (param0){console.log(param0);
		aa = JSON.parse(param0);
		Object.setPrototypeOf(aa, Shape.prototype);
		var aa2 = cloneItem(aa);
		aa2.x=x;
		aa2.y=y;
		aa2.z=z;
		aa2.id=getUniqId();
		addObjectToGraph(aa2);
		shapeRenderer.doRender(aa2);
		
	})
}
function getDesignFromServerAndLoad(name,f){
	console.log("adding name: "+name);
	doGetHtml("/getdesign?name="+name,function (param0){console.log(param0);
	aa = JSON.parse(param0);
	pData=aa;
	f();
	})
}
function saveDesignToWeb(name){
	var a={'name':name,'design':JSON.stringify(pData)}
	postFormWithContent("/savedesign",a);
}