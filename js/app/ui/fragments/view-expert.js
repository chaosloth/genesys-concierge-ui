define(
	['underscore','jquery', 'genesys'],
	function(_,$,genesys) {

		$( document ).on('pageshow','#main-page',function() {
			
			createPeople();

			$("#expert #btnCall").prop('disabled', true).addClass('ui-disabled');
			$("#expert #btnChat").prop('disabled', true).addClass('ui-disabled');
			$("#expert #btnEmail").prop('disabled', true).addClass('ui-disabled');
			$("#expert #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
			
			$("#expert #btnReset").on('click', function() {
				$('.experts').empty();
				createPeople();
			});

			$("#expert .avatar-circle").on('click', function(){
				var idx = $(this).attr("data-idx");
				var obj = expertList[idx];

				$('#expert #name').val(obj.name);
				$('#expert #skill').val(obj.skill);
				$('#expert #location').val(obj.location);
				$('#expert #btnEmail').attr('data-email', obj.email);

				if(obj.status == 'not-available') {
					$("#expert #btnCall").prop('disabled', true).addClass('ui-disabled');
					$("#expert #btnChat").prop('disabled', true).addClass('ui-disabled');
				} else {
					$("#expert #btnCall").prop('disabled', false).removeClass('ui-disabled');
					$("#expert #btnChat").prop('disabled', false).removeClass('ui-disabled');
				}

				$("#expert #btnEmail").prop('disabled', false).removeClass('ui-disabled');

			});

			$('#expert #btnEmail').on('click', function(){
				var email = $(this).attr("data-email");
				window.location.href = 'mailto:' + email;
				console.log("Attempting to email: " + email);
			});

			$("#expert #btnConnect").on('click', function() {
				genesys.webrtc.check();
			});
			
			$("#expert #btnCall").on('click', function() {
				genesys.webrtc.callDn(7003);
				console.log("Attempting to call: 7003");
			});
			
			$("#expert #btnDisconnect").on('click', function() {
				genesys.webrtc.disconnect();
			});

		});

		// ***************
		// * Expert functions
		// ***************
		var expertList = [
		{name: 'Christopher', avatar: 'img/avatar/christopher.jpg', skill : 'Sales lead', location : 'New York', status : 'available', email : 'christopher.connolly@genesys.com'},
		{name: 'Anthony', avatar: 'img/avatar/anf.jpg', skill : 'iPhone expert', location : 'Boston', status : 'available', email : 'christopher.connolly@genesys.com'},
		{name: 'Bruce', avatar: 'img/avatar/bruce.jpg', skill : 'Sales lead', location : 'Salt Lake City', status : 'available', email : 'christopher.connolly@genesys.com'},
		{name: 'Daniel', avatar: 'img/avatar/daniel.jpg', skill : 'Team Leader', location : 'Newtown', status : 'not-available', email : 'christopher.connolly@genesys.com'},
		{name: 'Justin', avatar: 'img/avatar/justin.jpg', skill : 'Trainer', location : 'Springfield', status : 'not-available', email : 'christopher.connolly@genesys.com'},
		{name: 'Marissa', avatar: 'img/avatar/marissa.jpg', skill : 'CSR', location : 'Sydney', status : 'available', email : 'christopher.connolly@genesys.com'},
		{name: 'Stephen', avatar: 'img/avatar/stephen.jpg', skill : 'Nokia expert', location : 'Newcastle', status : 'available', email : 'christopher.connolly@genesys.com'},
		{name: 'Monica', avatar: 'img/avatar/monica.jpg', skill : 'CSR', location : 'Boston', status : 'not-available', email : 'christopher.connolly@genesys.com'},
		{name: 'Sim', avatar: 'img/avatar/sim.jpg', skill : 'Sales lead', location : 'New York', status : 'available', email : 'christopher.connolly@genesys.com'},
		{name: 'Tania', avatar: 'img/avatar/tania.jpg', skill : 'CSR', location : 'Brisbane', status : 'available', email : 'christopher.connolly@genesys.com'},
		{name: 'John', avatar: 'img/avatar/john.jpg', skill : 'iPhone expert', location : 'Newtown', status : 'not-available', email : 'christopher.connolly@genesys.com'},
		{name: 'Jason', avatar: 'img/avatar/jason.jpg', skill : 'Sales lead', location : 'London', status : 'not-available', email : 'christopher.connolly@genesys.com'},
		{name: 'Hitoshi', avatar: 'img/avatar/hitoshi.jpg', skill : 'Android expert', location : 'Melbourne', status : 'available', email : 'christopher.connolly@genesys.com'},
		{name: 'Aro', avatar: 'img/avatar/aro.jpg', skill : 'CSR', location : 'New Jersey', status : 'available', email : 'christopher.connolly@genesys.com'},
		{name: 'Ralf', avatar: 'img/avatar/ralf.jpg', skill : 'Tablet expert', location : 'Newtown', status : 'not-available', email : 'christopher.connolly@genesys.com'}
		];


		function createPeople() {

			$.each(expertList, function(idx, item) {

				var personEl =  '<div class="avatar">';
				personEl += '<div class="avatar-circle ' + item.status + '" data-idx="' + idx + '"><img height="60" width="60" src="' + item.avatar + '"/></div>';
				personEl += '<div>' + item.name + '</div>';
				personEl += '<div style="font-size:0.85em">' + item.skill + '</div>';
				personEl += '<div style="font-size:0.7em">(' + item.location + ')</div>';
				personEl += '</div>';

				var person = $(personEl);
				$('.experts').append(personEl);

			});
		};

		// ***************
		// * RTC Events
		// ***************

		genesys.webrtc.on("rtc.media.required", function() {
			genesys.webrtc.enableMediaSources();
			$("#expert #btnConnect").prop('disabled', true).addClass('ui-disabled');
			$("#expert #statusMessage").text("Please enable Audio");
		});
		
		genesys.webrtc.on("rtc.media.authorized", function() {
			$("#expert #statusMessage").text("Audio enabled, please press call");
			genesys.webrtc.connect();
		});
		
		genesys.webrtc.on("rtc.media.failed", function() {
			$("#expert #btnConnect").prop('disabled', false).removeClass('ui-disabled');
			$("#expert #statusMessage").text("Audio not authorised, please try again");
		});
		
		genesys.webrtc.on("rtc.server.connecting", function() {
			$("#expert #statusMessage").text("Connecting to the cloud...");
		});
		
		genesys.webrtc.on("rtc.server.connected", function() {
			$("#expert #statusMessage").text("Connected to the cloud !");
			$("#expert #btnCall").prop('disabled', false).removeClass('ui-disabled');
		});
		
		genesys.webrtc.on("rtc.server.failed", function() {
			$("#expert #statusMessage").text("Connecting to the cloud failed");
			$("#expert #btnConnect").prop('disabled', false).removeClass('ui-disabled');
		});
		
		genesys.webrtc.on("rtc.calling", function() {
			$("#expert #btnCall").prop('disabled', true).addClass('ui-disabled');
			$("#expert #btnDisconnect").prop('disabled', false).removeClass('ui-disabled');
			$("#expert #statusMessage").text("Calling");
		});
		
		genesys.webrtc.on("rtc.remote.connected", function() {
			$("#expert #btnCall").prop('disabled', true).addClass('ui-disabled');
			$("#expert #btnDisconnect").prop('disabled', false).removeClass('ui-disabled');
			$("#expert #statusMessage").text("Connected");
		});

		genesys.webrtc.on("rtc.peer.closing", function(){
			$("#expert #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
			$("#expert #btnCall").prop('disabled', false).removeClass('ui-disabled');
			$("#expert #statusMessage").text("Disconnected");
		});

		genesys.webrtc.on("rtc.disconnected", function() {
			$("#expert #btnDisconnect").prop('disabled', true).addClass('ui-disabled');
			$("#expert #btnCall").prop('disabled', false).removeClass('ui-disabled');
			$("#expert #statusMessage").text("Disconnected");
		});

	});