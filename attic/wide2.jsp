<!DOCTYPE html>

<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<html lang="en">
<script type="text/javascript" src="/js/dojo/dojo/dojo.js" djConfig="parseOnLoad: true"></script>
<script src="/js/threejs/three.js"></script>
<script src="/js/threejs/orbitcontrols.js"></script>
<script src="/js/threejs/dragcontrols.js"></script>
<script src="/js/threejs/tc.js"></script>
<script src="/js/threejs/geom/convexgeometry.js"></script>
<script src="/js/threejs/utils/SceneUtils.js"></script>
<script src="/common.js"></script>
<script src="/gobjs.js"></script>
<script src="/serviceback.js"></script>
<script src="/modulesupport.js"></script>

<script src="/js/velocity/velocity.js"></script>
<script src="/js/jquery/jquery.js"></script>
<script src="/js/jquery/jquery-ui.min.js"></script>
<script>
dojo.require("dojo.parser");
dojo.require("dojo.dnd.Mover");
dojo.require("dojo.dnd.Moveable");
dojo.require("dojo.dnd.move");
dojo.require("dojo.dnd.Container");
dojo.require("dojo.dnd.Manager");
dojo.require("dojo.dnd.Source");

var container, stats;
var camera, scene, raycaster, renderer;
var oc = true;
var transformControl = null;
var addTCControl = true;
var mouse = new THREE.Vector2(), INTERSECTED;
var radius = 100, theta = .1;
var controls = null;
var scube = null;
var xSpeed = 1;
var ySpeed = 1;
var zSpeed = 1;
var drawArrowMode = false;
var canvas  = null,canvasPosition=null;

