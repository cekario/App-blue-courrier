Ext.define('Yamma.view.gridactions.PrintAsPdf', {

	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',	
	
	icon : Yamma.Constants.getIconDefinition('printer').icon,
	tooltip : 'Imprimer (pdf)',
	
	actionUrl : 'alfresco://bluexml/yamma/retrieve-reply-nodes',
	method : 'GET',
	
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_MARK_AS_SENT,
	supportBatchedNodes : true,
	
	WS_URL : 'alfresco://bluexml/yamma/merge-to-pdf?nodeRefs={nodeRefs}&doubleSided={doubleSided}',
	doubleSided : true,
		
	prepareBatchAction : function(records) {
		
		var 
			me = this,
			args = arguments
		;
		
		Bluexml.windows.ConfirmDialog.FR.show({
			title: 'Imprimer en recto-verso?',
            msg: "L'impression recto-verso ajoutera les pages blanches nécessaires pour séparer correctement les documents assemblés en un seul fichier.",
			icon : Ext.Msg.QUESTION,
			buttons: Ext.Msg.YESNO,
			fn : onButtonClicked 
		});
		
		function onButtonClicked(buttonId) {
			
			if ('yes' != buttonId && 'no' != buttonId) return;
			me.doubleSided = ('yes' === buttonId);
			
			var params = ['preparationReady'].concat(Ext.Array.slice(args));
			me.fireEvent.apply(me, params);
			
		}
		
	},	
	
	onSuccess : function(jsonResponse) {
		
		if (jsonResponse && jsonResponse.nodes) {
			
			var 
				nodeOutcomes = Ext.Object.getValues(jsonResponse.nodes),
				nodeReplies = Ext.Array.map(nodeOutcomes, function(outcome) {return outcome.replies;}),
				flatReplyNodeRefs = Ext.Array.flatten(nodeReplies)
			;
		
			this.openPdfResultWindow(flatReplyNodeRefs);
		}
		
		this.callParent(arguments);
	},
	
	openPdfResultWindow : function(nodeRefList) {
		
		var 
			nodeRefCommaSeparatedList = nodeRefList.join(','),
			url = Bluexml.Alfresco.resolveAlfrescoProtocol(this.WS_URL)
				.replace(/\{nodeRefs\}/, nodeRefCommaSeparatedList)
				.replace(/\{doubleSided\}/, this.doubleSided)
			
		;
		
		window.open(url, '_blank');
		
	}
	
});