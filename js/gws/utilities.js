define(['require', 'jquery', './config'], function (require, jquery, config) {
	/**
	 * @memberOf utilities
	 */
	var log_prefix = "GWS Utilities Module - ";
	var config = require('./config');
	
	var log = function(message) {
		if(config.DEBUG === true)
		{
			console.log(message);
		}
	};
	log(log_prefix + " Initialized Log Function");
	
	var isNull = function(value)
	{	
		if(typeof value === "undefined")
		{
			return true;
		}
		else if(typeof value == "undefined")
		{
			return true;
		}
		else if(value == undefined)
		{
			return true;
		}
		else if(value.length == 0)
		{
			return true;
		}
		else if(jquery.isEmptyObject(value))
		{
			return true;
		}
		else if(value)
		{
			return false;
		}
	};
	log(log_prefix + "Initialized isNull Function");
	
	var createUri = function(uri) {
		if(uri.indexOf(config.API_BASE_URL) >= 0)
		{
			return uri;
		}
		return  config.API_BASE_URI + uri;
	};
	log(log_prefix + "Initialized createUri()");
	
	var createSubmitterUri = function(uri) {
		if(uri.indexOf(config.API_SUBMITER_URL) >= 0)
		{
			return uri;
		}
		
		return  config.API_SUBMITER_URL + uri;
	};
	log(log_prefix + "Initialized createSubmiterUri()");
	
	var encodeBasic = function(username, password) {
		return 'Basic ' + window.btoa(username + ':' + password);
	};
	log(log_prefix + "Initialized encodeBasic()");
	
	log(log_prefix + "Initialized encode()");
	return {
		log : log,
		isNull : isNull,
		createUri : createUri,
		encodeBasic : encodeBasic,
		createSubmitterUri : createSubmitterUri
	}
});