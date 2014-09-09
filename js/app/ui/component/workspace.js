define(
	['jquery','app/config','app/utilities','gws', 'store','jquery.mobile'],
	function($,config, util, gws, store){
		
	var log_prefix = "WORKSPACE TAB UI MODULE - ";
	
	var initialize = function() {
		util.log(log_prefix + "Initializing");
			util.adjustContentHeight('#main-page .ui-content');
			
			$('#beginBtn').click(function(){
				onBeginButtonClick();
			})
			
			$('#workspace-title').text("Welcome " + store.user.getUser().username);
		util.log(log_prefix + "Initialized");
	};
	
	var onBeginButtonClick = function() {
		util.log(log_prefix + "Begin Button Clicked");
		console.log($('.btnAgentStatus option:selected').first().val());
		if($('.btnAgentStatus option:selected').first().val() != "Ready")
		{
			util.promptOk("Warning","Please Go Ready before starting Work");
			return;
		}
		console.log($.mobile);
		$.mobile.loading('show',{theme:'a',text:'foo'});
		gws.ixn.createWorkitemInteraction('Inbound','InboundNew','VHA', {"agent": store.user.getUser().username});
	};
	
	return {
		initialize : initialize
	};
});