require.config({
	baseUrl: 'js',
	paths : {
		'jquery' : 'lib/jquery-2.1.0.min',
		'jquery.mobile.config' : 'lib/jqm/jquery.mobile.config',
		'jquery.mobile' : 'lib/jqm/jquery.mobile-1.4.2.min',
		'fastclick' : 'lib/fastclick',
		'eventemitter' : 'lib/EventEmitter',
		'handlebar' : 'lib/handlebars-v1.3.0',
		'underscore' : 'lib/underscore-min',
		'grtc' : 'lib/grtc',
		'jquery.pep' : 'lib/jquery.pep'
	},
	shim : {
		'jquery' : {
			exports: '$'
        },
        'jquery.mobile.config' : ['jquery'],
		'jquery.mobile' : ['jquery','jquery.mobile.config'],
		'jquery.cometd' : ['jquery'],
		'handlebar' : { 
			exports : 'Handlebars'
		},
		'underscore' : {
			deps:["jquery"],
			exports : '_'
		},
		'grtc' : ['jquery'],
		'jquery.pep' : ['jquery']
	}
});

require( [ "infrastructure" ], 
function () { 
	require( [ "jquery.mobile", "gws/capability/ixn" ], 
	function ( jqm, ixn ) { 
		console.log("** Lite App Ready");
		
		ixn.on("interaction.submitted.success", function(data) {
			$.mobile.loading('hide');
			$("#statusMessage").val("Interaction submitted");
			$("#" + lang + "ConfirmTicket").popup('open');
			$("#" + lang + "ConfirmTicket #ticket").val(ticket);
			console.log("Interaction submitted");
		});
		
		ixn.on("interaction.submitted.error", function(data) {
			$.mobile.loading('hide');
			$("#statusMessage").val("Error occurred");
		});

		var randomLetter = function() {
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			return possible.charAt(Math.floor(Math.random() * possible.length));
		};

		var randomDigit = function() {
			var possible = "123456789";
			return possible.charAt(Math.floor(Math.random() * possible.length));
		};

		var createTask =  function(person) {
			
			$.mobile.loading('show');

			var msg = 'Kiosk work item ' + task ;
			//var task = 'iPhone 6 Campaign Launch';
			//var url = 'http://www.apple.com';

			ticket = randomLetter() + randomDigit() + randomDigit() + randomDigit();

			var data = {
				'Subject' : person.task,
				'TaskType' : 'Kiosk',
				'concierge-fragment' : 'walkin',
				'IWS_DisplayMessage' : msg,
				'FirstName' : person.name,
				'Language' : person.language,
				'MemberID' : person.memberid,
				'PhoneNumber' : person.memberid,
				'TicketNumber' : ticket,
				'url1' : url,
				'viewname' : 'SAAQ'
			};

			var queue = "ConciergeHTCC.default.Concierge_In";

			console.log("About to submit to queue");
			console.log(data);
			ixn.createWorkitemInteraction("Inbound", "InboundNew", queue, data);
		};

		var task = "";
		var lang = "";
		var ticket = "";
		var url = "";
		var person = {name:'',memberid:''};

		$('.btnFrTask').on('click', function(){
			task = $(this).attr('data-task');
			lang = "fr";
			url = $(this).attr('data-url');
			$("#frNewInteraction").popup('open');
		});

		$('.btnEnTask').on('click', function(){
			task = $(this).attr('data-task');
			lang = "en";
			url = $(this).attr('data-url');
			$("#enNewInteraction").popup('open');
		});

		$('.btnEnSubmit').on('click', function(){
			person.name = $("#enNewInteraction #firstname").val();
			person.memberid = $("#enNewInteraction #memberid").val();
			person.task = task;
			person.lang = lang;
			createTask(person);
			$("#enNewInteraction").popup('close');
		});

		$('.btnFrSubmit').on('click', function(){
			person.name = $("#frNewInteraction #firstname").val();
			person.memberid = $("#frNewInteraction #memberid").val();
			person.task = task;
			person.lang = lang;
			createTask(person);
			$("#frNewInteraction").popup('close');
		});

		$('.btnBack').on('click', function(){
			task = "";
			lang = "";
			url = "";
			person = {name:'',memberid:''};
		});

		$('.btnComplete').on('click', function(){
			$("#" + lang + "ConfirmTicket").popup('close');
			
			$("#frNewInteraction #firstname").val('');
			$("#frNewInteraction #memberid").val('');
			$("#frNewInteraction #ticket").val('');
			
			$("#enNewInteraction #firstname").val('');
			$("#enNewInteraction #memberid").val('');
			$("#enNewInteraction #ticket").val('');
		});

		$( document ).on('pageshow','#main-page',function(){
			
		});

		$('#btnCreateA').on('click', function(){
			var task = $(this).attr('data-task');
			createTask(task);
		});

		$('#btnCreateB').on('click', function(){
			var task = $(this).attr('data-task');
			createTask(task);
		});

		$('#btnCreateC').on('click', function(){
			var task = $(this).attr('data-task');
			createTask(task);
		});

		$('#splashscreen').fadeOut(500);

	} ); 
} );