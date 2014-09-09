define(
	['jquery','app/config','app/utilities','gws','store', 'genesys'],
	function($,config,util,gws,store, genesys){
		var log_prefix = "WORKITEM UI MODULE - ";
		
		var initialize = function()
		{
			util.log(log_prefix + "initialize()");
			
			$('#workitem #txtCustomerName').change(function(){
				store.workitem.getWorkitem().userData.customer = $(this).val();
				var customer = $(this).val();
				var id = store.workitem.getWorkitem().id;
				var tab_id = $(this).parents('.tab-content').first().attr('id');
				gws.workitem.attachData(id,{"customer" : customer , "last_tab" : tab_id});
				
				$.each($('.readOnlyCustomerInput'), function(index, input){
					$(input).val(customer);
				});
			});
			
			$('#workitem [data-action="update"]').click(function(){
				var customer = $('#workitem #txtCustomerName').val();
				if(util.isNull(customer))
				{
					util.promptOk("Warning","Please provide a Customer Name First");
					return;
				}
				var category = $(this).text();
				
				store.workitem.getWorkitem().userData.category = category;
				var id = store.workitem.getWorkitem().id;

				var target = $(this).attr('data-target');
				if(!util.isNull(target))
				{
					gws.workitem.attachData(id,{"category" : category, "last_tab" : target});
					util.activateTab(target);
				}	
			});
			
			$('*[data-action="hold"]').click(function(){	
				var customer = $('#workitem #txtCustomerName').val();
				if(util.isNull(customer))
				{
					util.promptOk("Warning","Please provide a Customer Name First");
					return;
				}
				var id = store.workitem.getWorkitem().id;
				onSaveWorkitem();
			});
			
			$(' a[data-action="complete"]').click(function(){
				var subcategory = $(this).text();
				store.workitem.getWorkitem().userData.subcategory = subcategory;
				var id = store.workitem.getWorkitem().id;
				var tab_id = $(this).parents('.tab-content').first().attr('id');
				gws.workitem.attachData(id,{"subcategory" : subcategory, "last_tab" : tab_id});
				onCompleteWorkitem();	
			});
			
			
			gws.workitem.on('workitem.invited',function(workitem){
				util.log(log_prefix + "on Workitem Invite");
				onWorkitemInvited(workitem);
			});
			
			gws.workitem.on('workitem.revoked', function(workitem) {
				util.log(log_prefix + "on Workitem Revoked");
				onWorkitemRevoked(workitem);
			});
			
			gws.workitem.on('workitem.processing', function(workitem) {
				util.log(log_prefix + "on Workitem Processing");
				onWorkitemProcessing(workitem);
			});
			
			gws.workitem.on('workitem.complete', function(workitem) {
				util.log(log_prefix + "on Workitem Complete");
				onWorkItemComplete(workitem);
			});
			
			gws.workitem.on('workitem.inworkbin', function(workitem) {
				util.log(log_prefix + "on Workitem Processing");
				onWorkitemInWorkbin(workitem);
			});
			
			$('#btnAcceptWorkitem').click(function() {
				util.log(log_prefix + 'AcceptWorkitem Button Pressed');
				onWorkitemAccept();
			});
			
			$('#btnRejectWorkitem').click(function() {
				util.log(log_prefix + 'RejectWorkitem Button Pressed');
				onWorkitemReject();
			});
			
			$('.btnCompleteWorkitem').click(function() {
				util.log(log_prefix + 'CompleteWorkitem Button Pressed()');
				onCompleteWorkitem();
			});
			
			$('#btnCompleteWorkitem').click(function() {
				util.log(log_prefix + 'CompleteWorkitem Button Pressed()');
				onCompleteWorkitem();
			});
			
			$('#btnSaveWorkitem').click(function() {
				util.log(log_prefix + 'SaveWorkitem Button Pressed()');
				onSaveWorkitem();
			});
			
			//Check if there is any active workitems to restore
			gws.workitem.getActive(onRestoreActiveWorkitem,null);
		};
		
		var acceptTimerValue;
		var timer1 = {};

		var acceptTimerCount = function()
		{
		  acceptTimerValue = acceptTimerValue - 1;
		  if (acceptTimerValue <= 0)
		  {
		     clearInterval(timer1);
		     return;
		  }
		  // Do code for showing the number of seconds here
		  $('#slider-time').val(acceptTimerValue);
		  $('#slider-time').slider('refresh');
		};
		
		var startAcceptTimer = function() {
			clearInterval(timer1);
			acceptTimerValue = config.ACCEPT_TIMER_VALUE;
			timer1 = setInterval(acceptTimerCount, 1000); //1000 will  run it every 1 second
		};
		
		var onWorkitemInvited = function(workitem) {
 			util.log(log_prefix + "onWorkitemInvited()");
 			store.workitem.cacheWorkitem(workitem);

			if (config.AUTO_ACCEPT == "true") {
				onWorkitemAccept();
			}
			
			$("#interaction-invite-dialog #interaction-invite-title").html(workitem.userData.TaskType);
			$("#interaction-invite-dialog #displaymessage").val(workitem.userData.Subject);
			$("#interaction-invite-dialog #tasktype").val(workitem.userData.TaskType);
			$("#interaction-invite-dialog #usertype").val(workitem.userData.UserType);

			startAcceptTimer();
			store.app.last_dialog = "#interaction-invite-dialog";
			store.app.saveAppState();
			$("#interaction-invite-dialog").popup("open");
			
	    	util.log(log_prefix + "onWorkitemInvited() - Completed");
	    	
		};
		util.log(log_prefix + "Initialized onWorkitemInvited()");
		
		var onWorkitemRevoked = function(workitem) {
			util.log(log_prefix + "onWorkitemRevoked()");
			
			$("#interaction-invite-dialog").popup("close");
			
			store.app.getAppState().last_dialog = '';
			store.app.saveAppState();
		};
		util.log(log_prefix + "Initialized onWorkitemRevoked()");
		
		
		
		var onWorkitemProcessing = function(workitem) {
			util.log(log_prefix + "onWorkitemProcessing()");
			$.mobile.loading('hide');
			$("#interaction-invite-dialog").popup("close");
			$(".btnCompleteWorkitem").show();
			
			store.workitem.cacheWorkitem(workitem);
			
			// ****************************************
			// * Populate fragments
			// ****************************************
			var frag = workitem.userData['concierge-fragment'];
			frag = (frag ? frag : workitem.userData['fragment'] );
			
			$.each( workitem.userData, function( key, value ) {
				// Set text boxes
				$("#" + frag + " [name='" + key + "']").val(value);
		
				// Set radio / check boxes / sliders
				$("#" + frag + " input[name='" + key + "'][value='" + value + "']").prop('checked', true);
				
				util.log(log_prefix + "Frag (" + frag + ") Key (" + key + ") => " + value);
				
				if(key == 'url') {
					util.log(log_prefix + "Setting iframe src = " + value);
					$("#" + frag + " iframe").attr('src', value);
				}

				// Refresh those items
				$("#" + frag + " input[type='checkbox']").checkboxradio("refresh");
				$("#" + frag + " input[data-type='range']").slider("refresh");
				$("#" + frag + " select").selectmenu("refresh");
				$("#" + frag + " input[type='radio']").checkboxradio("refresh");

			});

			// Execute rules
			if(workitem && workitem.userData && workitem.userData['TaskType']) {
				
				var data = { 'task' : workitem.userData['TaskType'] };

				genesys.rules.execute('Segmentation', data, function(result) {
					console.log("** Execute rules on workitem, result to follow");
					console.log(result);

					if(result) {
						$(".suggestion").hide();
						$(".suggestion." + result.suggestion1).show();
						$(".suggestion." + result.suggestion2).show();
						$(".suggestion." + result.suggestion3).show();
					}
				});
			}
			
			util.activateTab(frag);
			$( "#footer" ).hide();
			
			
			// ****************************************
			// * VHA Code below
			// ****************************************
// 			if(util.isNull(workitem.userData.customer))
// 			{
// 				$('#workitem #txtCustomerName').val('');
// 			}
// 			else
// 			{
// 				$('#workitem #txtCustomerName').val(workitem.userData.customer);
// 				$('#workitem #txtCustomerName').trigger('change');
// 			}
// 
// 			if(!util.isNull(workitem.userData.last_tab))
// 			{
// 				util.activateTab(workitem.userData.last_tab);
// 			}
// 			else
// 			{
// 				util.activateTab('workitem');
// 			}

		};
		util.log(log_prefix + "Initialized onWorkitemProcessing()");
		
		var onWorkItemComplete = function(workitem) {
			util.log(log_prefix + "onWorkItemComplete()");
			
			$(".btnCompleteWorkitem").hide();
			util.activateTab('agentstate');

		};
		util.log(log_prefix + "Initialized onWorkItemComplete()");
		
		var onWorkitemAccept = function() {
			util.log(log_prefix + "onWorkItemAccept()");
			var id = store.workitem.getWorkitem().id;
			util.log(log_prefix + "onWorkItemAccept() - " + id);
			gws.workitem.accept(id);
			
		}
		
		var onWorkitemReject = function() {
			util.log(log_prefix + "onWorkitemReject()");
			var id = store.workitem.getWorkitem().id;
			util.log(log_prefix + "onWorkitemReject() - " + id);
			gws.workitem.reject(id);
			$("#interaction-invite-dialog").popup("close");
		};
		
		var onCompleteWorkitem = function() {
			util.log(log_prefix + "onCompleteWorkitem()");
			util.promptConfirm("Warning","Confirm Transaction Completed",function(){
				gws.workitem.complete(store.workitem.getWorkitem().id);
			},function(){
				//alert('No');
			});
		};
		
		var onSaveWorkitem = function() {
			util.log(log_prefix + "onSaveWorkitem()");
			var workbinId = store.workbins.getWorkbinId(config.AGENT_INPROGRESS_WORKBIN);
			gws.workbins.workitem.putWorkitemInWorkbin(workbinId,store.workitem.getWorkitem().id);
		};
		
		var onWorkitemInWorkbin = function(workbinName) {
			util.log(log_prefix + "onWorkitemInWorkbin()");
			util.activateTab('workspace');
		};
		
		var onRestoreActiveWorkitem = function(data) {
			util.log(log_prefix + "onRestoreActiveWorkitem()");
				if(data.workitems.length > 0)
				{
					$.each(data.workitems, function(index, workitem){
						if(workitem.state == "Invited")
						{
							onWorkitemInvited(workitem);
						}
						else if(workitem.state == "Processing")
						{
							onWorkitemProcessing(workitem);
						}
					});
				}
			util.log(log_prefix + "onRestoreActiveWorkitem() - Completed");
		}
		util.log(log_prefix + "Initialized onRestoreActiveWorkitem()");
		
		return {
			initialize : initialize
		};
});