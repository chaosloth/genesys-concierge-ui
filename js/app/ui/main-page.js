define(
	['jquery','app/config','app/utilities','gws','store','app/ui/fragments/main','app/ui/component/workspace','app/ui/component/agent-state','app/ui/media/workitem','app/ui/component/workbin','jquery.mobile'],
	function($,config,util,gws,store,fragment,workspace,agentstate,workitem,workbin){
		/**
		 * @memberOf mainpage
		 */
		var log_prefix = "Main Page UI Module - ";
		var user = store.user.getUser();
		
		var initializeCometD = function() {
			util.log(log_prefix + "initializeCometD()");
			
			gws.on('cometd.connected', function(){
				util.log(log_prefix + "CometD Connected");
				gws.startSession(user.place);
			});
			
			gws.on('cometd.disconnected', function(){
				util.log(log_prefix + "CometD Disconnected");
				gws.endSession();
			});
			
			gws.start();
		};
		util.log(log_prefix + "initializeCometD() Defined");
		
		var initializeUI = function() {
			util.log(log_prefix + "initializeUI");
			
			//On Unload
			$( window ).on('beforeunload',function(){
				util.log('Unloading');
				gws.stop();
			});
			
			//document.title = config.APPLICATION_TITLE;
			
			AttachHandlers();
			
			//Restore Last Tab
			restoreTabs();
		};
		util.log(log_prefix + "initializeUI() Defined");
		
		var AttachHandlers = function() {
			$('*[concierge-target]').click(function(){
				var target = $(this).attr('concierge-target');
				
				console.log(target);
				
				if(target != undefined) {
					
					util.activateTab(target);
					
					// Show the footer for interactions only
					if(target == 'interactions') {
						$( "#footer" ).show();
					} else {
						$( "#footer" ).hide();
					}
					
					// Reset page height
					$.mobile.resetActivePageHeight();	
				}
			});
		};
		util.log(log_prefix + "AttachHandlers() Defined");
		
		var restoreTabs = function() {

			if(!util.isNull(store.app.getAppState().last_tab))
			{
				$(store.app.getAppState().last_tab).click();
			}
			else
			{
				$("#workspaceBtn").trigger('click');		
			}
		};
		util.log(log_prefix + "restoreTabs() Defined");
		
		
		
		
		var InitializeSwipeMenu = function() {
			$.event.special.swipe.scrollSupressionThreshold = 10; // More than this horizontal displacement, and we will suppress scrolling.
			$.event.special.swipe.horizontalDistanceThreshold = 30; // Swipe horizontal displacement must be more than this.
			$.event.special.swipe.durationThreshold = 500;  // More time than this, and it isn't a swipe.
			$.event.special.swipe.verticalDistanceThreshold = 75; // Swipe vertical displacement must be less than this.

			$( document ).on( "swipeleft swiperight", "#main-page", function( e ) {
				// We check if there is no open panel on the page because otherwise
				// a swipe to close the left panel would also open the right panel (and v.v.).
				// We do this by checking the data that the framework stores on the page element (panel: open).
				if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
					if ( e.type === "swipeleft"  ) {
						// $( "#right-panel" ).panel( "open" );
					} else if ( e.type === "swiperight" ) {
						$( "#main-page-left-nav" ).panel( "open" );
					}
				}
			});

		}
		util.log(log_prefix + "InitializeSwipeMenu() Defined");
		
		
		
		var initialize = function() {			
			util.log(log_prefix + "Initializing");
			//initialize fragment js
			fragment.initialize();
			
			//Initialize Title
			initializeUI();
			
			// Initialize Swipe
			InitializeSwipeMenu();
			
			//Initialize CometD
			initializeCometD();
			
			//Tab Initialization
			workspace.initialize();
			
			//Initialize Agent State UI Code
			agentstate.initialize();
			
			//Initialize Workbin UI Code
			workbin.initialize();
			
			//Initialize WorkItem UI Code
			workitem.initialize();
			
			//Initialize LogOut
			util.log(log_prefix + "Attaching #btnLogOut Handler()");
			$('.btn-logout').click(function(){
				store.app.getAppState().last_dialog = "#dialog-confirm-logout";
				store.app.saveAppState();
				$('#dialog-confirm-logout .ui-content').height("100px");
				$('#dialog-confirm-logout .ui-footer').height($("#btnLogoutCancel").outerHeight(true));
				$('#dialog-confirm-logout').popup( "open", {});
			});
			
			$('#btnLogoutCancel').click(function(){
				store.app.getAppState().last_dialog = '';
				store.app.saveAppState();
				$('#dialog-confirm-logout').popup( "close", {});
				util.log(log_prefix + "Logout cancelled");
			});
			
			$('#btnLogoutConfirm').click(function(){
				store.app.last_dialog = '';
				store.app.saveAppState();
				onBtnLogOutClick();
			});
			
			util.log(log_prefix + "Initialize() (Complete)");
		};
		
		function onBtnLogOutClick() {
			util.log("#mainPage() - onBtnLogOutClick");
			gws.stop();
			store.clear();
			util.activatePage("#start-page","pop",false);
		};
		
		return {
			initialize : initialize
		};
});