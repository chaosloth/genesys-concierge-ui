define(
	['jquery','genesys'],
	function($,genesys){
		$( document ).on('pageshow','#main-page',function(){
			
			// ***************
			// * TAB: Capture
			// ***************
			
			$("#instore-coaching #btnCall").prop('disabled', true).addClass('ui-disabled');
			$("#instore-coaching #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
			
			$("#instore-coaching #btnConnect").on('click', function() {
				genesys.webrtc.check();
			});
			
			$("#instore-coaching #btnCall").on('click', function() {
				genesys.webrtc.call();
			});
			
			$("#instore-coaching #btnDisconnect").on('click', function() {
				genesys.webrtc.disconnect();
			});
			
			// ***************
			// * TAB: Listen
			// ***************
			$("#instore-coaching #coaching-listen #btnReset").on('click', function() {
				
				$("#instore-coaching #page-graphic").show();
				$("#instore-coaching #btnReset").hide();
				$("#coaching-recordings-ul").empty();
				$("#instore-coaching #coaching-listen #statusMessage").text("");
				
				$("#instore-coaching #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
				$("#instore-coaching #btnCall").prop('disabled', false).removeClass('ui-disabled');
				$("#instore-coaching #coaching-capture #statusMessage").text("Disconnected");
				$("#instore-coaching #imgRecording").hide();
				
				$("#instore-coaching #coaching-capture #btnConnect").prop('disabled', false).removeClass('ui-disabled');
				
				genesys.audio.stop();
			});
			
			
			
			$("#instore-coaching #coaching-listen #btnRetrieve").on('click', function() {
				$("#instore-coaching #coaching-listen #statusMessage").text("Fetching...");
				
				$.getJSON(genesys.config.API_RECORDINGS + "/list" , function(data) {
					
					var li = '<li data-role="list-divider">List of recordings</li>';					
					data = data.sort();
						
					$.each(data, function(index, item){
					 	li += '<li data-icon="info"><a href="#" data-file="' + item.filename + '">' + (new Date(item.creation)).toLocaleString() + '</a></li>'
					});
					
					$("#coaching-recordings-ul").empty();
					$("#coaching-recordings-ul").append(li).promise().done(function () {
						try {
							$(this).listview("refresh");
							$("#instore-coaching #coaching-listen #statusMessage").text("Complete");
							$("#instore-coaching #page-graphic").hide();
							$("#instore-coaching #btnReset").show();
						} catch(err) {
							$("#instore-coaching #coaching-listen #statusMessage").text("Error showing recordings");
						}
						
						$(this).on("click", "a", function () {
							
							var file = $(this).attr('data-file');
							
							genesys.audio.stop();
							genesys.audio.source(file);
							genesys.audio.play();
							
						});
						
					});
				});
			});
			
			
			// ***************
			// * Audio Events
			// ***************
			
			genesys.audio.on("audio.playing", function() {
				$("#instore-coaching #coaching-listen #statusMessage").text("Playing...");
			});
			
			genesys.audio.on("audio.ended", function() {
				$("#instore-coaching #coaching-listen #statusMessage").text("Audio complete");
			});
			
			genesys.audio.on("audio.loading", function() {
				$("#instore-coaching #coaching-listen #statusMessage").text("Loading...");
			});
			
			
			
			// ***************
			// * RTC Events
			// ***************
			
			genesys.webrtc.on("rtc.media.required", function() {
				genesys.webrtc.enableMediaSources();
				$("#instore-coaching #btnConnect").prop('disabled', true).addClass('ui-disabled');
				$("#instore-coaching #coaching-capture #statusMessage").text("Please enable Audio");
			});
			
			genesys.webrtc.on("rtc.media.authorized", function() {
				$("#instore-coaching #coaching-capture #statusMessage").text("Audio enabled, please press commence");
				genesys.webrtc.connect();
			});
			
			genesys.webrtc.on("rtc.media.failed", function() {
				$("#instore-coaching #btnConnect").prop('disabled', false).removeClass('ui-disabled');
				$("#instore-coaching #coaching-capture #statusMessage").text("Audio not authorised, please try again");
			});
			
			
			genesys.webrtc.on("rtc.server.connecting", function() {
				$("#instore-coaching #coaching-capture #statusMessage").text("Connecting to the cloud...");
			});
			
			genesys.webrtc.on("rtc.server.connected", function() {
				$("#instore-coaching #statusMessage").text("Connected to the cloud !");
				$("#instore-coaching #coaching-capture #btnCall").prop('disabled', false).removeClass('ui-disabled');
			});
			
			genesys.webrtc.on("rtc.server.failed", function() {
				$("#instore-coaching #statusMessage").text("Connecting to the cloud failed");
				$("#instore-coaching #coaching-capture #btnConnect").prop('disabled', false).removeClass('ui-disabled');
			});
			
			genesys.webrtc.on("rtc.calling", function() {
				$("#instore-coaching #btnCall").prop('disabled', true).addClass('ui-disabled');
				$("#instore-coaching #btnDisconnect").prop('disabled', false).removeClass('ui-disabled');
				$("#instore-coaching #coaching-capture #statusMessage").text("Calling");
			});
			
			genesys.webrtc.on("rtc.remote.connected", function() {
				$("#instore-coaching #btnCall").prop('disabled', true).addClass('ui-disabled');
				$("#instore-coaching #btnDisconnect").prop('disabled', false).removeClass('ui-disabled');
				$("#instore-coaching #coaching-capture #statusMessage").text("Connected");
				$("#instore-coaching #imgRecording").show();
				
			});
			
			genesys.webrtc.on("rtc.peer.closing", function(){
				$("#instore-coaching #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
				$("#instore-coaching #btnCall").prop('disabled', false).removeClass('ui-disabled');
				$("#instore-coaching #coaching-capture #statusMessage").text("Disconnected");
				$("#instore-coaching #imgRecording").hide();
			});

			genesys.webrtc.on("rtc.disconnected", function() {
				$("#instore-coaching #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
				$("#instore-coaching #btnCall").prop('disabled', false).removeClass('ui-disabled');
				$("#instore-coaching #coaching-capture #statusMessage").text("Disconnected");
				$("#instore-coaching #imgRecording").hide();
			});
			
			
		});
});