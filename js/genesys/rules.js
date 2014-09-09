define(
	['jquery','genesys/config','genesys/utilities','eventemitter'],
	function($, config, util, EventEmitter){

	var debug = true;
	var log_prefix = "Concierge Rules - ";
	
	var packageName = config.GRE_PACKAGE;
	
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
	 * Functions from Composer common.js
	 *********************************************/
	 var br_initKbRequest = function () {
	 	var kbRequest = new Object();
	 	var kbRequestBody = new Object();
	    
		var inOutFacts = new Object();
		var namedFact = new Array();
		
		inOutFacts['named-fact'] = namedFact;
		kbRequestBody['inOutFacts'] = inOutFacts;
		kbRequest['knowledgebase-request'] = kbRequestBody;

		return kbRequest;
	}

	var br_addFact = function (kbRequest, fact) {
		var fArray = kbRequest['knowledgebase-request']['inOutFacts']['named-fact'];
		fArray.push(fact);
	}

	var br_getResultFacts = function (result) {
	
		if (typeof result == 'undefined' || result == null ||
			typeof result['knowledgebase-response'] == 'undefined' || result['knowledgebase-response'] == null || 
			typeof result['knowledgebase-response']['inOutFacts'] == 'undefined' || result['knowledgebase-response']['inOutFacts'] == null || 
			typeof result['knowledgebase-response']['inOutFacts']['named-fact'] == 'undefined' || 
			result['knowledgebase-response']['inOutFacts']['named-fact'] == null) {
		
			return null;
		}
	
		return result['knowledgebase-response']['inOutFacts']['named-fact'];
	}
	
	/*********************************************
	 * Rule Functions
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
	
	
	var buildGreUri = function (service) {
		var url = config.API_REST_GRE;
			url += service;
		return buildProxyUri(url);
	}
	
	
	var prepareRuleRequest = function (phase) {
		var kbRequest = br_initKbRequest();
		var f;
		f = new Object(); 
		f['id'] = 'environment';
		f['fact'] = new Object();
		f['fact']['@class'] = 'retail._GRS_Environment';
		f['fact']['phase'] = phase; // Examples: "Qualification",  "Segmentation", "Target Selection"
		br_addFact(kbRequest, f);
		
		return kbRequest;
	}
	
	var addFact = function (kbRequest, key, value) {
		f = new Object(); 
		f['id'] = key;
		f['fact'] = new Object();
		f['fact']['@class'] = 'retail.RetailBridge';
		f['fact'][key] = value;
		br_addFact(kbRequest, f);
	}
	
	var executeRuleInternal = function (data, callback) {
		// CALL CS
		if(debug) console.log("Executing rule");
		
		var url = buildGreUri("/knowledgebase/" + encodeURI(packageName));
		
		$.ajax({ url: url,
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify(data),
			success:  function(reponseData) 
			{
				if(debug) console.log(reponseData);
				var result = br_getResultFacts(reponseData);
				if(debug) console.log(result);
				
				var fact = result[1]['fact'];
				callback(fact);
			 }
		});
	}

	var executeRule = function(phase, data, callback) {
		
		var ruleRequest = prepareRuleRequest(phase);	

		$.each(data, function(key, value) {
			addFact(ruleRequest, key, value);
		});

		executeRuleInternal(ruleRequest, callback);	
	}
	
	var init = function () {
		// Do any initialisation here
	}
	
	return {
		executeRule :  executeRule
	};
	
});