define(
	['jquery','store','require'],
	function($,store, require){
	/**
	 * @memberOf utilities
	 */
	var log_prefix = "Application Utilities Module - ";
	var config = require('./config');
	
	var log = function(message) {
		if(config.DEBUG === true)
		{
			console.log(message);
		}
	};
	log(log_prefix + " Initialized Log Function");
	
	var isNull = function(value)
	{	
		if(typeof value === "undefined")
		{
			return true;
		}
		else if(typeof value == "undefined")
		{
			return true;
		}
		else if(value == undefined)
		{
			return true;
		}
		else if(value.length == 0)
		{
			return true;
		}
		else if(jQuery.isEmptyObject(value))
		{
			return true;
		}
		else if(value)
		{
			return false;
		}
	};
	log(log_prefix + "Initialized isNull Function");
	
	var activatePage = function(page, animation, save)
	{
		if(save == true)
		{
			store.app.getAppState().last_page = page;
			store.app.saveAppState();
		}
		
		log(log_prefix + "*** CHANGING PAGE ***");
		$.mobile.changePage($(page), animation);
	};
	log(log_prefix + "Initialized Activate Page Function");
	
	var adjustContentHeight = function(element, extra, withoutFooter)
	{
		var log_prefix = "adjustContentHeight() - ";
		log(log_prefix + "Started");
		
		scroll(0, 0);
		var screen = $.mobile.getScreenHeight();

		var header = $(".ui-header").hasClass("ui-header-fixed") ? $(".ui-header").outerHeight()  - 1 : $(".ui-header").outerHeight() - 1;

		var footer = $(".ui-footer").hasClass("ui-footer-fixed") ? $(".ui-footer").outerHeight() - 1 : $(".ui-footer").outerHeight() - 1;

		var contentCurrent = $(element).outerHeight() - $(element).height();
		
		footer = ((withoutFooter) ? 0 : footer);
		
		var content = screen - header - footer - contentCurrent;
		
		if($.isArray(extra))
		{
			$.each(extra,function(index , value){
				content = content - $(value).outerHeight();
			});
		}

		$(element).height(content);
	};
	log(log_prefix + "Initialized Adjust Content Height Function");
	
	var activateTab = function(tab) {
		//hide the sibling
		log($('#' + tab));
		$('#' + tab).show().siblings('.tab-content').hide();
		
		//store last tab in storage
		store.app.getAppState().last_tab = '#' + tab;
		store.app.saveAppState();
	};
	log(log_prefix + "Initialized Activate Tab");
	
	var checkCordova = function()
	{
		if(/^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent))
		{
			return true;
		}
		return false;
	};
	log(log_prefix + "Initialized Check Cordova");
	
	var syncGet = function(src,datatype)
	{
		
		var result; 
		 $.ajax({
			 	url : src,
			 	type: 'get',
			 	dataType: datatype,
			 	async : false,
			 	success: function(data) {
			 		result = data;
			 	}
			 }
		 );
		 
		 return result;
	};
	log(log_prefix + "Sync Get");
	
	var promptConfirm = function(header,message, yes, no)
	{
		$('#dialog-confirm .ui-header h1').text(header);
		$('#dialog-confirm .ui-content p').text(message);
		$('#dialog-confirm .ui-footer #btnYes').off('click');
		$('#dialog-confirm .ui-footer #btnNo').off('click');
		$('#dialog-confirm .ui-footer #btnYes').click(yes);
		$('#dialog-confirm .ui-footer #btnNo').click(no);
		$('#dialog-confirm .ui-footer #btnYes').click(function(){
			$('#dialog-confirm').popup("close");
		});
		$('#dialog-confirm .ui-footer #btnNo').click(function(){
			$('#dialog-confirm').popup("close");
		});
		$('#dialog-confirm .ui-content').height('100px');
		$('#dialog-confirm .ui-content').width('300px');
		$('#dialog-confirm').popup();
		$('#dialog-confirm').popup("open");
	};
	log(log_prefix + "Initialized Prompt User");
	
	var promptOk = function(header,message)
	{
		$('#dialog-prompt .ui-header h1').text(header);
		$('#dialog-prompt .ui-content p').text(message);
		$('#dialog-prompt #btnOk').click(function(){
			$('#dialog-prompt').popup("close");
		});
		$('#dialog-prompt .ui-content').height('100px');
		$('#dialog-confirm .ui-content').width('300px');
		$('#dialog-prompt').popup();
		$('#dialog-prompt').popup("open");
	};
	log(log_prefix + "Initialized Prompt User");
	
	
	var getURLParameter = function (url, name) {
  		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url)||[,""])[1].replace(/\+/g, '%20'))||null
	}
	log(log_prefix + "getURLParameter() Defined");
	
	return {
		log : log,
		isNull: isNull,
		activatePage : activatePage,
		activateTab : activateTab,
		adjustContentHeight : adjustContentHeight,
		checkCordova : checkCordova,
		syncGet : syncGet,
		promptConfirm : promptConfirm,
		promptOk : promptOk,
		getURLParameter : getURLParameter
	}
});