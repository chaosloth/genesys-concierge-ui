({
    appDir: "./",
    mainConfigFile : "js/boot.js",
    baseUrl: "js",
    removeCombined: true,
    findNestedDependencies: true,
    dir: "../genesys-tablet-ui-APP-DIST",
    paths : {
		'jquery' : 'lib/jquery-2.1.0.min',
		'jquery.mobile.config' : 'lib/jqm/jquery.mobile.config',
		'jquery.mobile' : 'lib/jqm/jquery.mobile-1.4.2.min',
		'fastclick' : 'lib/fastclick',
		'eventemitter' : 'lib/EventEmitter',
		'handlebar' : 'lib/handlebars-v1.3.0',
		'underscore' : 'lib/underscore-min',
		'grtc' : 'lib/grtc'
	},
    modules: [
        {
            name: "app",
            exclude: [ "infrastructure" ]
        },
        {
            name: "infrastructure"
        },        
    ]
})