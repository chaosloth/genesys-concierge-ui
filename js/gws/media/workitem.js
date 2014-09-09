define(
	['gws/config','gws/utilities','eventemitter','gws/lib/http'],
	function(config,util,EventEmitter,http){
	
		var log_prefix = "GWS WORKITEM MODULE - ";
		var ee = new EventEmitter();
		
		var onWorkitemMessage = function(message){
			if (message.data.messageType === "WorkitemStateChangeMessage") {
				util.log(log_prefix + "WorkitemStateChangeMessage");
				util.log(message);
				if(message.data.notificationType === "PropertiesUpdated")
				{
					ee.trigger('workitem.update',[message.data.workitem]);
				}
				else if(message.data.workitem.state == "Invited")
				{
					//store.saveInteraction(message.data.workitem);
					ee.trigger('workitem.invited',[message.data.workitem]);
				}
				else if(message.data.workitem.state == "Revoked")
				{
					util.log(log_prefix + "Revoked");
					ee.trigger('workitem.revoked',[message.data.workitem]);
				}
				else if(message.data.workitem.state == "Processing")
				{
					util.log(log_prefix + "Processing");
					ee.trigger('workitem.processing',[message.data.workitem]);
				}
				else if(message.data.workitem.state == "Completed")
				{
					util.log(log_prefix + "Completed");
					ee.trigger('workitem.complete',[message.data.workitem]);
				}
				else if(message.data.workitem.state == "InWorkbin")
				{
					//store.clearInteraction();
					ee.trigger('workitem.inworkbin',[message.data.workitem]);
				}
			}
		};
		util.log(log_prefix + "Initialized onWorkitem Message");
		
		var accept = function(id)
		{
			util.log(log_prefix + "accept()");
			http.post({
				uri: '/api/v2/me/workitems/' + id,
				json: {
					operationName: "Accept"
				}
			});
		};
		util.log(log_prefix + "Initialized Accept Function");
		
		var reject = function(id)
		{
			util.log(log_prefix + "reject()");
			http.post({
				uri: '/api/v2/me/workitems/' + id,
				json: {
					operationName: "Reject"
				}
			});
		};
		util.log(log_prefix + "Initialized Reject Function");
		
		var complete = function(id)
		{
			util.log(log_prefix + "complete()");
			http.post({
				uri: '/api/v2/me/workitems/' + id,
				json: {
					operationName: "Complete",
					queueName: config.COMPLETED_QUEUE
				}
			});
		};
		util.log(log_prefix + "Initialized Complete Function");
		
		var attachData = function(id, attacheddata){
			util.log(log_prefix + "attachData()");
			
			http.post({
				uri: '/api/v2/me/workitems/' + id,
				json: {
					operationName: "AttachUserData",
					userData: attacheddata
				}
			});
		};
		util.log(log_prefix + "Initialized Attach Data Function");
		
		var getActive = function(callback, fields) {
			util.log(log_prefix + "getActive()");
			
			if(!util.isNull(fields))
			{
				http.get({
					uri: '/api/v2/me/workitems?fields=' + fields,
					callback: callback
				});
			}
			else
			{
				http.get({
					uri: '/api/v2/me/workitems?fields=*',
					callback: callback
				});
			}
		};
		util.log(log_prefix + "Initialized getActive()");
		
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
			on : on,
			off : off,
			accept : accept,
			reject : reject,
			complete : complete,
			getActive : getActive,
			onWorkitemMessage : onWorkitemMessage,
			attachData : attachData
		};
});