define(
	['store/config','store/utilities','store/objects/user','store/objects/app','store/objects/workbin','store/objects/workitem'],
	function(config, util, user, app, workbin, workitem){
	/**
	 * @memberOf store
	 */
	
	var log_prefix = "Store Module - ";
	util.log(log_prefix + "Initializing");
		user.initialize();
		app.initialize();
	util.log(log_prefix + "Initialized");
	
	var clear = function() {
		util.log(log_prefix + "clear()");
		user.clearUser();
		app.clearAppState();
	};
	
	return {
		clear : clear,
		user : {
			getUser : user.getUser,
			saveUser : user.saveUser,
			loadUser : user.loadUser,
			clearUser : user.clearUser,
			forceClearUser : user.forceClearUser
		},
		app : {
			getAppState : app.getAppState,
			saveAppState : app.saveAppState,
			loadAppState : app.loadAppState,
			clearAppState : app.clearAppState
		},
		workbins : {
			addWorkbin : workbin.addWorkbin,
			getWorkbinId : workbin.getWorkbinId
		},
		workitem : {
			cacheWorkitem : workitem.cacheWorkitem,
			getWorkitem : workitem.getWorkitem
		}
	};
});