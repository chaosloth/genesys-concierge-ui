define(
	['gws/utilities','gws/config','gws/lib/http','eventemitter'],
	function(util,config,http,EventEmitter){
		var log_prefix = 'GWS AGENT STATE MODULE - ';
		var ee = new EventEmitter();
		
		var getAgentStateOperations = function(callback) {
			util.log(log_prefix + "getAgentStateOperations()");
			http.get({
				uri: '/api/v2/settings/agent-states',
				callback: callback
			});
		};
		util.log(log_prefix + "Initialized getAgentStateOperations()");
		
		var setAgentState = function(operationName, channel) {
			util.log(log_prefix + "setAgentState()");
	    	http.post({
				uri: '/api/v2/me/channels/' + channel,
				json: {
					operationName: operationName
				}
			});
	    };
	    util.log(log_prefix + "Initialized setAgentState()");
	    
		var setAgentStateAll = function(operationName) {
			util.log(log_prefix + "setAgentStateAll()");
	    	http.post({
				uri: '/api/v2/me',
				json: {
					operationName: operationName
				}
			});
	    };
		util.log(log_prefix + "Initialized setAgentStateAll()");
		
		var onChannelMessage = function(message) {
			util.log(log_prefix + 'onChannelMessage()');
			util.log(message);
			if (message.data.messageType === 'ChannelStateChangeMessageV2') {
				$.each(message.data.channels, function(index, val) {
					ee.trigger('agent.state',[val.userState]);
				});
			}
		};
		
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
		
		return {
			getAgentStateOperations : getAgentStateOperations,
			setAgentState : setAgentState,
			setAgentStateAll : setAgentStateAll,
			onChannelMessage : onChannelMessage,
			on : on,
			off : off
		};
});