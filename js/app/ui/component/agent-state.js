define(
	['app/utilities','app/config','gws'],
		function(util,config,gws){
		var log_prefix = "AGENT STATE UI MODULE - ";
		
		var updateAgentStatus = function(status) {
			util.log(log_prefix + "updateAgentStatus()");
			
			var buttons = $(".btnAgentStatus select");
			
			$.each(buttons,function(index , value){
			
				if(status === 'Ready')
				{
					$(value).val(status);
					$(value).siblings().html($(value).find(':selected').text());
					$(value).parent().removeClass(config.AGENT_NOTREADY_CLASS).removeClass(config.AGENT_UNKNOWN_CLASS).addClass(config.AGENT_READY_CLASS);
				}
				else if(status === 'NotReady')
				{
					$(value).val(status);
					$(value).siblings().html($(value).find(':selected').text());
					$(value).parent().removeClass(config.AGENT_READY_CLASS).removeClass(config.AGENT_UNKNOWN_CLASS).addClass(config.AGENT_NOTREADY_CLASS);
				}
				else if(util.isNull(status))
				{
					$(value).parent().removeClass(config.AGENT_READY_CLASS).removeClass(config.AGENT_NOTREADY_CLASS).addClass(config.AGENT_UNKNOWN_CLASS);
				}
			});
		};
		
		var initializeAgentStates = function(states)
		{
			util.log(log_prefix + "initializeAgentStates()");
			var agent_state_tmpl = "";
			$.each(states, function(index, operation){
				if($.inArray(operation.operationName,config.AGENT_STATES) >= 0)
				{
					agent_state_tmpl = agent_state_tmpl + "<option data-id=\"" + operation.id + "\" data-state=\"" + operation.state + "\" value=\""+ operation.operationName + "\">" + operation.displayName + "</option>";
				}
			});

			var agentStateBtns = $(".btnAgentStatus select");
			$.each(agentStateBtns, function(index,btn){
				var button = $(btn);
				button.empty();
				button.append(agent_state_tmpl);
				button.selectmenu();
				button.selectmenu('refresh');
				
				button.change(function(){
					util.log("#btnAgentStatus Clicked");
					gws.agent.setAgentState($(this).val(), 'workitem');
				});
			});	
		};
		
		var initialize = function(){
			util.log(log_prefix + "Initializing");		
				gws.agent.on('agent.state', function(agentstate){
					util.log(log_prefix + "Agent State Change");
					updateAgentStatus(agentstate.state);
				});
				
				gws.agent.getAgentStateOperations(function(result) {
					initializeAgentStates(result.settings);
				});
				
				gws.agent.setAgentState(config.AGENT_STATE_DEFAULT, 'workitem');
			util.log(log_prefix + "Initialized");
		};
		
		return {
			initialize : initialize
		};
});