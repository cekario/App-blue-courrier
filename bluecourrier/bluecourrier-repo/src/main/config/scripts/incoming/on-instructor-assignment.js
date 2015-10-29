///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">


(function() {

	var 
		document = Utils.Alfresco.BPM.getFirstPackageResource(),
		owner = Utils.wrapString(task.assignee), // is the task assigned?
		previousInstructorName = Utils.asString(execution.getVariable('bcinwf_instructor')),
		hasActorChanged = owner != previousInstructorName,
		serviceRole = Utils.asString(task.getVariable('bcinwf_serviceRole'));
	;
	
	if (null == document) return;
	
	if (null != owner) {
		giveRightsToActor(document);
	}
	
	if (!hasActorChanged) return; // no-extra work
	
	storeCurrentInstructor();
	logActorChange(document, owner);
	
	function storeCurrentInstructor() {
		
		execution.setVariableLocal('bcinwf_instructor', owner);

		if (!isProcessingRole()) return;
		
		if (null == owner) {
			bdNodeUtils.removeProperty(document, 'bcinwf:instructorUserName');
		}
		else {
			document.properties['bcinwf:instructorUserName'] = owner;
			document.save();
		}

	}
	
	function isProcessingRole() {
		
		return Yamma.DeliveryUtils.ROLE_PROCESSING == serviceRole;
		
	}
	
	function giveRightsToActor(/* ScriptNode */ documentNode, /* String */ role) {
		
		role = role || 'Contributor';
		
		var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
		documentContainer.setPermission(role, owner);
//		documentContainer.setPermission('Delete', owner); // also enable the user to move the document outside the inbox tray
		
	}
	
	function logActorChange(/* ScriptNode */ documentNode, /* String */ owner) {
		
		if (!owner) return;
		
		HistoryUtils.addEvent(documentNode, {
			eventType : 'reassign', 
			key : 'yamma.actions.reassign.processing',
			args : [ Yamma.DeliveryUtils.ROLE_LABELS[serviceRole] || '(Inconnu)', Utils.Alfresco.getPersonDisplayName(owner) ]
		});
		
	}
	
})();
