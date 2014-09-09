define(
	['jquery','require', './config'],
	function($, require, config){
	/**
	 * @memberOf utilities
	 */
	var log_prefix = "Genesys Utilities Module - ";
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
		else if(jQuery.isEmptyObject(value))
		{
			return true;
		}
		else if(value)
		{
			return false;
		}
	};
	log(log_prefix + "Initialized isNull Function");
	
	function relative_time(date) {
	  var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
	  var delta = parseInt((relative_to.getTime() - date) / 1000, 10);
	  return seconds_to_words(delta);
	}
	log(log_prefix + "relative_time() Defined");

	function seconds_to_words(delta) {
	  var r = '';
	  if (delta < 1) {
		r = 'Now';
	  } else if (delta < 60) {
		r = delta + ' seconds';
	  } else if(delta < 120) {
		r = 'A few minutes ago';
	  } else if(delta < (45*60)) {
		r = 'About ' + (parseInt(delta / 60, 10)).toString() + ' minutes ago';
	  } else if(delta < (2*60*60)) {
		r = 'About an hour';
	  } else if(delta < (24*60*60)) {
		r = 'About ' + (parseInt(delta / 3600, 10)).toString() + ' hours ago';
	  } else if(delta < (48*60*60)) {
		r = 'About a day';
	  } else {
		r = 'About ' + (parseInt(delta / 86400, 10)).toString() + ' days ago';
	  }
	  return r;
	}
	log(log_prefix + "seconds_to_words() Defined");
	
	return {
		log : log,
		isNull: isNull,
		seconds_to_words : seconds_to_words,
		relative_time : relative_time
	}
});