define(['require', 'jquery', 'store/config'], function (require, jquery, config) {
	/**
	 * @memberOf utilities
	 */
	var log_prefix = "Store Utilities Module - ";
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
	
	return {
		log : log,
		isNull: isNull
	}
});