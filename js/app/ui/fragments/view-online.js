define(
	['underscore', 'jquery','genesys'],
	function(_, $, genesys, util){
		$( document ).on('pageshow','#main-page',function(){
			$("#online #btnSearch").on('click', function() {
				var phone = $("#txtScanPhoneNumber").val();
				genesys.dad.searchByPhone(phone, function(data) {
					console.log(data);
					
					$("noteAssociated").hide();
					
					if(!genesys.util.isNull(data)) {
					
						genesys.dad.setCustomerId(data[0].customer_id);
						
						var li = '<li data-role="list-divider">Customer Details</li>';
							li += '<li><span class="customer-attr-key">Title</span><span class="customer-attr-value">' + data[0].Title + '</span></li>';
							li += '<li><span class="customer-attr-key">First Name</span><span class="customer-attr-value">' + data[0].FirstName + '</span></li>';
							li += '<li><span class="customer-attr-key">Last Name</span><span class="customer-attr-value">' + data[0].LastName + '</span></li>';
							li += '<li><span class="customer-attr-key">Customer ID</span><span class="customer-attr-value">' + data[0].customer_id + '</span></li>';
							
						$("#customer-details-listview").empty();
						$("#customer-details-listview").append(li).promise().done(function () {
							$(this).listview("refresh");
						 });
					}
				});
			});
			
			$("#btnAssociate").on('click', function() {				
				var body = {"application_type": 8,"application_id": 4,"est_duration": 60,"media_type": "web","resource_id": 3,"resource_type": 2};
						
				genesys.dad.associate(body , function(data){
					console.log(data);
					$("#online #message").text("Data Associated");
				});
			});
			
			$('#online #btnRefreshJourney').on('click', function() {
				findJourney(genesys.dad.getServiceId());
			});
			
			var findJourney = function(coupon) {
			
				genesys.dad.setServiceId(coupon);
				
				genesys.dad.getAllStates(coupon, function(data) {
					console.log(data);
					var li = '<li data-role="list-divider">Customer Online Journey - Active States</li>';
					var activeStates = _.toArray(data.active_states);
					
					activeStates = activeStates.sort(function( obj1, obj2 ) {
						return obj1.started.timestamp < obj2.started.timestamp
					});
					
					_.each(activeStates, function(item, index){
						var icon = "tag";
						switch(item.state_type) {
							case 'DisplayAd': icon = "eye"; break;
							case 'GenerateCoupon': icon = "shop"; break;
						}
						
						var stateType = item.state_type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
						var mediaType = item.started.media_type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
						
						li += '<li><div class="ui-btn-icon-left ui-btn-inline ui-icon-' + icon + '"/>';
						li += '<span style="padding-left:20px" class="customer-attr-key">'+ stateType + '</span>';
						li += '<span style="padding-left:20px">' + mediaType + '</span>';
						li += '<span style="padding-left:60px">Active</span>';
						li += '<span class="ui-li-count">' + genesys.util.relative_time(Date.parse(item.started.timestamp)) + '</span></li>';
					});
					
					$("#list-journey-active").empty();
					$("#list-journey-active").append(li).promise().done(function () {
						$(this).listview("refresh");
					 });
					
					
					li = '<li data-role="list-divider">Customer Online Journey - Completed States</li>';
					
					var completedStates = _.toArray(data.completed_states);
					completedStates = completedStates.sort(function( obj1, obj2 ) {
						return obj1.started.timestamp < obj2.started.timestamp
					});
					
					_.each(completedStates, function(item, index){
						var icon = "tag";
						switch(item.state_type) {
							case 'DisplayAd': icon = "eye"; break;
							case 'GenerateCoupon': icon = "shop"; break;
						}
						
						var stateType = item.state_type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
						var mediaType = item.started.media_type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
						
						li += '<li><div class="ui-btn-icon-left ui-btn-inline ui-icon-' + icon + '"/>';
						li += '<span style="padding-left:20px" class="customer-attr-key">'+ stateType + '</span>';
						li += '<span style="padding-left:20px">' + mediaType + '</span>';
						li += '<span></span>';
						li += '<span class="ui-li-count">' + genesys.util.relative_time(Date.parse(item.started.timestamp)) + '</span></li>';
					});
					
					
					$("#list-journey-complete").empty();
					$("#list-journey-complete").append(li).promise().done(function () {
						$(this).listview("refresh");
					 });
					 
				});
			};			
			
			var doScan = function() {
				console.log("CJC: btn-scan pressed ");
				// **********************
				// * Trigger vibrate
				// **********************
				try {
					if ("vibrate" in navigator) navigator.vibrate(300);
				} catch(err) 
				{
					// Swallow
				}

				$("#online #message").text("");
				
				// **********************
				// * Barcode Scanner
				// **********************
				cordova.plugins.barcodeScanner.scan(
					function(result) {
						if (result.cancelled) {
							console.log("Scanning cancelled");
							$("#barcode-result").text("Scanning cancelled");
						} else {
							console.log("we got a barcode: " + result.text);
							var coupon = result.text.substr(result.text.lastIndexOf('=')+1)
							$("#barcode-result").text(coupon);
							findJourney(coupon);
						}
					},
					function(error) {
						console.log("Scanning failed " + error);
						$("#barcode-result").text("Scan error: " + error);
					}
				);		
			};
			
			
			$('.btnScan').on('click', function() {
				if(typeof cordova.plugins.barcodeScanner.scan != 'undefined') {
					doScan();
				} else {
					// Mock data
					findJourney("383-a111fdb5-feac-4be4-b07e-3153f5d59a37");
				}
			});
		});
	}
);