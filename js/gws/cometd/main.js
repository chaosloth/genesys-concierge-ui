define(
	['jquery','gws/config','gws/utilities','store','gws/cometd/lib/jquery.cometd','eventemitter'],
	function($,config,util,store,cometd,EventEmitter) {
	/**
	 * @memberOf cometd
	 */
	var log_prefix = 'CometD Module - ';
	var ee = new EventEmitter();
	
	var connected = false;
	var subscription;
	
	//Private Methods
	var onConnect = function(message)
	{
		util.log(log_prefix + "onConnect()");
		
		if(cometd.isDisconnected())
		{
			return;
		}
		
		var wasConnected = connected;
		connected = message.successful;
		
		if(!wasConnected && connected)
		{
			ee.trigger('connected');
			util.log(log_prefix + " Connected...");
		} 
		else if (wasConnected && !connected)
		{
			util.log(log_prefix + " Connection Lost...");
		}
	};
	util.log(log_prefix + "Initialized onConnect Function");
	
	var onDisconnect = function(message)
	{
		util.log(log_prefix + "onDisconnect()");
		if(message.successful)
		{
			connected = false;
			ee.trigger('disconnected');
			util.log(log_prefix + "Disconnected");
		}
	};
	util.log(log_prefix + "Initialized onDisconnect Function");
	
	var onHandshake = function(handshake)
	{
		util.log(log_prefix + "onHandshake()");
		if(handshake.successful == true)
		{
			if(subscription)
			{
				cometd.unsubscribe(subscription);
			}
			
			subscription = cometd.subscribe('/v2/me/*', onMessage);
		}
	};
	util.log(log_prefix + "Initialized onHandshake Function");
	
	var onMessage = function(message) {
		util.log(log_prefix + "onMessage()");
		ee.trigger('message',[message]);
	};
	util.log(log_prefix + "Initialized onMessage Function");
	
	//Public Methods
	var on = function(event, callback) {
		util.log(log_prefix + "on() - " + event);
		ee.on(event,callback);
		util.log(log_prefix + "on() - " + event + " - Completed");
	};
	util.log(log_prefix + "Initialized on() Function");
	
	var off = function(event, callback) {
		util.log(log_prefix + "off() - " + event);
		ee.off(event,callback);
		util.log(log_prefix + "off() - " + event + " - Completed");
	};
	util.log(log_prefix + "Initialized off() Function");
	
	var connect = function()
	{
		util.log(log_prefix + "connect()");
		var user = store.user.getUser();
		
		cometd.unregisterTransport("websocket");
		cometd.configure({
			url : util.createUri("/api/v2/notifications"),
			requestHeaders : {
				Authorization : util.encodeBasic(user.username, user.password)
			},
			logLevel : "info"
		});
		
		cometd.handshake();
		
		util.log(log_prefix + "connect() - Completed");
	};
	util.log(log_prefix + "Initialized Connect Function");
	
	var disconnect = function()
	{
		util.log(log_prefix + "disconnect()");
		cometd.disconnect();
		util.log(log_prefix + "disconnect() - Completed");
	};
	util.log(log_prefix + "Initialized Disconnect Function");
	
	util.log(log_prefix + "Initializing");
		cometd.addListener('/meta/handshake', onHandshake);
		util.log(log_prefix + "Added Listener /meta/handshake");
		cometd.addListener('/meta/connect', onConnect);
		util.log(log_prefix + "Added Listener /meta/connect");
		cometd.addListener('/meta/disconnect', onDisconnect);
		util.log(log_prefix + "Added Listener /meta/disconnect");
	util.log(log_prefix + "Initialized");
	
	return {
		on : on,
		off : off,
		connect : connect,
		disconnect : disconnect
	}
});