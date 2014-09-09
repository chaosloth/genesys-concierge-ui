define(
	['jquery','app/config','app/utilities','gws','store','jquery.mobile'],
	function($,config,util,gws,store){
		/**
		 * @memberOf startpage
		 */
		var log_prefix = "Start Page UI Module - ";
		var user = store.user.getUser();
		
		var restoreLoginData = function()
		{
			util.log(log_prefix + "restoreLoginData()");
				$('#txtUsername').val(user.username);
				$('#txtPlace').val(user.place);
				$('#txtPassword').val(user.password);
				$('#chkbxRememberMe').checkboxradio();
				$('#chkbxRememberMe').prop('checked',user.remember_me).checkboxradio('refresh');
			util.log(log_prefix + "restoreLoginData() - Completed");
		};
		
		var isLoginInfoValid = function()
		{
			util.log(log_prefix + "checkLoginInfo()");
			var username = $('#txtUsername'),
				password = $('#txtPassword'),
				place = $('#txtPlace'),
				container = $('#loginErr'),
				message = $('#loginErr h4');
			
			if(util.isNull(username.val()))
			{
				message.html('Please Provide a Username');
				container.removeClass('hideValidationErr');
				return false;
			}
			else if(util.isNull(place.val()))
			{
				message.html('Please Provide a Place');
				container.removeClass('hideValidationErr');
				return false;
			}
			//else if(util.isNull(password.val()))
			//{
			//	message.html('Please Provide a Password');
			//	container.removeClass('hideValidationErr');
			//	return false;
			//}

			container.removeClass('hideValidationErr').addClass('hideValidationErr');
			return true;
			util.log(log_prefix + "checkLoginInfo() - Completed");
		};
		
		var onSuccessfulAuthentication = function(result)
		{
			util.log(log_prefix + "onSuccessfulAuthentication()");
			user.place = $('#txtPlace').val();
			user.remember_me = $('#chkbxRememberMe').prop('checked');
			user.uri = result.user.uri;
			store.user.saveUser();
			var container = $('#loginErr');
			container.addClass('hideValidationErr');
			util.activatePage('#main-page','pop',true);
			util.log(log_prefix + "onSuccessfulAuthentication()");
		};
		
		var onUnSuccessfulAuthentication = function(result)
		{
			util.log(log_prefix + "onUnSuccessfulAuthentication()");
			var container = $('#loginErr');
			var message = $('#loginErr h4');
			
			if(result.status == config.ERROR_STATUS_CODE)
			{
				message.html('Invalid Credentials');
			}
			else
			{
				message.html('Problem with System, Please Contact Administrator');
			}
			
			container.removeClass('hideValidationErr');
			store.user.forceClearUser();
		};
		
		var initialize = function() {
			util.log(log_prefix + "Initializing");
			
			//CJC: May need to drop this all together
			//util.adjustContentHeight('#start-page .ui-content-fullpage');
			
			//Initialize Headings
			//document.title = config.APPLICATION_TITLE;
			//$('#login-page #title').text(config.APPLICATION_TITLE);
			
			
			//Restore Login Data
			restoreLoginData();
			
			$('#btnLogin').click(function(){
				util.log(log_prefix + "Login Button Clicked");
				if(isLoginInfoValid())
				{
					user.username = $('#txtUsername').val();
					user.password = $('#txtPassword').val();
					user.place = $('#txtPlace').val();
					gws.authenticate(onSuccessfulAuthentication, onUnSuccessfulAuthentication);					
				}
			});
			
			util.log(log_prefix + "Initialize() (Complete)");
		};
		
		return {
			initialize : initialize
		};
});