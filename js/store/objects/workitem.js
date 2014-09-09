define(
	['store/config','store/utilities'], 
	function(config,util){
		var log_prefix = "STORE WORKITEM MODULE - ";
		
		var _workitem = {};
		
		var cacheWorkitem = function(workitem)
		{
			util.log(log_prefix + "cacheWorkitem()");
			_workitem = workitem;
		};
		util.log(log_prefix + "Initialized cacheWorkitem()");
		
		var getWorkitem = function()
		{
			util.log(log_prefix + "getWorkitem()");
			return _workitem;
		};
		util.log(log_prefix + "Initialized getWorkitem()");
		
		return {
			cacheWorkitem : cacheWorkitem,
			getWorkitem : getWorkitem
		};
});