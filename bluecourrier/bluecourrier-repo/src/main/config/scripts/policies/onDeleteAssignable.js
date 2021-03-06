///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	// CHECKINGS
	
	var association = behaviour.args[0];
	if ('undefined' == typeof association) {
		logger.warn('[onUpdateAssignable] Cannot find any association reference.');
		return;
	}	
	
	// MAIN VARIABLES
	
	var documentNode = association.getSource();
	if (null == documentNode) return;
	
	// MAIN
	
	main();
	
	function main() {
		documentNode.properties[YammaModel.ASSIGNABLE_AUTHORITY_PROPNAME] = null;
		documentNode.save();
	}
	
})();
