define(
	['store/config','store/utilities'],
	function(config,util){
	/**
	 * @memberOf store
	 */
	
	var log_prefix = "Store User Module - ";
	var _user_idx = config.USER_INDEX;
	var _storage = window.localStorage;
	
	var _user = {
		id : '',
		username : '',
		password : '',
		place : '',
		remember_me : false,
		uri : ''
	};
	util.log(log_prefix + "Initialized User Object");
	
	var getUser = function() {
		util.log(log_prefix + "getUser()");
		return _user;
	};
	util.log(log_prefix + "Initialized Get User Function");
	
	var saveUser = function() {
		util.log(log_prefix + "saveUser()");
		_storage.setItem(_user_idx, JSON.stringify(_user));
		util.log(log_prefix + "saveUser() - Completed");
	};
	util.log(log_prefix + "Initialized Save User Function");
	
	var loadUser = function() {
		util.log(log_prefix + "loadUser()");
		var saved_user = JSON.parse(_storage.getItem(_user_idx));
		if(!util.isNull(saved_user))
		{
			_user = saved_user;
			util.log(log_prefix + "loadUser() - Stored User Found");
		}
		util.log(log_prefix + "loadUser() - Completed");
	};
	util.log(log_prefix + "Initialized Load User Function");
	
	var clearUser = function() {
		util.log(log_prefix + "clearUser()");
		if(_user.remember_me != true)
		{
			_user.username = '';
			_user.password = '';
			_user.place = '';
			_storage.removeItem(_user_idx);
			return;
		}
		_user.id = '';		
		_user.uri = '';
		saveUser();
		util.log(log_prefix + "clearUser() - Completed");
	};
	util.log(log_prefix + "Initialized Clear User Function");
	
	var forceClearUser = function() {
		util.log(log_prefix + "forceClearUser()");
		_user.id = '';
		_user.username = '';
		_user.password = '';
		_user.place = '';
		_user.remember_me = false;
		_user.uri = '';
		_storage.removeItem(_user_idx);
		
		util.log(log_prefix + "forceClearUser() - Completed");
	};
	util.log(log_prefix + "Initialized Force Clear User Function");
	
	var initialize = function() {
		util.log(log_prefix + "initialize()");
		loadUser();
		util.log(log_prefix + "initialize() - Completed");
	};
	util.log(log_prefix + "Initialize Function");
	
	return {
		initialize : initialize,
		getUser : getUser,
		saveUser : saveUser,
		loadUser : loadUser,
		clearUser : clearUser,
		forceClearUser : forceClearUser
	};
});