define(
		['underscore','jquery','gws','app/config','jquery.mobile'],
		function(_,$,gws,config){
			$( document ).on('pageshow','#main-page',function(){
		
			$('#coffee-tab-1').click();
			
			gws.ixn.on("interaction.submitted.success", function(data) {
				$.mobile.loading('hide');
				$("#formCoffeeMessage").val("Interaction submitted");
			});
			
			gws.ixn.on("interaction.submitted.error", function(data) {
				$.mobile.loading('hide');
				$("#formCoffeeMessage").val("Error occurred");
	
			});
	
			$('#btnCoffeeCancel').click(function() {
				$('#formCoffee')[0].reset();
				$("#btnCoffeeCreate").button('enable');
				$("#formCoffeeMessage").val('Not Submitted');
			});
	
			$('#btnCoffeeCreate').click(function() {
				$.mobile.loading('show');
				$("#btnCoffeeCreate").button('disable');
				var formData = $('#formCoffee').serializeArray();
				var data = {};
				_.each(formData, function(obj) { data[obj.name] = obj.value });
				gws.ixn.createWorkitemInteraction("Inbound", "InboundNew", config.IXN_INBOUND_QUEUE, data);
			});
		
		});
});