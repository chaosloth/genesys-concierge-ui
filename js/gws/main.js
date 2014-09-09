define(
	['jquery', './config','./utilities','./cometd/main','./lib/http','eventemitter','./capability/agent-state','./capability/workbin','./media/workitem','./capability/ixn'],
	function($, config, util, cometd, http, EventEmitter, agentstate, workbin, workitem, ixn){
		/**
		 * @memberOf gws
		 */
		var log_prefix = "GWS Module - ";
		var ee = new EventEmitter();
		
		//Private Methods
		var initCometd = function()
		{
			util.log(log_prefix + "Initialize CometD");
			cometd.connect();
			util.log(log_prefix + "Initialized CometD");
		};
		util.log(log_prefix + "Initialize initCometD Function");
		
		var shutdownCometd = function()
		{
			util.log(log_prefix + "Shutdown CometD");
			cometd.disconnect();
			util.log(log_prefix + "Shutdown CometD Completed");
		};
		util.log(log_prefix + "Initialize shutdownCometD Function");
		
		//Channel Messages
		var onCometdConnected = function() {
			util.log(log_prefix + 'onCometdConnected()');
			ee.trigger('cometd.connected');
		};
		util.log(log_prefix + "Initialized onCometdConnected Function");
		
		var onCometdDisconnected = function() {
			util.log(log_prefix + 'onCometdDisconnected()');
			ee.trigger('cometd.disconnected');
		};
		util.log(log_prefix + "Initialized onCometdDisconnected Function");
		
		var onCometdMessage = function(message) {
			util.log(log_prefix + 'onCometdMessage()');
			switch (message.channel) {
				case '/v2/me/devices':
					break;
					
				case '/v2/me/interactions':
					util.log(message);
					break;
	                
	            case '/v2/me/channels':
	            	agentstate.onChannelMessage(message);
	                break;
	                
	            case '/v2/me/workitems':
	            	workitem.onWorkitemMessage(message);
	                break;
	            case '/v2/me/workbins':
	            	util.log(message);
	                break;
			}
		};
		util.log(log_prefix + "Initialized onCometdMessage Function");
		
		//Public Method
		var authenticate = function(callback,error)
		{
			util.log(log_prefix + "authenticate()");
			http.get({
				uri: '/api/v2/me',
				callback: callback,
				error: error
			});
		};
		util.log(log_prefix + "Initialized Authenticate Function");
		
		var startSession = function(place) {
			util.log(log_prefix + "startSession()");
            http.post({
                uri: '/api/v2/me',
                json: {
                    operationName: 'StartContactCenterSession',
                    channels: config.AGENT_CHANNELS,
                    place : place
                }
            });
		};
		
		var endSession = function(){
			util.log(log_prefix + "endSession()");
			http.post({
				uri: '/api/v2/me',
				json: {
					operationName: 'EndContactCenterSession'
				}
			});
		}
		util.log(log_prefix + "Initialized endSession()");
		
		var start = function()
		{
			util.log(log_prefix + "start()");
			initCometd();
			util.log(log_prefix + "start() - Completed");
		};
		util.log(log_prefix + "Initialized Start Function");
		
		var stop = function()
		{
			util.log(log_prefix + "stop()");
			endSession();
			shutdownCometd();
			util.log(log_prefix + "stop() - Completed");
		};
		util.log(log_prefix + "Initialized Stop Function");
		
		var on = function(event, callback) {
			util.log(log_prefix + "on() - " + event);
			ee.on(event,callback);
			util.log(log_prefix + "on() - " + event + " - Completed");
		};
		util.log(log_prefix + "Initialized on() Function");
		
		var off = function(event, callback) {
			util.log(log_prefix + "off() - " + event);
			ee.off(event,callback);
			util.log(log_prefix + "off() - " + event + " - Completed");
		};
		util.log(log_prefix + "Initialized off() Function");
		
		util.log(log_prefix + "Initialize GWS");
			cometd.on('connected', onCometdConnected);
			cometd.on('disconnected', onCometdDisconnected);
			cometd.on('message', onCometdMessage);
		util.log(log_prefix + "Initialized GWS");
	return {
		start : start,
		stop : stop,
		on : on,
		off : off,
		authenticate : authenticate,
		startSession : startSession,
		endSession : endSession,
		agent : {
			on : agentstate.on,
			off : agentstate.off,
			getAgentStateOperations : agentstate.getAgentStateOperations,
			setAgentState : agentstate.setAgentState,
			setAgentStateAll : agentstate.setAgentStateAll
		},
		workbins : {
			getWorkbins : workbin.getWorkbins,
			getWorkbinContent : workbin.getWorkbinContent,
			workitem : {
				putWorkitemInWorkbin : workbin.workitem.putWorkitemInWorkbin,
				pullWorkitemFromWorkbin : workbin.workitem.pullWorkitemFromWorkbin
			}
		},
		workitem : {
			on : workitem.on,
			off : workitem.off,
			accept : workitem.accept,
			reject : workitem.reject,
			complete : workitem.complete,
			getActive : workitem.getActive,
			attachData : workitem.attachData
		},
		ixn : {
			on : ixn.on,
			off : ixn.off,
			createWorkitemInteraction : ixn.createWorkitemInteraction
		}
	};
});