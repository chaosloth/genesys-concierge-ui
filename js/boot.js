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
	},
	packages : ['app','gws','store','genesys'],
});

require( [ "infrastructure" ], 
function () { 
	require( [ "app" ], 
	function ( app ) { 
		app.initialize(); 
	} ); 
} );