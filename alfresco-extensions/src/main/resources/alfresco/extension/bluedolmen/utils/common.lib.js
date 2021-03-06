const 
	THUMBNAIL_NAME = "doclib", 
	TYPE_SITES = "st:sites", 
	PREF_DOCUMENT_FAVOURITES = "org.alfresco.share.documents.favourites", 
	PREF_FOLDER_FAVOURITES = "org.alfresco.share.folders.favourites" 
;
   

var Common = {
	/**
	 * Cache for person objects
	 */
	PeopleCache : {},

	/**
	 * Gets / caches a person object
	 *
	 * @method getPerson
	 * @param username {string} User name
	 */
	getPerson : function Common_getPerson(username) {
		
		if (username == null || username == "") return null;

		var person = Common.PeopleCache[username];
		if (typeof person == "object") return person; // already cached 
		
		// Cache the new person
		person = newPerson(username);
		Common.PeopleCache[username] = person;

		return person;
		
		
		function newPerson(username) {
			
			var person = people.getPerson(username);
			if (person == null) return newUnknownPerson(username);
			
			var newPerson = {
				userName : person.properties.userName,
				firstName : person.properties.firstName,
				lastName : person.properties.lastName,
				displayName : (person.properties.firstName + " " + person.properties.lastName).replace(/^\s+|\s+$/g, "")
			};
			
			if (person.assocs["cm:avatar"] != null) {
				newPerson.avatar = person.assocs["cm:avatar"][0];
			}
			
			return newPerson;
		}
		
		function newUnknownPerson(username) {
			
			if (username == "System" || username.match("^System@") == "System@") {
				// special case for the System users
				return {
					userName : "System",
					firstName : "System",
					lastName : "User",
					displayName : 'System User'
				};
			} 
				
			return {
				// missing person - may have been deleted from the database
				userName : username,
				firstName : "",
				lastName : "",
				displayName : username
			}
			
		}
	},

	/**
	 * Cache for group objects
	 */
	GroupCache : {},

	/**
	 * Gets / caches a group object
	 *
	 * @method getGroup
	 * @param groupname {string} Group name
	 */
	getGroup : function Common_getGroup(groupname) {
		if (groupname == null || groupname == "") {
			return null;
		}

		if (typeof Common.GroupCache[groupname] != "object") {
			var group = groups.getGroupForFullAuthorityName(groupname);
			if (group == null && groupname == "GROUP_EVERYONE") {
				group = {
					fullName : groupname,
					shortName : "EVERYONE",
					displayName : "EVERYONE"
				};
			}
			Common.GroupCache[groupname] = group;
		}
		return Common.GroupCache[groupname];
	},

	/**
	 * Cache for site objects
	 */
	SiteCache : {},

	/**
	 * Gets / caches a site object
	 *
	 * @method getSite
	 * @param siteId {string} Site ID
	 */
	getSite : function Common_getSite(siteId) {
		if (typeof Common.SiteCache[siteId] != "object") {
			Common.SiteCache[siteId] = siteService.getSite(siteId);
		}
		return Common.SiteCache[siteId];
	},

	/**
	 * Get the user's favourite docs and folders from our slightly eccentric Preferences Service
	 *
	 * @method getFavourites
	 */
	getFavourites : function Common_getFavourites() {
		var prefs = preferenceService.getPreferences(
				person.properties.userName, PREF_DOCUMENT_FAVOURITES), favourites = {}, arrFavs = [], strFavs, f, ff;
		try {
			/**
			 * Fasten seatbelts...
			 * An "eval" could be used here, but the Rhino debugger will complain if throws an exception, which gets old very quickly.
			 * e.g. var strFavs = eval('try{(prefs.' + PREF_DOCUMENT_FAVOURITES + ')}catch(e){}');
			 */
			if (prefs && prefs.org && prefs.org.alfresco
					&& prefs.org.alfresco.share
					&& prefs.org.alfresco.share.documents) {
				strFavs = prefs.org.alfresco.share.documents.favourites;
				if (typeof strFavs == "string") {
					arrFavs = strFavs.split(",");
					for (f = 0, ff = arrFavs.length; f < ff; f++) {
						favourites[arrFavs[f]] = true;
					}
				}
			}
			// Same thing but for folders
			prefs = preferenceService.getPreferences(
					person.properties.userName, PREF_FOLDER_FAVOURITES);
			if (prefs && prefs.org && prefs.org.alfresco
					&& prefs.org.alfresco.share
					&& prefs.org.alfresco.share.folders) {
				strFavs = prefs.org.alfresco.share.folders.favourites;
				if (typeof strFavs == "string") {
					arrFavs = strFavs.split(",");
					for (f = 0, ff = arrFavs.length; f < ff; f++) {
						favourites[arrFavs[f]] = true;
					}
				}
			}
		} catch (e) {
		}

		return favourites;
	},

	/**
	 * Generates a location object literal for a given node.
	 * Location is Site-relative unless a libraryRoot node is passed in.
	 *
	 * @method getLocation
	 * @param node {ScriptNode} Node to generate location for
	 * @param libraryRoot {ScriptNode} Optional node to work out relative location from.
	 * @return {object} Location object literal.
	 */
	getLocation : function Common_getLocation(node, libraryRoot) {
		var location = null, qnamePaths = node.qnamePath.split("/"), displayPaths = node.displayPath
				.split("/");

		if (libraryRoot == undefined && qnamePaths[2] != TYPE_SITES) {
			libraryRoot = companyhome;
		}

		if (libraryRoot) {
			// Generate the path from the supplied library root
			location = {
				site : null,
				siteTitle : null,
				container : null,
				path : "/"
						+ displayPaths.slice(
								libraryRoot.displayPath.split("/").length + 1,
								displayPaths.length).join("/"),
				file : node.name
			};
		} else if ((qnamePaths.length > 4) && (qnamePaths[2] == TYPE_SITES)) {
			var siteId = displayPaths[3], siteNode = Common.getSite(siteId), containerId = qnamePaths[4]
					.substr(3);

			if (siteNode != null) {
				location = {
					site : siteId,
					siteNode : siteNode,
					siteTitle : siteNode.title,
					container : containerId,
					containerNode : siteNode.getContainer(containerId),
					path : "/"
							+ displayPaths.slice(5, displayPaths.length)
									.join("/"),
					file : node.name
				};
			}
		}

		if (location == null) {
			location = {
				site : null,
				siteTitle : null,
				container : null,
				path : "/"
						+ displayPaths.slice(2, displayPaths.length).join("/"),
				file : node.name
			};
		}

		return location;
	}
};
