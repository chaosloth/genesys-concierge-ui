define(
	['genesys/config','genesys/utilities','eventemitter'],
	function(config, util, EventEmitter, grtc){
		
		var log_prefix = "Audio Module - ";
		var ee = new EventEmitter();
		util.log(log_prefix + "Initialized Event Emitter");
		
		var audio = new Audio();
		
		function initialize() {
			util.log(log_prefix + "Initializing Genesys Audio Library");
			
			//var $localAudio = $('<audio width="160" height="120" style="display: none" id="localAudio" autoplay="autoplay" controls style="border: 5px solid gray;">');
			//$('body').append($localAudio);
			var eee = ee;
			audio.addEventListener("ended", function() { 
				eee.trigger('audio.ended'); 
			} ,false);
			audio.addEventListener("playing", function() { 
				eee.trigger('audio.playing'); 
			} ,false);
			audio.addEventListener('loadstart', function() { eee.trigger('audio.loading'); }, false);
			
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
		
		function source(src) {
			audio.src = config.API_RECORDINGS + "/files/" + src;
			audio.load();
		}
		util.log(log_prefix + "Initialized setSource()");
		
		function play() {
			audio.play();
			//ee.trigger('audio.playing');
		}
		util.log(log_prefix + "Initialized play()");
		
		function stop() {
			audio.pause();
			//ee.trigger('audio.stopped');
		}
		util.log(log_prefix + "Initialized stop()");
		
		return {
			initialize : initialize,
			on : on,
			off : off,
			source : source,
			play : play,
			stop : stop
		};
});