var hiding = null;
var dragControls = null;
var clicked = {count:0};
var lastClicked = null;
var loader = new THREE.TextureLoader();
var texture = loader.load( "/textures/UV_Grid_Sm.jpg" );
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 0.008, 0.008 );
var extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
var rot = new THREE.Vector3( Math.PI ,  0,0)
var cshape = {"id":"","data":{},"compName":"web","pts":[{"x":248,"y":529.8888893127441,"z":0,"id":"Random_467_conn1_Random_41","pointType":"Position","type":"ShapePoint"},{"x":299,"y":428.88888931274414,"z":0,"id":"Random_467_conn1_Random_725","pointType":"Position","type":"ShapePoint"},{"x":338,"y":514.8888893127441,"z":0,"id":"Random_467_conn1_Random_35","pointType":"Position","type":"ShapePoint"}],"facets":[{"id":"top","connectors":[{"id":"conn1","pts":["Random_467_conn1_Random_41","Random_467_conn1_Random_725","Random_467_conn1_Random_35"],"connectortype":"StraightLineClose","type":"ShapeConnector","opacity":0.7,"fill":"90-#00c6ff-#0072ff","stroke":"black","visible":true}],"type":"ShapeFacet","opacity":0.7,"fill":"90-#00c6ff-#0072ff","stroke":"black","visible":true}],"type":"ShapeShape","visible":true};
var showInfo = false;
function getClicked3DPoint(event) {
	event.preventDefault();
    var vec = new THREE.Vector3(); 
    var pos = new THREE.Vector3(); 
    vec.set(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        - ( event.clientY / window.innerHeight ) * 2 + 1,
        0.5 );
    vec.unproject( camera );
    vec.sub( camera.position ).normalize();
    var distance = - camera.position.z / vec.z;
    pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
	console.log(pos);
	var shp1 = cloneItem(cshape);
	shp1.id=getUniqId();
	shp1.x = pos.x;
	shp1.y = pos.y;
	shp1.z = pos.z;
	addShapeToView(shp1,texture,extrudeSettings,rot);

}
$(document).ready(function(){
        $("#compConfig").hide();
    	$('#compList').hide();
    	$( ".draggable" ).draggable({
    		revert:true,
            stop: function( event, ui ) {
            	console.log(ui);
            	var pt = getClicked3DPoint(event);
            	console.log(pt);
            	$(this).removeClass('ui-draggable-dragging'); 
            }
        });
        $( ".droppable" ).droppable({
          drop: function( event, ui ) {
           console.log(ui);
          },
        });
});
var showConfig = false;
function isConfigMode(){
	return  $("#compConfig").is(":visible");
}
function showConfigDiv(){
	console.log("showconfigdiv")
    $("#compConfig").toggle();
    if($("#compConfig").is(":visible")){
    	interactive(false);
    }else{
    	interactive(true);
    }
}
function showCompListDiv(){
	console.log("showCompListDiv")
    	$('#compList').toggle();
    if($("#compList").is(":visible")){
    	interactive(false);
    }else{
    	interactive(true);
    }
}
function interactive(mode){
	if(mode==true){
		showConfig =false;
    	
		if(transformControl!=null){
			transformControl.enabled=true;
		}
		if(dragControls!=null){
			dragControls.enabled=true;
		}
		if(controls!=null){
			controls.enabled=true;
		}		
		if(oc!=null){
			oc.enabled=true;
		}
			
	}else{
		showConfig =true;
    	
		if(transformControl!=null){
			transformControl.enabled=false;
		}
		if(dragControls!=null){
			dragControls.enabled=false;
		}
		if(controls!=null){
			controls.enabled=false;
		}
		if(oc!=null){
			oc.enabled=false;
		}
	}
}
function doShowConfig(){
	if(showConfig==true){
	if(lastClicked!=null){
		var nd = findNodeById(lastClicked.mid);
		console.log(nd);
		getCompConfig(nd.compName,lastClicked.mid);
		
	}
	}
	if(showInfo==true){
		$("#infodiv").animate({ 'left': (event.clientX )+ 'px', 'top': (event.clientY ) + 'px'}, 200, function(){ });
	}
	
	
}
function addGrid(){
	var size = 10000;
	var divisions = 10;

	var gridHelper = new THREE.GridHelper( size, divisions );
	scene.add( gridHelper );
	
	var axesHelper = new THREE.AxesHelper( 10000 );
	scene.add( axesHelper );

}
function documentReady(){
	init();
	animate();
	function init() {

		container = $("#playground").get(0);
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xE0E0E0 );
		
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, -10000 );
		camera.position.set( 0, 0, 10000);
		camera.lookAt( 0,0,-10000); 

		var helper = new THREE.CameraHelper( camera );
		scene.add( helper );
		
		var light = new THREE.DirectionalLight( 0xff0000, 1 );
		light.position.set( 1, 1, 1 ).normalize();
		scene.add( light );
		var helper = new THREE.DirectionalLightHelper( light, 50 );
		scene.add( helper );
		addGrid();
		var light2 = new THREE.DirectionalLight( 0x00ff00, 1 );
		light2.position.set( -100, -100, -100).normalize();
		scene.add( light2 );
		var helper2 = new THREE.DirectionalLightHelper( light2, 50 );
		scene.add( helper2 );

			for ( var k = 0;k < pData.data.length; k ++ ) {
			var shapeObj = pData.data[k];
			addShapeToView(shapeObj,texture,extrudeSettings,rot);
		}

		raycaster = new THREE.Raycaster();

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );
		canvas = renderer.domElement;
		canvasPosition = $(canvas).position();
		if(oc ){
			controls = new THREE.OrbitControls( camera );
			
			controls.update();
			controls.zoomSpeed=10;
			controls.addEventListener( 'start', function () {
				cancelHideTransorm();
			} );

			controls.addEventListener( 'end', function () {
				delayHideTransform();
			} );
		}
		if(addTCControl  ==true){
		transformControl = new THREE.TransformControls( camera, renderer.domElement );
		transformControl.addEventListener( 'change', render );
		transformControl.addEventListener( 'dragging-changed', function ( event ) {
			if(!isConfigMode())
			controls.enabled = ! event.value;
			} );
		transformControl.addEventListener( 'change', function () {
			if(!isConfigMode())
			cancelHideTransorm();
		} );

		transformControl.addEventListener( 'mouseDown', function () {
			if(!isConfigMode())
			cancelHideTransorm();
		} );

		transformControl.addEventListener( 'mouseUp', function () {
			if(!isConfigMode())
			delayHideTransform();
		} );

		transformControl.addEventListener( 'objectChange', function () {
		} );
		scene.add( transformControl );
		}
		dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
		dragControls.addEventListener( 'dragstart', function () {
			if(oc){
				if(!isConfigMode())
				controls.enabled = false;
			}
		} );
		dragControls.addEventListener( 'dragend', function (sh) {
			if(oc){
				if(!isConfigMode())
			controls.enabled = true;
			}
			var obj = getShapeGraphObj("ShapeShape",sh.object);
			addOrUpdateShape(obj);
			console.log("moved: "+sh.object["id"]);
			if(sh.object["groupid"]!=null)
			console.log("moved: "+sh.object["groupid"]);
		} );
		dragControls.addEventListener( 'hoveron', function ( event ) {
			if(addTCControl){
			transformControl.attach( event.object );
			}
			cancelHideTransorm();
		} );

		dragControls.addEventListener( 'hoveroff', function () {
			delayHideTransform();
		} );
		addTestGeom("uniq1",10,10,10);
		addTestGeom("uniq2",50,50,50);
        
}
	function delayHideTransform() {
		cancelHideTransorm();
		hideTransform();
	}

	function hideTransform() {
		hiding = setTimeout( function () {
			if(addTCControl)	transformControl.detach( transformControl.object );
		}, 2500 );
	}

	function cancelHideTransorm() {
		if ( hiding ) clearTimeout( hiding );
	}
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseClick, false );
	document.addEventListener("keydown", onDocumentKeyDown, false);
	//

	window.addEventListener( 'resize', onWindowResize, false );

}
function addShapeToView(shapeObj,texture,extrudeSettings,rot){
	var pts = new Array();
	Object.setPrototypeOf(shapeObj, Shape.prototype)
	if(shapeObj.visible==false)return;
	var m  = shapeObj.getPointMap();
	var facet = shapeObj.facets[0];
	Object.setPrototypeOf(facet, Facet.prototype)
	var connector = facet.connectors[0];
	if(connector.pts.length<1)return;
	var pt0 = {x:0,y:0,z:0};
	for(var i=0;i<connector.pts.length;i++){
		var pt = m[connector.pts[i]];
		if(i==0){
			pts.push(pt0);
			pt0=pt;		
			pts.push(new Point(pt.x-pt0.x,pt.y-pt0.y));
			}else{
			pts.push(new Point(pt.x-pt0.x,pt.y-pt0.y));
		}
	}
	var ptStr = getShapeFromPointsArrayEx(pts,pt0);
	var fn = function (){eval(ptStr); return shape;};
	var shape = fn();
	///add custom shape
	var tx = 0;
	var ty = 0;
	var tz=0;
	if(shapeObj.x!=null) tx = shapeObj.x ;else tx = pt0.x;
	if(shapeObj.y!=null) ty = shapeObj.y ;else ty = pt0.y;
	if(shapeObj.z!=null) tz = shapeObj.z ;else tz = pt0.z;
	var sh = addShape( shape, extrudeSettings, 0x8080f0, tx,ty,tz, rot.x, rot.y, rot.z, 1,texture );
	sh.mid = shapeObj.id;
	objects.push(sh);
	var obj = getShapeGraphObj("ShapeShape",sh);
	addOrUpdateShape(obj);
}
function addShape( shape, extrudeSettings, color, x, y, z, rx, ry, rz, s ,texture) {
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color } ) );
	mesh.position.set( x, y, z );
	mesh.rotation.set( rx, ry, rz );
	mesh.scale.set( s, s, s );
	scene.add( mesh );
	return mesh;
}
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

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseClick( event ) {

	if(drawArrowMode){
	if(clicked.count==2)
		clicked.count=0;
	}		
	raycaster.setFromCamera( mouse, camera );
	//var intersects = raycaster.intersectObjects( scene.children );
	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {
		console.log ( "clicked: "+ intersects[ 0 ].object.mid);
		if(intersects[ 0 ].object.ignoreme==null){
			scube = intersects[ 0 ].object;
			lastClicked=scube;
			doShowConfig();
			if(drawArrowMode){
			clicked.count++;
			clicked[""+clicked.count]=scube;
				if(clicked.count==2){
					drawArrowMode=false;
					clicked.count=0;
					drawArc();
				}
			}
		}
	}
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
	_drawArc(c1.x,c1.y,c1.z,c2.x,c2.y,c2.z,o1.id,o2.id,true);
}

