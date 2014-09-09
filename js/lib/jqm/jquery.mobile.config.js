define(
	['jquery'],
	function($){
	$(document).on("mobileinit",function(){
		$.support.cors = true;
		//$.mobile.buttonMarkup.hoverDelay = 0;
		$.mobile.allowCrossDomainPages = true;
	});
});