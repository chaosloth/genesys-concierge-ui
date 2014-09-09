define({
	DEBUG : true,
	API_BASE_URI : "http://journey.genesysdemo.com:9990",
	API_SUBMITER_URL: "http://journey.genesysdemo.com:9990/concierge/api/",
	AGENT_DEFAULT_CHANNEL: 'workitem',
	AGENT_CHANNELS : ['workitem'],

	IXN_INBOUND_QUEUE: "ConciergeHTCC.default.Concierge_In",	
	IXN_OUTBOUND_QUEUE: "ConciergeHTCC.default.Concierge_Out",
	
	COMPLETED_QUEUE : 'ConciergeHTCC.default.Concierge_Out'
});