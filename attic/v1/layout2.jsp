<!DOCTYPE html>

<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<html lang="en">
<script type="text/javascript" src="/js/dojo/dojo/dojo.js"
	djConfig="parseOnLoad: true"></script>
<script src="/js/threejs/three.js"></script>
<script src="/js/threejs/orbitcontrols.js"></script>
<script src="/js/threejs/dragcontrols.js"></script>
<script src="/js/threejs/tc.js"></script>
<!-- <script src="/js/threejs/stats.min.js"></script>
 -->
<script type="text/javascript" src="/js/raphael/raphael-min.js"
	type="text/javascript" charset="utf-8"></script>
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
var objects = [];
var connectors = [];


var hiding = null;
var dragControls = null;
var pData = {};
pData.data = new Array();

function documentReady(){
	init();
	animate();
	function init() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );


		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 0, 400);
		camera.lookAt( 0,0,-400); 
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x050505 );

		var light = new THREE.DirectionalLight( 0xffffff, 1 );
		light.position.set( 1, 1, 1 ).normalize();
		scene.add( light );
		
		var light = new THREE.DirectionalLight( 0xffffff, 1 );
		light.position.set( -100, -100, -100).normalize();
		scene.add( light );

		
		var geometry = new THREE.BoxBufferGeometry( 30, 20, 20 );
		var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		
		for ( var i = 0; i < 50; i ++ ) {

			var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

			object.position.x = Math.random() * 800 - 400;
			object.position.y = Math.random() * 800 - 400;
			object.position.z = Math.random() * 800 - 400;

			object.rotation.x = Math.random() * 2 * Math.PI;
			object.rotation.y = Math.random() * 2 * Math.PI;
			object.rotation.z = Math.random() * 2 * Math.PI;

			object.scale.x = 1;
			object.scale.y = 1;
			object.scale.z = 1;
			object.id=" "+i;
			scene.add( object );
			objects.push( object );
			var sh = getShape2("box",object);
			pData.data.push(sh);
			
			
			
		}
		///add custom shape
		var x = 87.0,y=183.6;
		var shape = new THREE.Shape();
		shape.moveTo( 87.0-x , 183.6-y);
		shape.lineTo(91.0 -87.0, 67.6-y);
		shape.quadraticCurveTo( 260.0 -87.0, 27.6  -y, 367.0 -87.0, 74.6-y);
		shape.lineTo(454.0 -87.0, 74.6-y);
		shape.lineTo(459.0 -87.0, 182.6-y);
		var loader = new THREE.TextureLoader();
		var texture = loader.load( "/textures/UV_Grid_Sm.jpg" );
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 0.008, 0.008 );
		var extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
		var rot = new THREE.Vector3( Math.PI ,  0,0)
		var sh = addShape( shape, extrudeSettings, 0x8080f0, 0, 184, 0, rot.x, rot.y, rot.z, 1,texture );
		
		sh.id = "shape " +1000;
		objects.push( sh);
		var sh = getShape2("custom",object);
		pData.data.push(sh);
		
		///end custom shape

			
		//
		raycaster = new THREE.Raycaster();

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		//stats = new Stats();
		//container.appendChild( stats.dom );
		if(oc ){
			controls = new THREE.OrbitControls( camera );
			/* controls.enableDamping = true; 
			controls.dampingFactor = 0.25;
			controls.screenSpacePanning = false;
			controls.minDistance = 100;
			controls.maxDistance = 500;
			controls.maxPolarAngle = Math.PI / 2; */
			
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
			controls.enabled = ! event.value;
			} );
		transformControl.addEventListener( 'change', function () {
			cancelHideTransorm();
		} );

		transformControl.addEventListener( 'mouseDown', function () {
			cancelHideTransorm();
		} );

		transformControl.addEventListener( 'mouseUp', function () {
			delayHideTransform();
		} );

		transformControl.addEventListener( 'objectChange', function () {
			//updateSplineOutline();
		} );
		scene.add( transformControl );
		}
		dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
		dragControls.addEventListener( 'dragstart', function () {
			if(oc)
			controls.enabled = false;

		} );
		dragControls.addEventListener( 'dragend', function () {
			if(oc)
			controls.enabled = true;
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
	function addShape( shape, extrudeSettings, color, x, y, z, rx, ry, rz, s ,texture) {
		var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color } ) );
		mesh.position.set( x, y, z );
		mesh.rotation.set( rx, ry, rz );
		mesh.scale.set( s, s, s );
		scene.add( mesh );
		return mesh;
	}
	function addLineShape( shape, color, x, y, z, rx, ry, rz, s,texture ) {
		// lines
		shape.autoClose = true;
		var points = shape.getPoints();
		var spacedPoints = shape.getSpacedPoints( 50 );
		var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
		var geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints( spacedPoints );
		// solid line
		var line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color } ) );
		line.position.set( x, y, z - 25 );
		line.rotation.set( rx, ry, rz );
		line.scale.set( s, s, s );
		//group.add( line );
		// line from equidistance sampled points
		var line = new THREE.Line( geometrySpacedPoints, new THREE.LineBasicMaterial( { color: color } ) );
		line.position.set( x, y, z + 25 );
		line.rotation.set( rx, ry, rz );
		line.scale.set( s, s, s );
		//group.add( line );
		// vertices from real points
		var particles = new THREE.Points( geometryPoints, new THREE.PointsMaterial( { color: color, size: 4 } ) );
		particles.position.set( x, y, z + 75 );
		particles.rotation.set( rx, ry, rz );
		particles.scale.set( s, s, s );
		//group.add( particles );
		// equidistance sampled points
		var particles = new THREE.Points( geometrySpacedPoints, new THREE.PointsMaterial( { color: color, size: 4 } ) );
		particles.position.set( x, y, z + 125 );
		particles.rotation.set( rx, ry, rz );
		particles.scale.set( s, s, s );
		//group.add( particles );
	}
	function getShape2(type,o){
		var sh = {};
		sh.type = type;
		sh.id = o.id;
		
		sh.px = o.position.x;
		sh.py = o.position.y;
		sh.pz = o.position.z;
		
		sh.rx=o.rotation.x;
		sh.ry=o.rotation.y;
		sh.rz=o.rotation.z;
	
		sh.sx=o.scale.x;
		sh.sy=o.scale.y;
		sh.sz=o.scale.z;
		
		return sh;
	}
	function getShape(id, type,x,y,z,rx,ry,rz,sx,sy,sz){
		var sh = {};
		sh.type = type;
		sh.id = id;
		
		sh.x = x;
		sh.y = y;
		sh.z = z;
		
		sh.rx=rx;
		sh.ry=ry;
		sh.rz=rz;
		
		sh.sx=sx;
		sh.sy=sy;
		sh.sz=sz;

		return sh;
	}
	
	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}
	var clicked = {count:0};
	function onDocumentMouseClick( event ) {
		if(clicked.count==2)
			clicked.count=0;
		
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( scene.children );
		if ( intersects.length > 0 ) {
			console.log ( "clicked: "+ intersects[ 0 ].object.id );
			if(intersects[ 0 ].object.ignoreme==null){
				scube = intersects[ 0 ].object;
				clicked.count++;
				clicked[""+clicked.count]=scube;
				if(clicked.count==2){
					//draw arc
					drawArc();
				}
			}
		}
	}
	function getCentroid(o2){
		var geometry = o2.geometry;
		geometry.computeBoundingBox();
		var centroid = new THREE.Vector3();
		centroid.addVectors( geometry.boundingBox.min, geometry.boundingBox.max );
		centroid.multiplyScalar( 0.5 );
		centroid.applyMatrix4( o2.matrixWorld );
		return centroid;
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
	var sh = getShape2("line",arrowHelper);
	sh.from = id1;
	sh.to = id2;
	sh.fromx = x;
	sh.fromy = y;
	sh.fromz = z;
	sh.tox = x2;
	sh.toy = y2;
	sh.toz = z2;
	sh.id=sh.from+"_"+sh.to;
	if(isnew==true){
		pData.data.push(sh);
	}else{
		for(var i=0;i<pData.data.length;i++){
			var shold = pData.data[i];
			if(shold.id ==sh.id ){
				shold.fromx = x;
				shold.fromy = y;
				shold.fromz = z;
				shold.tox = x2;
				shold.toy = y2;
				shold.toz = z2;
			}
		}
	}
	connectors.push(arrowHelper);
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
		
		requestAnimationFrame( animate );
		if(oc ){
			controls.update();
			}
		render();
		//stats.update();

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

		var intersects = raycaster.intersectObjects( scene.children );

		if ( intersects.length > 0 ) {
			if(intersects[ 0 ].object.ignoreme==null){
			if ( INTERSECTED != intersects[ 0 ].object ) {

				if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
				INTERSECTED.material.emissive.setHex( 0xff0000 );
				console.log(INTERSECTED.id);

			}
			}

		} else {

			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

			INTERSECTED = null;

		}

		renderer.render( scene, camera );

	}
	function toScreenPosition(obj, camera){
	    var vector = new THREE.Vector3();

	    var widthHalf = 0.5*renderer.context.canvas.width;
	    var heightHalf = 0.5*renderer.context.canvas.height;

	    obj.updateMatrixWorld();
	    vector.setFromMatrixPosition(obj.matrixWorld);
	    vector.project(camera);

	    vector.x = ( vector.x * widthHalf ) + widthHalf;
	    vector.y = - ( vector.y * heightHalf ) + heightHalf;

	    return { 
	        x: vector.x,
	        y: vector.y
	    };

	}
}
dojo.addOnLoad(documentReady);
</script>
<style>
</style>
<body>

</body>

</html>