<#import "item.lib.ftl" as itemLib />
<#macro displayResults>
<#escape x as jsonUtils.encodeJSONString(x)>
{
	"totalRecords": ${data.paging.totalRecords?c},
	"startIndex": ${data.paging.startIndex?c},
	"itemCount" : ${data.count?c},
	<#if metadata??>
	"metaData" : <@itemLib.renderObject metadata />,
	</#if>
	<#if data.query??>
	"query" : ${data.query},
	</#if>
	"${params.rootName}": [
	<#list data.items as item>
		<@itemLib.renderObject item /><#if item_has_next>,</#if>
	</#list>
	]
}
</#escape>
</#macro>
