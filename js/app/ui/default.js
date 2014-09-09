define(
	['jquery','app/config','app/utilities','fastclick','store','app/ui/login-page','app/ui/main-page','jquery.mobile'],
	function($,config,util,fastclick,store,loginpage,mainpage){
		/**
		 * @memberOf ui
		 */
		var log_prefix = "UI Module - ";
		
		var restoreAppState = function() {
			util.log(log_prefix + "restoreAppState() fired");
			
			//Check if the application has a saved state
			if(util.isNull(store.app.getAppState().last_page))
			{
				if(window.location.hash != "#login-page")
				{
					if(!util.isNull(window.location.hash))
					{
						util.log(log_prefix + "restoreAppState() - Navigating to login-page");
						window.location.href = config.APP_ROOT;
						store.app.clearAppState();
						return;
					}
				}
			}
			else
			{
				util.log(log_prefix + "restoreAppState() - Navigating to last known page");
				util.activatePage(store.app.getAppState().last_page,"pop",false);
			}
			
			util.log(log_prefix + "restoreAppState() - Completed");
		};
		
		var initialize = function() {
			util.log(log_prefix + "Initializing");
						
			$( document ).on('pageshow','#main-page',function(){
				util.log("On page show fired ****");
				mainpage.initialize();
			});
			
			//Page Initialization
			loginpage.initialize();
			
			//Initialize FastClick
			fastclick.attach(document.body);
			
			//Resize Handler
			$(function() {
				// Resize content
				$( window ).on( "throttledresize", function(event) {
					util.adjustContentHeight('#main-page .ui-content-fullpage');
					util.adjustContentHeight("div[concierge-view]");
					util.adjustContentHeight("iframe[concierge-iframe]", null, true);					
				});
			});
						
			if(config.AUTHENTICATION_REQUIRED == false)
			{
				util.log("Authentication is not required, go to Main Page");
				util.activatePage('#main-page',"pop",true);
			}
			
			//Restore App State
			restoreAppState();

			$('#splashscreen').fadeOut(500);
			util.log("UI finished init. (Complete)");			
		};
		
		return {
			initialize : initialize
		};
});