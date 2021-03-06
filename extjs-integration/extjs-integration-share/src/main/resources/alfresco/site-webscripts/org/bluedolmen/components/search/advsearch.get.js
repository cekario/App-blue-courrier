/**
 * Advanced Search component GET method
 */

function main()
{
	var 
		siteId = (page.url.templateArgs["site"] != null) ? page.url.templateArgs["site"] : "",
		itemId = page.url.args["itemId"],
		formId = page.url.args["formId"],
		searchForm = null,
		searchForms = [];	
	
	if( null === formId ){
		formId="search";
	}
	
	if (null != itemId) {
		searchForm = getForm(itemId,formId);
	}
	
	if (null != searchForm) {
		searchForms.push(searchForm);
	}
	
	prepareModel();
	
   
	function getForm(itemId,formId) {
		
		var 
			formsElements = config.scoped["AdvancedSearch"]["advanced-search"].getChildren("forms"),
			formsElement = null,
			form = null,
			formValue = null
		;
		
		if (null == formsElements) return null;
		
		for (var i = 0, len_i = formsElements.size(); i < len_i; i++) {
			formsElement = formsElements.get(i).childrenMap['form'];
			
			for (var j = 0, len_j = formsElement.size(); j < len_j; j++) {
				form = formsElement.get(j);
				formValue = form.value;
				formIdValue = form.getAttribute("id");
				
				if (itemId == formValue && formId==formIdValue) return getFormDefinition(form);
			}
			
		}
		
		return null;
	}
	
	function getFormDefinition(formDescription) {
		
		// get optional attributes and resolve label/description text
		var formId = formDescription.attributes["id"];
		var type = formDescription.value;
         
		var label = formDescription.attributes["label"];
		if (!label) {
			var labelId = formDescription.attributes["labelId"];
			if (labelId) label = msg.get(labelId);
		}
		
		var desc = formDescription.attributes['description'];
		if (!desc) {
			var descId = formDescription.attributes['descriptionId'];
			if (descId) desc = msg.get(descId);
		}
        
		return {
			id : formId ? formId : 'search',
			type : type,
			label : label ? label : type,
			description : desc ? desc : ''
		};
		
	}
   	
   	function prepareModel() {
	   model.siteId = siteId;
	   model.searchForms = searchForms;   		
   	}

}

main();