function _drawArc(x,y,z,x2,y2,z2,id1,id2,isnew){
	var from = new THREE.Vector3( x,y,z);
	var to = new THREE.Vector3( x2,y2,z2 );
	var direction = to.clone().sub(from);
	var length = direction.length();
	var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xff0000 );
	arrowHelper	.ignoreme = "true";
	scene.add( arrowHelper );	
	var sh = getShapeGraphObj("line",arrowHelper);
	sh.from = id1;
	sh.to = id2;
	sh.fromx = x;
	sh.fromy = y;
	sh.fromz = z;
	sh.tox = x2;
	sh.toy = y2;
	sh.toz = z2;
	sh.id=sh.from+"_"+sh.to;
	connectors.push(arrowHelper);
	addOrUpdateConnector(sh);
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if(scube!=null){
    	console.log("got key");
    if (keyCode == 87) {//w
        scube.position.y += ySpeed;
    } else if (keyCode == 83) {//s
    	scube.position.y -= ySpeed;
    } else if (keyCode == 65) {
    	scube.position.x -= xSpeed;
    } else if (keyCode == 68) {
    	scube.position.x += xSpeed;
    } else if (keyCode == 69) {
    	scube.position.z += zSpeed;
    } else if (keyCode == 82) {
    	scube.position.z -= zSpeed;
    } 
    else if (keyCode == 32) {
        cube.position.set(0, 0, 0);
    }
    }
    render();
};
function getObjectFromView(id){
	for(var i=0;i<objects.length;i++){
		var obj = objects[i];
		if(obj.id==id)
			return obj
	}
	return null;
}
function animate() {
	//console.log("animate");
	for(var i=0;i<connectors.length;i++){
		scene.remove(connectors[i]);
	}
	connectors = new Array();
	for(var i=0;i<pData.data.length;i++){
		var obj = pData.data[i];
		if(obj.type=="line"){
		var o1 = getObjectFromView(obj.from);
		var o2 = getObjectFromView(obj.to);
		var c1 = getCentroid(o1)		
		var c2 = getCentroid(o2)		
		
		_drawArc(c1.x,c1.y,c1.z,c2.x,c2.y,c2.z,o1.id,o2.id,false);

		}
	}
	render();
	//stats.update();
	if(oc ){
		controls.update();
		}

	requestAnimationFrame( animate );
	
}

