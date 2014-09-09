define({
	DEBUG : true,
	APPLICATION_TITLE : "Tablet Guru",
	ERROR_STATUS_CODE : 403,
	APP_ROOT : "/",
	
	DOAUTHENTICATION: true,
	AUTHENTICATION_REQUIRED : true,
	
	API_UI_FRAGMENTS: "fragments/fragments.json",
	APP_TAB_FRAGMENT : 'fragments/ui/tabs.html',
	

	//AGENT VISUAL
	AGENT_READY_CLASS: 'agent-status-ready',
	AGENT_NOTREADY_CLASS: 'agent-status-notready',
	AGENT_UNKNOWN_CLASS: 'agent-status-unknown',
	
	WORKSPACE_LABEL : "Meet & Greet",
	WORKSPACE_URL : "about:blank",
	
	//AGENT STATES
	AGENT_STATE_DEFAULT : 'NotReady',
	AGENT_STATES : ['NotReady','Ready'],
	
	//WORKBINS
	AGENT_WORKBINS: ['My Workbin'],
	AGENT_INPROGRESS_WORKBIN: 'In_Progress',
	
	//INTERACTION
	ACCEPT_TIMER_VALUE : 30,
	WORKITEM_LABEL : 'Active Task'
});