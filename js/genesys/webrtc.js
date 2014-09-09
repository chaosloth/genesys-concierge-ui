define(
	['./config','./utilities','eventemitter', 'grtc'],
	function(config, util, EventEmitter, grtc){
		
		require('grtc');
		
		var log_prefix = "WebRTC Module - ";
		var ee = new EventEmitter();
		util.log(log_prefix + "Initialized Event Emitter");
		
		var grtcClient;
		var grtcSession;
		var userAuthorisedMedia = false;

		var localID = null;
		var remoteID = null;

		var acceptAudio = true;
		var acceptVideo = false;
		
		var dn = '';
		
		function check() {
			if (!grtcClient) {
				this.initialize();
				this.enableMediaSources(true, false);
				util.log(log_prefix + "* Requesting user to authorise media");
				ee.trigger('rtc.media.request');
			}
			if (!userAuthorisedMedia) {
				util.log(log_prefix + "* User needs to authorise media");
				ee.trigger('rtc.media.required');
				return;
			}
			
			if (!grtcClient) alert("Grtc.Client instance not created");
			else {
				grtcClient.onConnect.add(this.handleOnConnect);
				grtcClient.onFailed.add(this.handleOnConnectFailed);
				grtcClient.connect();
				ee.trigger('rtc.server.connecting');
			}
		}
		util.log(log_prefix + "Initialized check()");
		
		
		
		function connect() {
			if (!grtcClient) alert("Grtc.Client instance not created");
			else {
				grtcClient.onConnect.add(handleOnConnect);
				grtcClient.onFailed.add(handleOnConnectFailed);
				grtcClient.connect();
				ee.trigger('rtc.server.connecting');
			}
		}
		util.log(log_prefix + "Initialized check()");
		
		
		function handleOnConnect(e) {
			util.log(log_prefix + "* Connected");
			ee.trigger('rtc.server.connected');
		}
		util.log(log_prefix + "Initialized handleOnConnect()");
		
		function handleOnConnectFailed(e) {
			util.log(log_prefix + "* Connect Failed");
			ee.trigger('rtc.server.failed');
		}
		util.log(log_prefix + "Initialized handelOnFailed()");
		
		
		function enableMediaSources(audioConstraints, videoConstraints) {
			// calls Grtc.Client.enableMediaSource
			if (!grtcClient) alert("Grtc.Client instance not created");
			else {
				
				grtcClient.onMediaSuccess.add(function (obj) {
					grtcClient.setViewFromStream($("#localView")[0], obj.stream);
					acceptAudio = audioConstraints;
					acceptVideo = videoConstraints;
					
					userAuthorisedMedia = true;
					
					ee.trigger('rtc.media.authorized');
					util.log(log_prefix + "User has now authorised media");
				});
				
				grtcClient.onMediaFailure.add(function (obj) {
					ee.trigger('rtc.media.failed');
					util.log(log_prefix + "WARNING: Media failure = " + obj.message);
				});
				
				// enable audio and/or video
				grtcClient.enableMediaSource(audioConstraints, videoConstraints);
			}
		}
		util.log(log_prefix + "Initialized enableMediaSources()");
		
		function call(dataToAttach)
		{
				util.log(log_prefix + "Gateway address: " + config.WEBRTC_GATEWAY);	
				ee.trigger('rtc.calling');
			
			try {
				if (grtcSession) {
					// there is an existing call session,tear it down first
					util.log(log_prefix + "Call session already exists");
					this.disconnect();
				}
			
				grtcSession = new Grtc.MediaSession(grtcClient);
				grtcSession.onRemoteStream.add(handleRemoteStream);
			
				if(!util.isNull(dataToAttach)) {
					try {
						grtcSession.setData(dataToAttach);
					} catch (e) {
						util.log(log_prefix + "ERROR setting user data");
					}
				}

				var dn = config.TARGET_DN;
				grtcSession.makeCall(dn, true, false);
				
			} catch (err) {
				util.log(log_prefix + "Error terminating call: " + err);
			}
			ee.trigger('rtc.disconnected');
			
		};
		util.log(log_prefix + "Initialized call()");

		function callDn(targetDn, dataToAttach)
		{
				util.log(log_prefix + "Gateway address: " + config.WEBRTC_GATEWAY);	
				ee.trigger('rtc.calling');
			
			try {
				if (grtcSession) {
					// there is an existing call session,tear it down first
					util.log(log_prefix + "Call session already exists");
					this.disconnect();
				}
			
				grtcSession = new Grtc.MediaSession(grtcClient);
				grtcSession.onRemoteStream.add(handleRemoteStream);
			
				if(!util.isNull(dataToAttach)) {
					try {
						grtcSession.setData(dataToAttach);
					} catch (e) {
						util.log(log_prefix + "ERROR setting user data");
					}
				}
			
				grtcSession.makeCall(targetDn, true, false);
				
			} catch (err) {
				util.log(log_prefix + "Error terminating call: " + err);
			}
			ee.trigger('rtc.disconnected');
			
		};
		util.log(log_prefix + "Initialized callDn()");
		
		function disconnect() {
			try {
				if (grtcSession) {
					grtcSession.terminateCall();
					grtcSession = null;
					util.log(log_prefix + "* RTC Disconnected");
				}
			} catch (err) {
				util.log(log_prefix + "Error terminating call: " + err);
			}
			ee.trigger('rtc.disconnected');
		}
		util.log(log_prefix + "Initialized disconnect()");
		
		function on(event, callback) {
			util.log(log_prefix + "on() - " + event);
			ee.on(event, callback);
		};
		util.log(log_prefix + "Initialized on()");
		
		function off(event, callback) {
			util.log(log_prefix + "on()");
			ee.off(event, callback);
		};
		util.log(log_prefix + "Initialized off()");
		
		function handleRemoteStream(event) {
			util.log(log_prefix + "* Handle on remote stream call");
			
			grtcClient.setViewFromStream($("#remoteView")[0], event.stream);
			
			ee.trigger('rtc.remote.connected');
		}
		util.log(log_prefix + "Initialized handleRemoteStream()");
		
		function handleOnIncomingCall() {
			util.log(log_prefix + "* Handle on incoming call");
			ee.trigger('rtc.incoming.call');
		}
		util.log(log_prefix + "Initialized handleOnIncomingCall()");
		
		function handlePeerClosing() {
			util.log(log_prefix + "* Peer closing");
			ee.trigger('rtc.peer.closing');
		}
		util.log(log_prefix + "Initialized handlePeerClosing()");
		
		function initialize() {
			util.log(log_prefix + "Initializing Genesys WebRTC Library");
			
			var $localVideo = $('<video width="160" height="120" style="display: none" id="localView" autoplay="autoplay" controls muted="true" style="border: 5px solid gray;">');
			var $remoteVideo = $('<video width="160" height="120" style="display: none" id="remoteView" autoplay="autoplay" controls style="border: 5px solid blue;">');
			
			$('body').append($localVideo);
            $('body').append($remoteVideo);
            
            dn = config.TARGET_DN;
            
			var rtcConfig = {};
			rtcConfig.webrtc_gateway = config.WEBRTC_GATEWAY;
			rtcConfig.stun_server = config.STUN_SERVER; 
			rtcConfig.turn_server = config.TURN_SERVER;
			rtcConfig.turn_username = config.TURN_USERNAME;
			rtcConfig.turn_password = config.TURN_PASSWORD;
			//
			// Next 2 needed if need to authenticate sign-in to SIP server
			rtcConfig.sip_username = config.SIP_USERNAME;
			rtcConfig.sip_password = config.SIP_PASSWORD;
			
			console.log(rtcConfig);
			
			grtcClient = new Grtc.Client(rtcConfig);
			
			// register a handler to deal with incoming call
			grtcClient.onIncomingCall.add(handleOnIncomingCall);
			
			// add an event handler to do some work if the peer closes
			grtcClient.onPeerClosing.add(handlePeerClosing);

			window.onbeforeunload = function() {
				grtcClient.disconnect();
			};
			
		}
		util.log(log_prefix + "Initialized");
		
		return {
			initialize : initialize,
			on : on,
			off : off,
			check : check,
			connect : connect,
			enableMediaSources : enableMediaSources,
			call : call,
			callDn : callDn,
			disconnect : disconnect
		};
});