define(
	['gws/config','gws/utilities','gws/lib/ixn-http','eventemitter'],
	function(config, util,ixn_http,EventEmitter){
		var log_prefix = "Interaction Submitter API Module - ";
		var ee = new EventEmitter();
		util.log(log_prefix + "Initialized Event Emitter");
		
		var createWorkitemInteraction = function(type, subType, queue, data)
		{
			ixn_http.post({
				uri: 'ixn/create',
				json: {
					mediaType: "workitem",
					queueName: queue,
					interactionType: type,
					interactionSubType: subType,
					userData : data
				}
			},
			function(data) {
				ee.trigger('interaction.submitted.success',data);
			},
			function(data) {
				ee.trigger('interaction.submitted.error',data);
			},
			function(data) {
				ee.trigger('interaction.submitted.done', data);
			});
		};
		util.log(log_prefix + "Initialized createInteraction()");
		
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
	 
		
		/************** INITIALIZATION **************/
		util.log(log_prefix + "Initializing");
		// onXXX subscriptions live here...
		util.log(log_prefix + "Initialized");
		
		return {
			on : on,
			off : off,
			createWorkitemInteraction : createWorkitemInteraction
		};
});