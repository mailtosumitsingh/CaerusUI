
function getURL(str){
	return str;
}

function postFormWithContent(urlto, jsonContent, fun) {
	dojo.xhrPost({
		url : urlto,
		content : jsonContent,
		load : function(response, ioArgs) {
			if (fun != null)
				fun(response);
		},
		error : function(response, ioArgs) {
			if (fun != null)
				fun(response);
		}
	});
}
function doGetHtmlSync(url) {
	var ret = null;
	dojo.xhrGet({
		sync : true,
		url : url,
		load : function(data) {
			ret = data;
		}
	});
	return ret;
}
function doGetHtmlSyncWithContent(url, content) {
	var ret = null;
	dojo.xhrGet({
		sync : true,
		url : url,
		content : content,
		load : function(data) {
			console.log("sync get:" + data);
			ret = data;
		}
	});
	return ret;
}
function doGetHtml(url, fun1) {
	dojo.xhrGet({
		url : url,
		load : function(response, ioArgs) {
			if (fun1 != null) {
				fun1(response);
			}
			return response;
		},
		error : function(response, ioArgs) {
			if (fun1 != null) {
				fun1(response);
			}
			return response;
		}
	});
}
function doPostHtml(url, cnt, fun1) {
	dojo.xhrPost({
		url : url,
		content : {
			"tosave" : cnt
		},
		load : function(response, ioArgs) {
			alert(response);
			return response;
		},
		error : function(response, ioArgs) {
			var a = dojo.fromJson(response);
			alert("Failed to Save" + a.result);
			return response;
		}
	});
}
function CallWebServiceSilent(a, b, s, f) {
	dojo.xhrPost({
		url : a,
		content : {
			"tosave" : b
		},
		load : function(response, ioArgs) {
			if (s != null) {
				s(response);
			}
			return response;
		},
		error : function(response, ioArgs) {
			var a = dojo.fromJson(response);
			if (f != null) {
				f(response);
			}
			return response;
		}
	});
}
function CallWebServiceSimple(a, b, s, f) {
	dojo.xhrPost({
		url : a,
		content : b,
		load : function(response, ioArgs) {
			if (s != null) {
				s(response);
			}
			return response;
		},
		error : function(response, ioArgs) {
			var a = dojo.fromJson(response);
			if (f != null) {
				f(response);
			}
			return response;
		}
	});
}
function compileDesign(){
	var mtype="design"
	var objstr = dojo.toJson(pData.data);
	var req = {};
	req.design = objstr;
	if (mtype != null)
		req.mappingtype = mtype;
	var url = getURL("/compileDesign");
	postFormWithContent(url, req, function(res) {
		console.log(res);
	});	
}
function getCompConfig(name,id){
	var req = {};
	if(name==null)name="arbit";
	req.name = name;
	req.id = id;
	var url = getURL("/getConfig");
	postFormWithContent(url, req, function(res) {
		var dom = $(res); 
        $('#compConfig').html(dom.find('#'+id).html());
        dom.filter('script').each(function(){
            $.globalEval(this.text || this.textContent || this.innerHTML || '');
        });
		
	});	
}

