define(
	['jquery','genesys/config','genesys/utilities','eventemitter'],
	function($, config, util, EventEmitter){

	var debug = true;
	var log_prefix = "Concierge M.O.M. - ";
	
	var customerId = '';
	var serviceId = '';
	var impressionCount = 0;
	
	var serviceTimer = {};
	var displayTimer = {};
	
	var setServiceId = function (id) {
		serviceId = id;
	}
	
	var getServiceId = function () {
		return serviceId;
	}
	
	var getCustomerId = function () {
		return customerId;
	}
	
	var setCustomerId = function (id) {
		customerId = id;
	}
	
	var post = function(url, data, cbSuccess, cbDone) {
		
		var request = {
			url: url,
			type: 'POST',
			data: data,
			headers: {
				'Content-Type' : 'application/json'
			},
			crossDomain: true,
			handleAs: 'json', 
			success: cbSuccess,
			done: cbDone
		};
	
		console.log('Sending POST ' + url + ' ' + data);
		$.ajax(request);
	};
	
	
	
	/*********************************************
	 * Context Rules Functions
	 *********************************************/
	 
	var buildProxyUri = function (service) {
		if(config.USE_API_PROXY == true) {
			return config.API_PROXY + service;
		} else {
			return service;
		}
	}
	
	var buildMapperUri = function (service) {			
		return config.API_CONCIERGE + service;
	}
	
	var buildCsUri = function (service) {
		var url = config.API_REST_CS;
			url += service;
		return buildProxyUri(url);
	}
	
	var insertJourneyState = function (state, callback) {
		var url = buildCsUri("services/" + getServiceId() + "/states/start");
		
		var data = { 
		  "application_type": 8,
		  "application_id": 4,
		  "est_duration": 643,
		  "state_type": state,  
		  "media_type": "web",
		  "resource_id": 3,
		  "resource_type": 2
		};
		
		$.ajax({ url: url,
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify(data),
			success:  callback
		});	
	}
	
	var completeJourneyState = function (stateId) {
		var url = buildCsUri("services/" + getServiceId() + "/states/" + stateId + "/end");
		
		var data = { 
		  "est_duration": 30,
		  "media_type": "web"
		};
		
		$.ajax({ url: url,
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify(data),
			success:  function(reponseData) 
			{
				if(debug) console.log("Journey [" + reponseData + "] completed");
			 }
		});
		
	}
	
	var getAllStates = function (id, callback) {
		var url = buildCsUri("services/" + id);
			url += "?active_states=true&completed_states=true&active_tasks=true&completed_tasks=true";
				
		$.ajax({ url: url,
			type: "GET",
			contentType: 'application/json',
			success:  callback
		});
		
	}
	
	var searchByPhone = function (phone, callback) {
		var url = buildCsUri("profiles?PEContactPhone.PhoneNumber=" + phone);
			url += "&extensions=PEContactPhone&include_profile=yes";
			
		$.ajax({ url: url,
			type: "GET",
			contentType: 'application/json',
			success:  callback
		});
	}
	
	var associate = function (body, callback) {
		var url = buildCsUri("customers/" + getCustomerId() + "/services/" + getServiceId());
		post(url, JSON.stringify(body), callback, null);
	}	
	
	var init = function () {
	}
	
	return {
		setServiceId : setServiceId,
		getServiceId : getServiceId,
		setCustomerId : setCustomerId,
		getAllStates : getAllStates,
		searchByPhone : searchByPhone,
		associate : associate
	};
	
});