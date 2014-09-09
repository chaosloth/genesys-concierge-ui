define(
	['genesys/config','genesys/utilities','eventemitter'],
	function(config, util, EventEmitter){
		
		var log_prefix = "iBeacon Module - ";
		var ee = new EventEmitter();
		util.log(log_prefix + "Initialized Event Emitter");
		
		var enabled = false;
		
		function initialize() {
			util.log(log_prefix + "Initializing");
			enabled = true;
		}
		util.log(log_prefix + "Initialized");
		
		function on(event, callback) {
			util.log(log_prefix + "on() - " + event);
			ee.on(event, callback);
		};
		util.log(log_prefix + "Initialized on()");
		
		function off(event, callback) {
			util.log(log_prefix + "on()");
			ee.off(event, callback);
		};
		
		function isEnabled() {
			return enalbed;
		};
		
		return {
			initialize : initialize,
			on : on,
			off : off,
			isEnabled : isEnabled
		};
});