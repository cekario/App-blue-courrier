package org.bluedolmen.alfresco.workflows.jbpm;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;

public class ReassignCredentialGroupMemberTester extends ReassignCredentialTester {

	private Set<String> groupNames = new HashSet<String>();
	
	@Override
	public boolean canReassign(String taskId, String userName) {
		
		final AuthorityService authorityService = getServiceRegistry().getAuthorityService();

		for (String groupName : groupNames) {
			final Set<String> containedAuthorities = authorityService.getContainedAuthorities(AuthorityType.USER, groupName, false /* immediate */);
			if (containedAuthorities.contains(userName)) return true;
		}
		
		return false;
		
	}
	
	public void setGroupNames(List<String> groupNames) {
		this.groupNames.addAll(groupNames);
	}

}
