define(
	['jquery', 'jquery.mobile', 'app/config','app/utilities','app/ui/default','handlebar'],
	function($, mobile, config,util,ui, handlebar){
		/**
		 * @memberOf App
		 */
		var log_prefix = "Application Module - ";
		
		var initializeFragments = function() {
			util.log(log_prefix + "initializeFragments()");
			
			$.getJSON(config.API_UI_FRAGMENTS , function(data) {
				 var li = '';
				 $.each(data, function(index, item){
					 if(item.enabled != 'true') return;
					 
					 var html;
					 var data;
	
					 html = util.syncGet(item.src,'html');
					 data = util.syncGet(item.data,'json');
					 
					 //Attach Main Tab Content
					 var template = handlebar.compile(html);
					 var output = template(data);
					 
					 var visible = ((item.visible == 'true') ? '' : 'display:none');
					 var view = $('<div style="' + visible + '" id="' + item.id + '"></div>').addClass('tab-content');

					 $('#concierge-views').append(view.append($(output)));
					 $('#concierge-views').trigger('create');
					 
						
					 if(item.inmenu == 'true')  {
						li += '<li class="' + item.class + '"><a data-ajax="false" concierge-target="' + item.id + '">';
					
						//li += '<img class="ui-li-icon" src="' + item.img + '">';
						//li += item.label;
					
						li += '<img src="' + item.img + '">';
						li += '<h2>' + item.label + '</h2>';
						li += '<p>' + item.description + '</p>';
					
						li += '</a></li>';
					 }
					 
					 
					 //Attach Tab
//					 if(data.tab_enabled == "true")
//					 {
//						 html = util.syncGet(config.APP_TAB_FRAGMENT,'html');
//						 template = handlebar.compile(html);
//						 output = template(data);
//						 $('#tab-list').append($(output));
//					 }
				 });
				 
				// Append to menu
				$("#main-page-left-nav-ul").append(li).promise().done(function () {
					 	try {
					 		$(this).listview("refresh");
					 	} catch(err) {
					 		util.log(log_prefix + " Inserted nav elements prior to initialisation, not a bad thing");
					 	}
				});
			});
		};
		
		var initialize = function() {
			util.log(log_prefix + "Initializing");
			
			initializeFragments();
			
			//initialize UI
			ui.initialize();
		};
		
		return {
			initialize : initialize
		};
});