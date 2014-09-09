define(
	['gws/config','gws/utilities'],
	function(config, util){
		var log_prefix = "IXN HTTP Module - ";
		
		var get = function(params, callback) {
			var request = {
		            url: util.createSubmitterUri(params.uri),
		            type: 'GET',
					crossDomain: true,
		            success: function (result) {
		                if (params.callback) {
		                    params.callback(result);
		                }
		            },
		            error: function (result) {
						
						if (params.error) {
							params.error(result);
						}
		            },
		            success: callback
		        };
		        
				util.log(log_prefix + 'Sending GET ' + params.uri);
		        $.ajax(request);
		};
		util.log(log_prefix + "Initialized get()");
		
		var post = function(params, cbSuccess, cbError, cbDone) {
			var data = JSON.stringify(params.json, undefined, 2);
		
		    var request = {
		        url: util.createSubmitterUri(params.uri),
		        type: 'POST',
				data: data,
		        headers: {
		            'Content-Type' : 'application/json'
		        },
				crossDomain: true,
		        handleAs: 'json', 
		        error: function (result) {
					if (params.error) {
						params.error(result);
					}
		        },
		        success: cbSuccess,
		        error: cbError,
		        done: cbDone
		    };
		
			util.log(log_prefix + 'Sending POST ' + params.uri + ' ' + data);
		    $.ajax(request);
		};
		util.log(log_prefix + "Initialized post()");
		
		util.log(log_prefix + "Initialized");
		
		return {
			get : get,
			post : post
		};
});