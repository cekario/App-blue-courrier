Ext.define('Bluedolmen.view.utils.DownloadFrame', {

	extend : 'Ext.ux.ManagedIframe.Component',
	
	DOWNLOAD_DOCUMENT_WS_URL : 'alfresco://api/node/content/',	
	
	singleton : true,
	
	renderTo : Ext.getBody(),
	hidden : true,
	
	download : function(uri) {
		if (!uri) return;
		
		this.setSrc(uri);
	},
	
	downloadDocument : function(nodeRef, name) {
		
		if (!Bluedolmen.Alfresco.isNodeRef(nodeRef)) {
			Ext.Error.raise('IllegalArgumentException! The provided nodeRef \'' + nodeRef + '\' is not valid.');
		}
		
		var resolvedUrl = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
			this.DOWNLOAD_DOCUMENT_WS_URL + nodeRef.replace(/:\//,'') + (name ? '/' + name : '') + '?a=true'
		);
		
		this.download(resolvedUrl);
		
	}		
	
});