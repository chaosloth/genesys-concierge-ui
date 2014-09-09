define(
	['gws/utilities','store'],
	function(util,store) {
		var log_prefix = "HTTP Module - ";
		var user = store.user.getUser();
		
		var get = function(params) {
			var request = {
		            url: util.createUri(params.uri),
		            type: 'GET',
					crossDomain: true,
					xhrFields: {
					    withCredentials: true
					},
		            success: function (result) {
		                if (params.callback) {
		                    params.callback(result);
		                }
		            },
		            error: function (result) {
						
						if (params.error) {
							params.error(result);
						}
						
						util.log(result);
		            }
		        };

		        request.beforeSend = function (xhr) {
					xhr.setRequestHeader('Authorization', util.encodeBasic(user.username, user.password));
				};
				
				util.log(log_prefix + 'Sending GET ' + params.uri);
		        $.ajax(request);
		};
		util.log(log_prefix + "Initialized GET Function");
		
		var post = function(params) {
			var data = JSON.stringify(params.json, undefined, 2);

	        var request = {
	            url: util.createUri(params.uri),
	            type: 'POST',
				data: data,
	            headers: {
	                'Content-Type' : 'application/json'
	            },
				crossDomain: true,
				xhrFields: {
				    withCredentials: true
				},
	            handleAs: 'json', 
	            error: function (result) {
					if (params.error) {
						params.error(result);
					}
					util.log(result);
	            }
	        };

	        request.beforeSend = function (xhr) {
				xhr.setRequestHeader('Authorization', util.encodeBasic(user.username, user.password));
			};

			util.log(log_prefix + 'Sending POST ' + params.uri + ' ' + data);
	        $.ajax(request);
		};
		util.log(log_prefix + "Initialized POST Function");
		
		return {
			get : get,
			post : post
		};
});