<!DOCTYPE html>

<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<html lang="en">
<script src="/common.js"></script>
<script src="/gobjs.js"></script>
<script src="/canvassupport.js"></script>
<script src="/shapeeditor.js"></script>
<script src="/serviceback.js"></script>
<script src="/anim_editor.js"></script>
<script type="text/javascript" src="/js/geom/jsts.js"	djConfig="parseOnLoad: true"></script>
<script type="text/javascript" src="/js/dojo/dojo/dojo.js"	djConfig="parseOnLoad: true"></script>
<script type="text/javascript" 	src="/js/raphael/raphael-min.js"	type="text/javascript" charset="utf-8"></script>
<script>
dojo.require("dojo.parser");
dojo.require("dojo.dnd.Mover");
dojo.require("dojo.dnd.Moveable");
dojo.require("dojo.dnd.move");
dojo.require("dojo.dnd.Container");
dojo.require("dojo.dnd.Manager");
dojo.require("dojo.dnd.Source");

function documentReady(){
	setup();
	
}
dojo.addOnLoad(documentReady);
</script>
<style>
</style>
<body>
	<input type="button" onclick="addShape();">Draw Path</input>
	<input type="button" onclick="stopShape();">Stop Path</input>
	<input type="button" onclick="draw();">redraw</input>
	<input type="button" onClick="newShape(getUniqId());createFacet('top');createCurrFacetSelector('conn1');saveShape();beginShapePoints();"  >New face Shape</input>
	<input type="button" onClick="newShape(null)"  >New Shape</input>
	<input type="button" onClick="saveShape(null)"  >Save Shape</input>
	<input type="button" onClick="selectShape(null)"  >Select Shape</input>
	<input type="button" onClick="deleteShape(null)"  >Delete Shape</input>
	<input type="button" onClick="createFacet(null)"  >Create facet</input>
	<input type="button" onClick="createCurrFacetSelector(null)"  >Create Connector</input>	
	<input type="button" onClick="stopShapePoints()"  >Stop Create Points</input>	
	<input type="button" onClick="if(ptSelector==true){ptSelector=false;}else {ptSelector=true}"  >Point Selector mode</input>	
	<input type="button" onClick="if(pullupmode==true){pullupmode=false;}else {pullupmode=true}"  >PullUp</input>	
	<input type="button" onClick="if(clonemode==true){clonemode=false;}else {clonemode=true}"  >Clone Mode</input>
	<input type="button" onClick="if(bndryMoveMode==true){bndryMoveMode=false;}else {bndryMoveMode=true}"  >Boundry Move Mode</input>
	<input type="button" onClick="if(renderDesignMode==true){renderDesignMode=false;}else {renderDesignMode=true};draw();"  >renderDesignMode</input>	
	<input type="button" onClick="if(controlMode==true){controlMode=false;}else {controlMode=true};draw();"  >controlMode</input>	
	<div id="graph"></div>
	<c:url value="/resources/text.txt" var="url"/>
	<spring:url value="/resources/text.txt" htmlEscape="true" var="springUrl" />
	Spring URL: ${springUrl} at ${time}
	<br>
	JSTL URL: ${url}
	<br>
	Message: ${message}
</body>

</html>