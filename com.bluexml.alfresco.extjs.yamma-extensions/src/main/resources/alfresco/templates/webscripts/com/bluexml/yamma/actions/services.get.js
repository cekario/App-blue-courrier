///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:alfresco/templates/webscripts/com/bluexml/yamma/actions/services.lib.js">

(function() {

	var 
		depth = 1,
		rformat = 'tree',
		parentService = 'root',
		showMembership = false,
		treeNodes = []
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs('parentService', 'depth', 'rformat', 'membership');
		parentService = parseArgs['parentService'] || 'root';
		depth = Number(parseArgs['depth']) || 1;
		depth = (-1 == depth) ? Number.MAX_VALUE : depth;
		rformat = parseArgs['rformat'] || 'tree';
		showMembership = 'true' === Utils.asString(parseArgs['membership']);
		
		main();
	});
	
	function main() {
		
		treeNodes = Yamma.ServicesTreeHelper.getTreeNodes(parentService, depth, nodeDecorator);
		if ('list' == rformat) {
			flattenTree();
		}
		setModel();
		
	}
	
	function nodeDecorator(wrappedNode) {
		
		if (!showMembership) return;
		
		var 
			userName = Utils.Alfresco.getFullyAuthenticatedUserName(),
			membership = ServicesUtils.getServiceRoles(wrappedNode.name, userName)
		;
		
		wrappedNode.membership = membership; 
		
	}
	
	function flattenTree() {
		
		var result = [];
		
		// walk the tree depth-first
		function flattenTreeInternal(treeNodes) {
						
			Utils.forEach(treeNodes, function(treeNode) {
				result.push(treeNode);
				var children = treeNode.children || [];
				flattenTreeInternal(children);
			});
			
		}

		flattenTreeInternal(treeNodes);
		treeNodes = result;
	}
	
	function setModel() {
		
		model.rformat = rformat;
		model.items = treeNodes;
		
	}
	
})();