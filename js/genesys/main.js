define(
	['jquery', './utilities', './config', './dad','./webrtc', 'grtc', './audio', './rules', './beacon'],
	function($, util, config, dad, webrtc, grtc, audio, rules, beacon){
	
	// Init WebRTC
	webrtc.initialize();
	
	// Init Audio
	audio.initialize();

	// Init iBeacon
	beacon.initialize();
		
	return {
		config : config,
		util : util,
		audio : {
			on : audio.on,
			off : audio.off,
			source : audio.source,
			play : audio.play,
			stop : audio.stop
		},
		beacon : {
			on : audio.on,
			off : audio.off
		},
		webrtc : {
			on : webrtc.on,
			off : webrtc.off,
			check : webrtc.check,
			connect : webrtc.connect,
			enableMediaSources : webrtc.enableMediaSources,
			call : webrtc.call,
			callDn : webrtc.callDn,
			disconnect : webrtc.disconnect
		},
		dad : {
			on : dad.on,
			off : dad.off,
			setServiceId : dad.setServiceId,
			getServiceId : dad.getServiceId,
			setCustomerId : dad.setCustomerId,
			getAllStates : dad.getAllStates,
			searchByPhone : dad.searchByPhone,
			associate : dad.associate
		},
		rules : {
			execute : rules.executeRule
		}
	}
});