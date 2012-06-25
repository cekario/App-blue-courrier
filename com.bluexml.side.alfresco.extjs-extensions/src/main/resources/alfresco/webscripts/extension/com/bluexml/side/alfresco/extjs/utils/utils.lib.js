(function() {
	
	Utils = {};
	
	Utils.asString = function(object) {
		return '' + object;
	}
	
	/**
	 * Helper method that tests whether the given argument is a javascript Array
	 * 
	 * @param {Object}
	 *            object the object to be tested
	 */
	Utils.isArray = function(object) {
		
		return toString.call(object) === '[object Array]';
		
	};

	/**
	 * Apply an operation on each element of the given array
	 * <p>
	 * The loop can be broken by returning false on operation
	 */
	Utils.forEach = function(array, operation, reverse, scope) {
		
		if (! Utils.isArray(array)) {
			throw new Error('IllegalArgumentException! The provided array element is not a valid Array');
		}
		
		if (! (operation instanceof Function)) {
			throw new Error('IllegalArgumentException! The provided applyMethod is not a valid Function');
		}
		
		if (reverse) {
			for (var i = array.length - 1; i >= 0; i--) {
				if (false === operation.call(undefined === scope ? array[i] : scope, array[i]))
					break;				
			}
		} else {		
			for (var i = 0, len = array.length; i < len; i++) {
				if (false === operation.call(undefined === scope ? array[i] : scope, array[i]))
					break;
			}
		}
		
	};
	
	Utils.map = function(array, transform, reverse, scope) {		
		
		var result = [];
		
		Utils.forEach(
			array,
		
			/* operation */
			function(arrayElement) {
				var transformedValue = transform.call(undefined === scope ? arrayElement : scope, arrayElement);
				result.push(transformedValue);
			},
			
			reverse
		);		
		
		return result;
	};
	
	Utils.reduce = function(array, aggregateOperation, initValue, reverse, scope) {
		
		var aggregateValue = (initValue === undefined) ? {} : initValue;
		
		Utils.forEach(
			array,
			
			/* operation */
			function(arrayElement) {
				var postAggregateValue = aggregateOperation.call(undefined === scope ? arrayElement : scope, arrayElement, aggregateValue);
				if (undefined !== postAggregateValue) aggregateValue = postAggregateValue;
			},
			
			reverse
		);
		
		return aggregateValue;
	};
	
	Utils.filter = function(array, acceptFunction) {
		
		var filteredResult = [];
		
		Utils.forEach(array, function(arrayElement) {
			
			var accepted = acceptFunction(arrayElement);
			if ('undefined' == typeof accepted) return; // continue 
			
			if (accepted) filteredResult.push(arrayElement);
		});

		return filteredResult;
	};

    Utils.unwrapList = function(array) {
    	
		if (! Utils.isArray(array)) {
			throw new Error('IllegalArgumentException! The provided array element is not a valid Array');
		}
    	
		var len = array.length;
		if (0 == len) return null;
		if (1 == len) return array[0];
		
		return array;
    };
    
    Utils.ArrayToMap = function(array, keyFunction) {
    	
    	if (!array) return {};
    	
    	keyFunction = keyFunction || function(object) {return object.toString();}; // Default returns the toString() value
    	
    	var result = {};
    	Utils.forEach(array,
    		function(object) {
    			var key = keyFunction(object);
    			if (!key) return; // skip undefined keys
    			
    			result[key] = object;
    		}
    	);
    	
    	return result;
    }
	
	Utils.escapeQName = function(qname) {
		if (null == qname) {
			throw new Error('IllegalArgumentException! The provided QName is not valid');
		}
		
		return qname.replace(/:/,'\\:');
	};
	
	Utils.getLuceneAttributeFilter = function(propertyQName, value, encodeValue) {
		
		// !!! Mandatory here! Use an ancilliary variable else the returned result is undefined !!!
		var result =
			'@' +
			Utils.escapeQName(propertyQName) +
			':' +
			'\"' + (encodeValue ? search.ISO9075Encode(value) : value) + '\"';
		
		return result;
	}
	
	/**
	 * This is a slightly modified version of the ExtJS apply function which
	 * copy all the properties from config to object applying potential defaults
	 * (as a third argument)
	 */
    Utils.apply = function(object, config, defaults) {
    	
        if (defaults) {
            Ext.apply(object, defaults);
        }

        if (! (object && config && 'object' === typeof config ) ) return object;
        	
        for (var property in config) {
            object[property] = config[property];
        }

        return object;
    };
    
    Utils.applyIf = function(object, config) {
    	
        if (! (object && config && 'object' === typeof config ) ) return object;
    	
        for (var property in config) {
            if (undefined !== object[property]) continue;
			object[property] = config[property];
        }

        return object;
    };    
	
    Utils.merge = function(object, config) {
    	
        if (! (object && config && 'object' === typeof config ) ) return object;
    	
        for (var property in config) {
        	var value = object[property];
        	
            if (undefined === value) {
				object[property] = config[property];
            } else if (value && 'object' === typeof value) { // merge objects
            	
            	var mergedValue = config[property];
            	if (mergedValue && 'object' === typeof mergedValue) {
            		Utils.merge(value, mergedValue);
            	}
            	
            }
        }

        return object;    	
    	
    }    
    
    Utils.getPersonDisplayName = function(person) {
    	
    	if (isPersonScriptNode(person)) 
    		return Utils.getDisplayName(person.properties.firstName, person.properties.lastName);
    	
    	if ('string' == typeof person) {
    		return Utils.getDisplayName(person /* username */);
    	}
    	
    		
    	throw new Error('IllegalArgumentException! The provided person is not a valid person');
    	
    	return (person.properties.firstName + " " + person.properties.lastName).replace(/^\s+|\s+$/g, "");
    }
    
    Utils.getDisplayName = function(firstName, lastName) {
    	
    	if (undefined === lastName) {
    		// firstName is supposed to be a username
    		if (!firstName) {
    			throw new Error('IllegalArgumentException! At least the firstName or the userName has to be provided.');
    		}
    		
    		var username = firstName;
			var person = Common.getPerson(Utils.asString(username));
			firstName = person.firstName;
			lastName = person.lastName;			
    	}
    	
    	firstName = firstName || '';
    	lastName = lastName || '';
    	var displayName = firstName + (firstName ? ' ' : '') + lastName;
    	
    	return displayName.replace(/^\s+|\s+$/g, "");
    }
    
    function isPersonScriptNode(person) {
    	return (person && person.typeShort && 'cm:person' == '' + person.typeShort && person.properties);
    }
    
    Utils.getPersonUserName = function(person) {
    	
    	if (!person) return '';
    	if (isPersonScriptNode(person)) return Utils.asString(person.properties.userName);
    	// typeof person on ScriptNode throws an exception and has to be performed after the isPersonScriptNode test
    	if ('string' == typeof person) return person; 
    	
    	throw new Error('IllegalArgumentException! The provided person is not a valid person');
    	
    }
    
    Utils.getCurrentUserName = function() {
    	return Utils.getPersonUserName(person); // Use person global Object defined as the currently authenticated user
    }    
    
})();