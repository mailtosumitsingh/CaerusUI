function syncModuleCode(){
	
}

function syncCompConfig(id,props){
	var nd = findNodeById(id);
	for(var i=0;i<props.length;i++){
		var prop = props[i];
		if(nd.data[prop]!=null){
		var tn =dojo.byId(id+prop); 
		dojo.attr(tn,'pval', nd.data[prop]);
		dojo.attr(tn,'value', nd.data[prop]);
		}
	}
}