saverDebounceRate = 1000
retries = 5

# Service just maps object methods to api urls
ShowSaver = (showData, $interval, $log, $rootScope) ->

	currentId = currentForm = currentShowObject =	currentModels = null
	newId = 'newId'
	debouncer = {}
	storedModelObjects = {}
	watches = []

	cancelSaver = (showId = currentId) ->

		if !debouncer[showId]
			return
		else if debouncer[showId].$$state.status or $interval.cancel(debouncer[showId])
			debouncer[showId] = null
		else
			$log.error "Could not cancel showId: #{showId}"
		return

	###
	 FUNCTION Starts the show saver countdown for given show id. After interval, saver checks validation and $dirty status then saves if it can
	###
	startSaver = (showId = currentId, showObject = currentShowObject, retryCount = 0) ->

		cancelSaver(showId)
		debouncer[showId] = $interval(attemptSave, saverDebounceRate, 1, true, showId, showObject, retryCount)
		return

	copyChangedFields = (models, showObject) ->
		# Try doing the a = 1, b = 2 thing
		copyObject = {}
		atLeastOneProperty = false

		for mName, m of models when m.$dirty
			if m.$invalid
				$log.error 'Should not call copyChangedFields on invalid form'
				return null

			atLeastOneProperty = true
			copyObject[mName] = showObject[mName]

		if atLeastOneProperty
			return copyObject
		else
			$log.error 'All model objects are pristine'
			return

	###
	 FUNCTION Attempts to save show corresponding to given saveId (callback for startSaver)
	###
	attemptSave = (saveId, saveObject, retryCount) ->
		submitObject = null
		debouncer[saveId] = null

		# This block handles case that we've switched shows and saving is occurring
		# We're assuming that the stored model object has changes and is valid (check before saving it). Will log error if not.
		if storedModelObjects[saveId]?
			submitObject = copyChangedFields(storedModelObjects[saveId], saveObject)

			if !submitObject
				$log.error('An invalid object was saved')
				
		# This block handles the case that we're saving the current show
		else if saveId is currentId and currentForm.$dirty and currentForm.$valid
			submitObject = copyChangedFields(currentModels, saveObject)

			if submitObject?
				# Clear form as we'll set all submitted fields to dirty if there is an error
				currentForm.$setPristine()
				currentForm.$setUntouched()

		if !submitObject
			return
		else if saveId is newId
			doCreate(submitObject, retryCount)
		else
			doUpdate(saveId, submitObject, retryCount)
		return

	doCreate = (show, retryCount) ->
		showData.createShow(show)
			.success (id) ->
				currentShowObject._id = currentId = id
			.error handleError newId, show, retryCount
		return

	doUpdate = (saveId, show, retryCount) ->
		showData.updateShow saveId, show
		.success ->
			storedModelObjects[saveId] = null if storedModelObjects[saveId]
			return
		.error handleError saveId, show, retryCount

	handleError = (saveId, show, retryCount) ->
		(err) ->
			$log.info err

			# Make all fields dirty if still on current so resubmission is successful    
			if currentId is saveId
				for fieldName of show
					currentModels[fieldName].$setDirty true
					currentModels[fieldName].$setTouched true
					currentModels[fieldName].$validate()

			if err.validationFailed is true
				cancelSaver saveId
			else if retryCount < (retries - 1)
				startSaver saveId, show, retryCount + 1
			else
				$log.error "Attempted to save #{retries} times unsuccessfully", err
			return

	storeCurrent = ->
		if !currentId or !currentModels
			$log.error 'Tried saving current before initialisation'
			return false
		else if currentId is newId
			return false
		else if debouncer[currentId]?
			if currentForm.$pristine
				cancelSaver(currentId)
			else if currentForm.$invalid
				return false
			else
				obj = {}

				for mName, m of currentModels
					obj[mName] =
						$dirty: m.$dirty
						$valid: m.$valid

				storedModelObjects[currentId] = obj

		return true

	clearAll = () ->
		for id of debouncer
				cancelSaver(id)
		
		for id of storedModelObjects
			storedModelObjects[id] = null

		currentId = currentForm = currentShowObject = currentModels = null
		return
	
	watchCurrentShowObjectChanges = () ->
		until watches.length is 0
			do watches.pop()
				
		for p of currentForm when p[0] isnt '$'
			currentModels[p] = currentForm[p]

			# Pushes a watch onto watches. do (p) -> -> closes a function around p
			watches.push $rootScope.$watch do (p) ->
					->
						currentShowObject[p]
				,
				->
					startSaver()
					return
		return

	initialise = (form, show) ->
		if currentForm? and currentForm.$invalid
			$log.error 'attempted initialising while current form invalid'
			return

		currentForm = form
		currentShowObject = show
		currentModels = {}

		watchCurrentShowObjectChanges()
		return
		
	initialiseShow = (form, show) ->
		currentId = show._id
		initialise form, show
		return

	initialiseNew = (form, show) ->
		if currentId is newId
			$log.error 'attempted to initialise a new show before previous new show was saved'
			return

		currentId = newId
		initialise form, show
		return
	
	{
		initShow: initialiseShow
		initNew: initialiseNew
		storeCurrent: storeCurrent
		clearAll: clearAll
	}

angular.module 'shows'
.service 'showSaver', ['showData', '$interval', '$log', '$rootScope', ShowSaver]