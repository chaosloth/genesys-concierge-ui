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
		});
		
		ixn.on("interaction.submitted.error", function(data) {
			$.mobile.loading('hide');
			$("#statusMessage").val("Error occurred");
		});

		var createTask =  function(plan) {
			
			$.mobile.loading('show');

			var msg = 'Recommended coaching plan ' + plan + ' from Guru ';
			var task = 'iPhone 6 Campaign Launch';
			var url = 'https://dl.dropboxusercontent.com/u/4061001/Genesys%20Internal%20Presentations/SIP%20Deployment%20-%20Hosted%20to%20CPE.pdf';

			var data = {
				'TaskType' : task,
				'concierge-fragment' : 'training',
				'IWS_DisplayMessage' : msg,
				'url' : url
			};

			var queue = "ConciergeHTCC.default.Concierge_In";

			ixn.createWorkitemInteraction("Inbound", "InboundNew", queue, data);
		};

		$('#btnCreateA').on('click', function(){
			var plan = $(this).attr('data-plan');
			createTask(plan);
		});

		$('#btnCreateB').on('click', function(){
			var plan = $(this).attr('data-plan');
			createTask(plan);
		});

		$('#btnCreateC').on('click', function(){
			var plan = $(this).attr('data-plan');
			createTask(plan);
		});

	} ); 
} );