define(
	['underscore','jquery','gws','app/config', 'genesys'],
	function(_, $, gws, config, genesys){
		$( document ).on('pageshow','#main-page',function(){
			
			$('#task-tab-1').click();

			$('#task-tab-addon').on('click', function() {
				var data = { 'task' : 'Pick Up' };

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
			});
		
			gws.ixn.on("interaction.submitted.success", function(data) {
				$.mobile.loading('hide');
				$("#formPickupMessage").val("Interaction submitted");
			});
			
			gws.ixn.on("interaction.submitted.error", function(data) {
				$.mobile.loading('hide');
				$("#formPickupMessage").val("Error occurred");

			});

			$('#btnPickupCancel').click(function() {
				$('#formPickup')[0].reset();
				$("#btnPickupCreate").button('enable');
				$("#formPickupMessage").val('Not Submitted');
			});

			$('#btnPickupCreate').click(function() {
				$.mobile.loading('show');
				$("#btnPickupCreate").button('disable');
				var formData = $('#formPickup').serializeArray();
				var data = {};
				_.each(formData, function(obj) { data[obj.name] = obj.value });
				gws.ixn.createWorkitemInteraction("Inbound", "InboundNew", config.IXN_INBOUND_QUEUE, data);
			});
		
			// ***************
			// * Web RTC
			// ***************
			
			$("#pickup #btnCall").prop('disabled', true).addClass('ui-disabled');
			$("#pickup #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
			
			$("#pickup #btnConnect").on('click', function() {
				genesys.webrtc.check();
			});
			
			$("#pickup #btnCall").on('click', function() {
				genesys.webrtc.call();
			});
			
			$("#pickup #btnDisconnect").on('click', function() {
				genesys.webrtc.disconnect();
			});


		});

		// ***************
		// * RTC Events
		// ***************

		genesys.webrtc.on("rtc.media.required", function() {
			genesys.webrtc.enableMediaSources();
			$("#pickup #btnConnect").prop('disabled', true).addClass('ui-disabled');
			$("#pickup #statusMessage").text("Please enable Audio");
		});
		
		genesys.webrtc.on("rtc.media.authorized", function() {
			$("#pickup #statusMessage").text("Audio enabled, please press call");
			genesys.webrtc.connect();
		});
		
		genesys.webrtc.on("rtc.media.failed", function() {
			$("#pickup #btnConnect").prop('disabled', false).removeClass('ui-disabled');
			$("#pickup #statusMessage").text("Audio not authorised, please try again");
		});
		
		genesys.webrtc.on("rtc.server.connecting", function() {
			$("#pickup #statusMessage").text("Connecting to the cloud...");
		});
		
		genesys.webrtc.on("rtc.server.connected", function() {
			$("#pickup #statusMessage").text("Connected to the cloud !");
			$("#pickup #btnCall").prop('disabled', false).removeClass('ui-disabled');
		});
		
		genesys.webrtc.on("rtc.server.failed", function() {
			$("#pickup #statusMessage").text("Connecting to the cloud failed");
			$("#pickup #btnConnect").prop('disabled', false).removeClass('ui-disabled');
		});
		
		genesys.webrtc.on("rtc.calling", function() {
			$("#pickup #btnCall").prop('disabled', true).addClass('ui-disabled');
			$("#pickup #btnDisconnect").prop('disabled', false).removeClass('ui-disabled');
			$("#pickup #statusMessage").text("Calling");
		});
		
		genesys.webrtc.on("rtc.remote.connected", function() {
			$("#pickup #btnCall").prop('disabled', true).addClass('ui-disabled');
			$("#pickup #btnDisconnect").prop('disabled', false).removeClass('ui-disabled');
			$("#pickup #statusMessage").text("Connected");
			$("#pickup #imgRecording").show();
		});

		genesys.webrtc.on("rtc.peer.closing", function(){
			$("#pickup #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
			$("#pickup #btnCall").prop('disabled', false).removeClass('ui-disabled');
			$("#pickup #statusMessage").text("Disconnected");
			$("#pickup #imgRecording").hide();
		});

		genesys.webrtc.on("rtc.disconnected", function() {
			$("#pickup #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
			$("#pickup #btnCall").prop('disabled', false).removeClass('ui-disabled');
			$("#pickup #statusMessage").text("Disconnected");
			$("#pickup #imgRecording").hide();
		});
});