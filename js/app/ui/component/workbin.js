define(
	['app/config','app/utilities', 'gws', 'store'], 
	function(config, util, gws, store){
	
		var log_prefix = "WORKBIN UI MODULE - ";
		
		var processWorkbins = function(result) {
			util.log(log_prefix + "Process Workbins");
			
			//Reset the Workbin Tab
			$("#noWorkbinTxt").show();
			$("#workbins").empty();
			
			//Process Workbin Data
			$.each(result.workbins, function(index,workbin){
				if(workbin.workbinName == config.AGENT_INPROGRESS_WORKBIN)
				{
					$("#noWorkbinTxt").hide();
					store.workbins.addWorkbin(workbin.workbinName, workbin.id);	
					updateWorkbinContent(workbin.workbinName);
				}
			});
			
			util.log(log_prefix + "Processed Workbins");
		};
		
		var updateWorkbinContent = function(workbinName) {
			util.log(log_prefix + "updateWorkbinContent()");
			
			var id = store.workbins.getWorkbinId(workbinName);
			$("#workbins").empty();
			$("#workbins").hide();
			$("#viewWorkbinBtn .badge").remove();
			
			gws.workbins.getWorkbinContent(id, function(result) {
				if(result.workitems.length > 0)
				{
					$("#workbins").show();
					$("#noWorkbinTxt").hide();
					
					var badge = "<span class=\"badge\">" + result.workitems.length + "</span>"
					$("#viewWorkbinBtn").append(badge);
					
					$.each(result.workitems, function(index, workitem){
						console.log(workitem);			
						var workitem_tmpl = "<a id=\"" + workitem.userData.InteractionId + "\" data-action=\"retrieve\" data-role=\"button\">" + workitem.userData.customer + "</a>"				
						$("#workbins").append(workitem_tmpl);
						$("#workbins").trigger("create");
						
						$('#' + workitem.userData.InteractionId).click(function(){
							var id = $(this).attr('id');
							
							util.promptConfirm("Warning","Resume the Task?",function(){
								onRetrieveWorkItemFromWorkbin(config.AGENT_INPROGRESS_WORKBIN,id);
							},function(){
								//alert('No');
							});
						});
					});
				}
				else
				{
					$("#noWorkbinTxt").show();
					$("#workbins").hide();
					util.log(log_prefix + "no workitems in workbin");					
				}
			});
		};
		util.log(log_prefix + "Initialized updateWorkbinContent()");
		
		var onWorkitemWorkbinPreview = function(interaction)
		{
			util.log(log_prefix + "onWorkitemWorkbinPreview()");
			var title = interaction.attr("data-interaction-title");
			$("#workbin-popup").width(550);
			
			$("#workbin-popup .ui-header h2").html(title);
			
			var url = interaction.attr("data-interaction-url");
			$("#workbin-popup iframe").attr("src",url);
			$("#workbin-popup iframe").width($("#workbin-popup").width());
			
			util.adjustContentHeight("#workbin-popup iframe");
			util.adjustContentHeight("#workbin-popup #block");
			$("#workbin-popup #block").width($("#workbin-popup iframe").width());
			
			$("#workbin-popup").attr('data-interaction-id',$(interaction).attr('id'));
			$("#workbin-popup").attr('data-workbin',$(interaction).attr('data-workbin'));

			$("#workbin-popup").popup({theme: "a"});
			$("#workbin-popup").popup("open");
		};
		
		var onWorkitemInWorkbin = function(workitem) {
			util.log(log_prefix + "onWorkitemInWorkbin()");
			if(!util.isNull(workitem.userData.Workbin))
			{
				updateWorkbinContent(workitem.userData.Workbin);
			}
		};
		
		var onWorkitemProcessing = function(workitem) {
			util.log(log_prefix + "onWorkitemProcessing()");
			if(!util.isNull(workitem.userData.Workbin))
			{
				updateWorkbinContent(workitem.userData.Workbin);
			}
		};
		
		function onRetrieveWorkItemFromWorkbin(workbinName, workbinId)
		{
			util.log("onRetrieveWorkItemFromWorkbin()");
			gws.workbins.workitem.pullWorkitemFromWorkbin(workbinName, workbinId);
		};
		
		var initialize = function(){
			util.log(log_prefix + "Initializing");
				//Initialize Workbin Data
				gws.workbins.getWorkbins(processWorkbins);
				
				$('#workbin-popup #block').click(function(){
					//alert("Please press the retrieve button to edit task");
					$("#workbin-popup").popup("close");
				});
				
				$('#btnRetrieve').click(function(){
					onRetrieveWorkItemFromWorkbin($('#workbin-popup').attr('data-workbin'),$('#workbin-popup').attr('data-interaction-id'));
				});
				
				gws.workitem.on('workitem.processing', function(workitem) {
					util.log(log_prefix + "on Workitem Processing");
					onWorkitemProcessing(workitem);
				});
				
				gws.workitem.on('workitem.inworkbin', function(workitem) {
					util.log(log_prefix + "on Workitem Processing");
					onWorkitemInWorkbin(workitem);
				});
				
			util.log(log_prefix + "Initialized");
		};
		
		return {
			initialize : initialize
		};
});