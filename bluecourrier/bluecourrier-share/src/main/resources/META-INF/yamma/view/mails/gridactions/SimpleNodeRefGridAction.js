Ext.define('Yamma.view.mails.gridactions.SimpleNodeRefGridAction', {
	
	extend : 'Yamma.view.mails.gridactions.GridAction',
	
	supportBatchedNodes : false,	
	
	getParameters : function(record) {
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		return [documentNodeRef];
	},
	
	performBatchAction : function(records, preparationContext) {
		
		if (this.supportBatchedNodes) {
		
			var 
				me = this,
				documentNodeRefs = Ext.Array.map(records, function(record) {
					return me.getDocumentNodeRefRecordValue(record);
				}), 
				doPerformAction = this.fireEvent('beforePerform', this, null, {nodeRefs : documentNodeRefs}, this.grid)
			;
			if (false === doPerformAction) return; // continue
			this.performServerRequest(documentNodeRefs, preparationContext);
			
//			this.fireEvent('actionComplete', this, this.grid, arguments);
			
		} else {
			
			this.callParent(arguments);
			
		}
		
	},
	
	performAction : function(documentNodeRef, preparationContext) {
		
		this.performServerRequest(documentNodeRef, preparationContext);		
		this.callParent();
		
	},
	
	performServerRequest : function(nodeRefValue, preparationContext) {
		
		var 
			dataObj = {
				nodeRef : nodeRefValue
			},
			additionalRequestParameters = this.getAdditionalRequestParameters(preparationContext)
		;
		
		this.jsonRequest(Ext.applyIf(dataObj, additionalRequestParameters));
		
	},
	
	getAdditionalRequestParameters : function() {
		return null;
	}
	
	
});