function render() {

/* 	theta += 0.1;

	camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) ); 
	camera.lookAt( scene.position ); */

 	camera.updateMatrixWorld();
	// find intersections

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( objects);

	if ( intersects.length > 0 ) {
		if(intersects[ 0 ].object.ignoreme==null){
		if ( INTERSECTED != intersects[ 0 ].object ) {
			if ( INTERSECTED !=null && INTERSECTED.material!=null && INTERSECTED.material.ehudmissive!=null){ 
				INTERSECTED.material.ehudmissive.setHex( INTERSECTED.currentHex );
			}
			INTERSECTED = intersects[ 0 ].object;	
			if(INTERSECTED.material.emissive!=null){
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex( 0xff0000 );
			}
			if(INTERSECTED.id!=null){
			console.log(INTERSECTED.id);
			}
			
		}
		}

	} else {

		if ( INTERSECTED && INTERSECTED.material.emissive!=null) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

	}

	renderer.render( scene, camera );

}
function 	toScreenPositionNonCentroid(obj, camera){
    var vector = new THREE.Vector3();

    var width = renderer.context.canvas.width;
    var height = renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = (vector.x + 1) / 2 * width;
    vector.y = -(vector.y - 1) / 2 * height;

    return { 
        x: vector.x,
        y: vector.y
    };

}
function toScreenPosition(obj, camera){
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);

	var vector = getCentroid(obj);
    vector.project(camera);
    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    };

}
function addTestGeom( id,x,y,z){
	var geometry = new THREE.Geometry();

	geometry.vertices = [
	    new THREE.Vector3( 0, 0, 0 ),
	    new THREE.Vector3( 0, 100, 0 ),
	    new THREE.Vector3( 100, 100, 0 ),
	    new THREE.Vector3( 100, 0, 0 ),
	    new THREE.Vector3( 50, 50, 100 )
	];

	geometry.faces = [
	    new THREE.Face3( 0, 1, 2 ),
	    new THREE.Face3( 0, 2, 3 ),
	    new THREE.Face3( 1, 0, 4 ),
	    new THREE.Face3( 2, 1, 4 ),
	    new THREE.Face3( 3, 2, 4 ),
	    new THREE.Face3( 0, 3, 4 )
	];    
	var mesh = createMesh(geometry);
	mesh["mid"]=id;
	scene.add(mesh);
	objects.push(mesh)
	mesh.position.set(x,y,z);
	
	for (var i=0;i<geometry.vertices.length;i++){
		var v = geometry.vertices[i];
		var geometry2 = new THREE.SphereGeometry( 4, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		var sphere = new THREE.Mesh( geometry2, material );
		sphere.position.set( v.x+x,v.y+y,v.z+z);
		scene.add( sphere );
		sphere["mytype"]="shapepoint";
		sphere["groupid"]=id;
		sphere["mid"]=getUniqId()+"_"+id;
		
		objects.push(sphere)
	}
	return mesh;
}
function createMesh(geom) {
	var material = new THREE.MeshPhongMaterial( {
		color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
		side: THREE.DoubleSide, vertexColors: THREE.VertexColors
	} );
    var wireFrameMat = new THREE.MeshBasicMaterial();
    wireFrameMat.wireframe = true;
    var mesh  = new THREE.Mesh( geom, material);
    return mesh;
}

dojo.addOnLoad(documentReady);
</script>
<style>
#info {
				position: absolute;
				top: 0px; width: 200px;
				padding: 15px;
				z-index:100;
				box-sizing: border-box;
			}
