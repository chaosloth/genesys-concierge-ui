define(
	['store/config','store/utilities'],
	function(config,util){
	/**
	 * @memberOf store
	 */
	
	var log_prefix = "Store App Module - ";
	var _app_idx = config.APPLICATION_INDEX;
	var _storage = window.localStorage;
	
	var _app = {
		last_page : '',
		last_tab : '',
		last_dialog : ''
	};
	util.log(log_prefix + "Initialized Application Object");
	
	var getAppState = function() {
		util.log(log_prefix + "getAppState()");
		return _app;
	};
	util.log(log_prefix + "Initialized Get App Function");
	
	var saveAppState = function() {
		util.log(log_prefix + "saveApp()");
		_storage.setItem(_app_idx, JSON.stringify(_app));
		util.log(log_prefix + "saveApp() - Completed");
	};
	util.log(log_prefix + "Initialized Save App Function");
	
	var loadAppState = function() {
		util.log(log_prefix + "loadApp()");
		var saved_app = JSON.parse(_storage.getItem(_app_idx));
		if(!util.isNull(saved_app))
		{
			_app = saved_app;
			util.log(log_prefix + "loadApp() - Stored App Found");
		}
		util.log(log_prefix + "loadApp() - Completed");
	};
	util.log(log_prefix + "Initialized Load User Function");
	
	var clearAppState = function() {
		util.log(log_prefix + "clearApp()");
		_storage.removeItem(_app_idx);
		_app.last_page = '';
		_app.last_tab = '';
		_app.last_dialog = '';
		util.log(log_prefix + "clearApp() - Completed");
	};
	util.log(log_prefix + "Initialized Clear App Function");
	
	var initialize = function() {
		util.log(log_prefix + "initialize()");
		loadAppState();
		util.log(log_prefix + "initialize() - Completed");
	};
	
	return {
		initialize : initialize,
		getAppState : getAppState,
		saveAppState : saveAppState,
		loadAppState : loadAppState,
		clearAppState : clearAppState
	};
});