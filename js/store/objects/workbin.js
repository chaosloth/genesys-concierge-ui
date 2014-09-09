define(
	['store/config','store/utilities'], 
	function(config, util){
		var log_prefix = "STORE WORKBIN MODULE - ";
		
	var _workbins = {};
	
	var addWorkbin = function(workbinName, id){
		util.log(log_prefix + "addWorkbin(" + workbinName + ")");
		_workbins[workbinName] = id;
	};
	util.log(log_prefix + "Initialized Add Workbin Function");
	
	var getWorkbinId = function(workbinName){
		util.log(log_prefix + "getWorkbinId(" + workbinName + ")");
		return _workbins[workbinName];
	};
	util.log(log_prefix + "Initialized Get Workbin Id Function");
	
	return {
		addWorkbin : addWorkbin,
		getWorkbinId : getWorkbinId
	};
});