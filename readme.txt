https://threejs.org/examples/#webgl_geometry_spline_editor
https://threejs.org/examples/#webgl_geometry_shapes
https://threejs.org/examples/#webgl_geometry_text
https://threejs.org/examples/#webgl_interactive_lines
https://threejs.org/examples/#webgl_geometry_nurbs



https://threejs.org/examples/#webgl_loader_texture_dds
https://threejs.org/examples/#webgl_loader_texture_ktx
https://threejs.org/examples/#webgl_loader_texture_tga

update model on drag and transfer update
add facility to resize
------------------------------------------------
icapability
	getcapabilites
	getsample
	getid
ICapability->
	String nameofcapability
	int mymaturitylevel

IService
	getCapabilityObj
	test()->iresult*
	
IResult
	IScore - >map of values, confidence matrix


IMediator
	IResult CallService(capability,input)-> uses IService*	by capability
			then calls updatescore on iscorer to update score.
	
IScorer
	updateScore(IResultByService, confidencematrix)
	getResultSCore(IService);
	
IMerger 
	mergeResults() ->this is merger used for resources.
	
IInputPRocessorByCapability
    
	
ISelector 
	getSErvices(input,ICapabilities)
		uses iscorer to get the score of services and based on that gives the iselector
	
	