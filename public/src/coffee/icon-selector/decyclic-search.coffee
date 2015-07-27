objects = searchValue = searchResult = null

derez = (value, path) ->
	# The derez recurses through the object, performing the deep search
	i = name = nu = null

	# typeof null === 'object', so go on if this value is really an object but not
	# one of the weird builtin objects.

	return if searchResult?

	if (typeof value is 'object' and value isnt null and
	!(value instanceof Boolean) and
	!(value instanceof Date) and
	!(value instanceof Number) and
	!(value instanceof RegExp) and
	!(value instanceof String))

		# Check if we've seen the object before
		return if objects.indexOf(value) isnt -1

		# Otherwise, accumulate the unique value and its path.
		objects.push(value);

		# If it is an array, derez all the values
		if Object.prototype.toString.apply(value) is '[object Array]'
			for val, index in value
				return if searchResult?
				derez val, "#{path}[#{index}]"

		else # If it is an object, replicate the object.
			for own propName, propVal of value
				return if searchResult?
				derez propVal, "#{path}[#{ JSON.stringify(propName) }]"

	else if value == searchValue
		searchResult =
				v: value,
				p: path
	return
	
clearValues = ->
	objects = searchValue = searchResult = null

decyclicSearch = (object, searchVal) ->
	###
	 Finds a value in an object that may contain circular references.
	 Stores objects encountered and the path as it iterates
	###
	objects = []
	searchValue = searchVal
	derez object, '$'
	result = searchResult
	do clearValues
	return result

angular.module 'iconSelector'
.service 'decyclicSearch', ->
	search: decyclicSearch