ShowController = (showData, debouncer, showType, iconSelectorService, $mdSidenav, $log, $q) ->
	self = this

	# Variables
	@shows = []
	@loading = true
	@showType = showType
	@ascending = false
	@selected =
		name: ' '
	@orderByOptions = [
		['Date Modified', 'modified'],
		['Name', 'name'],
		['Watched', 'watched']
	]
	@orderBy = 'modified'

	fields = {}

	# Load all registered shows
	showData
		.loadAllShows()
		.success (shows) ->
			for p of self.showForm when p[0] isnt '$'
				fields[p] = self.showForm[p]

			self.shows = [].concat(shows)
			if shows.length > 0
				self.selected = shows[0]
			else
				s = {}
				self.shows.unshift s
				self.selected = s

			self.loading = false
			return

	###
	 Controller methods
	###
	@toggleShowsList = ->
		do $mdSidenav('left').toggle
		return

	@selectShow = (show) ->
		if self.showForm.$invalid
			return
		else if self.showForm.$dirty
			debouncer.clear()
			do saveShow
		else
			self.selected = if angular.isNumber(show) then $scope.shows[show] else show
			do self.toggleShowsList
		return

	@addShow = ->
		if self.showForm.$invalid
			return
		else if self.showForm.$dirty
			debouncer.clear()
			do saveShow
		else
			newShow = {}

			self.shows.unshift newShow
			self.selected = newShow
		return

	@openIconSelector = iconSelectorService.getShowSelector(
		(data) ->
			self.selected.image = data.newImageProperties if data.hasNewImage
			return
		, ->
			return self.selected.name
		, ->
			return self.selected._id
		, showData.uploadImage)

	@invertOrder = ->
		@ascending = !@ascending
		return

	@onFieldChange = ->
		self.selected.modified = new Date().toISOString()
		debouncer.start saveShow
		return

	###
	 Internal methods
	###

	copyChangedFields = ->
		copyObject = {}
		atLeastOneProperty = false

		for fieldName, field of fields when field.$dirty
			if field.$invalid
				$log.error 'A field was invalid though the form was not'
				return null

			atLeastOneProperty = true
			copyObject[fieldName] = self.selected[fieldName]

		if atLeastOneProperty
			return copyObject
		else
			$log.error 'All fields are pristine'
			return null

	saveShow = ->
		if self.showForm.$invalid
			return

		changedFields = copyChangedFields()
		if not changedFields?
			return
		else if self.selected._id?
			showData.updateShow self.selected._id, self.selected
			.success ->
				clearFields changedFields
				return
			.error (err) ->
				handleSaveError err, changedFields
				return
		else
			showData.createShow self.selected
			.success (id) ->
				clearFields changedFields
				self.selected._id = id
				return
			.error (err) ->
				handleSaveError err, changedFields
				return
		return

	clearFields = (fieldsToClear) ->
		for fieldName of fieldsToClear
			do self.showForm.$setPristine
			do self.showForm.$setUntouched

	handleSaveError = (err, changedFields) ->
		$log.info err

		if err.validationFailed is true and currentId is saveId
			for fieldName of changedFields
				do self.showForm[fieldName].$setDirty
				do self.showForm[fieldName].$setTouched
				do self.showForm[fieldName].$validate

			debouncer.start saveShow
		return

	return

angular.module 'shows'
	.controller 'showController', ['showData', 'debouncer', 'showType', 'iconSelectorService', '$mdSidenav', '$log', '$q', ShowController]
