ExtendDefaultObjects = () ->
	defaults = {}
	
	# Build the service provider
	{
		objectFor: (name, object) ->
				defaults[name] = object
				return this;
		,
		$get: ->	# Return the service provider based on it's configuration
			getObjectFor: (name) ->
				# defaults stored as key-values in 'defaults' object
				for objName, obj of defaults
					return obj if objName is name
			,
			extendObject: (name, object) ->
				angular.extend({}, @getObjectFor(name), object);
	}
	

ExtendDefaultFilter = (extendDefaultObjects) ->
	(input, name) ->
		extendDefaultObjects.extendObject name, input
		
angular.module 'shows'
.provider 'extendDefaultObjects', ExtendDefaultObjects
.filter 'extendDefault', ['extendDefaultObjects', ExtendDefaultFilter]
