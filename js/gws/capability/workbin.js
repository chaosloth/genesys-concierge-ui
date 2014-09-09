define(
	['../config','../utilities','../lib/http'],
	function(config,util,http){
	var log_prefix = "GWS WORKBIN MODULE - ";
		
	var getWorkbins = function(callback){
		util.log(log_prefix + "getWorkbins()");
		http.get({
			uri: '/api/v2/me/workbins?fields=*',
			callback: callback
		});
	};
	util.log(log_prefix + "Initialized Get Workbin Function");
	
	var getWorkbinContent = function(id, callback){
		util.log(log_prefix + "getWorkbinContent()");
		http.get({
			uri: '/api/v2/workbins/' + id + '/workitems?fields=*',
			callback: callback
		});
	};
	util.log(log_prefix + "Initialized Get Workbin Content Function");
	
	var putWorkitemInWorkbin = function(workbinId, workitemId){
		util.log(log_prefix + "putWorkitemInWorkbin()");
		http.post({
			uri: '/api/v2/workbins/' + workbinId,
			json: {
				operationName: "AddWorkitem",
				id: workitemId
			}
		});
	};
	util.log(log_prefix + "Initialized putWorkitemInWorkbin Function");
	
	var pullWorkitemFromWorkbin = function(workbinId, workitemId){
		util.log(log_prefix + "pullWorkitemFromWorkbin()");
		http.post({
			uri: '/api/v2/workbins/' + workbinId,
			json: {
				operationName: "PullWorkitem",
				id: workitemId
			}
		});
	};
	util.log(log_prefix + "Initialized pullWorkitemFromWorkbin Function");
	
	return {
		getWorkbins : getWorkbins,
		getWorkbinContent : getWorkbinContent,
		workitem : {
			putWorkitemInWorkbin : putWorkitemInWorkbin,
			pullWorkitemFromWorkbin : pullWorkitemFromWorkbin
		}
	};
});