#compConfig {
				position: absolute;
				top: 100px; width: 200px;
				padding: 15px;
				z-index:100;
				box-sizing: border-box;
				background: white;
				z-index:1000;
			}
#compList {
				position: absolute;
				top: 0px; 
				left:200px;
				width: 200px;
				padding: 15px;
				z-index:100;
				box-sizing: border-box;
				background: white;
				z-index:1000;
			}			
#infodiv{
				position: absolute;
				top: 0px; 
				left:600px;
				width: 200px;
				padding: 15px;
				z-index:100;
				box-sizing: border-box;
				background: white;
				z-index:1000;
		}  
</style>
<body>
		<div id="info">
			<a href="javascript:transformControl.setMode( 'translate' );">"W" translate</a> |
			<a href="javascript:transformControl.setMode( 'rotate' );">"E" rotate</a> |
			<a href="javascript:transformControl.setMode( 'scale' );">"R" scale</a> |
			<a href="javascript:transformControl.setSize( transformControl.size + 0.1 );">"+" increase size</a> |
			<a href="javascript:transformControl.setSize( Math.max( transformControl.size - 0.1, 0.1 ) );">"-" decrease size</a><br />
			<a href="javascript:transformControl.setSpace( transformControl.space === 'local' ? 'world' : 'local' );">"Q" toggle world/local space</a> | Hold "Ctrl" down to snap to grid<br />
			<a href="javascript:transformControl.showX = !transformControl.showX">"X" toggle X</a> |
			<a href="javascript:transformControl.showY = !transformControl.showY">"Y" toggle Y</a> |
			<a href="javascript:transformControl.showZ = !transformControl.showZ">"Z" toggle Z</a> |
			<a href="javascript:transformControl.enabled = !transformControl.enabled">"Spacebar" toggle enabled</a><br />
			<a href="javascript:showConfigDiv()">Toggle Config</a><br />
			<a href="javascript:drawArrowMode=!drawArrowMode">Draw Conn</a><br />
			<a href="javascript:showCompListDiv()">Show Components</a><br />
			
		</div>
		<div id="playground" class="droppable"></div>
		<div id="compConfig">
			component configuration
		</div>
		<div id="compList">
			<div class="ui-widget-content draggable">file</div>
			<div class="ui-widget-content draggable">web</div>
		</div>
		<div id="infodiv">
		get some info
		</div>
</body>

</html>