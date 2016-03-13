ShowController = (showData, debouncer, showType, iconSelectorService, $mdSidenav, $log, $q, orderByFilter) ->
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

	# Load all registered shows and order info
	$q.all [showData.loadAllShows(), showData.loadShowOrder()]
	.then (data) ->
		return data.map (element) -> element.data
	.then (data) ->
		shows = data[0]
		for p of self.showForm when p[0] isnt '$'
			fields[p] = self.showForm[p]

		self.orderBy = data[1].showsOrderedBy ? 'modified'
		self.ascending = data[1].showsOrderedAscending ? false

		self.shows = [].concat(shows)
		if shows.length > 0
			self.shows = orderByFilter self.shows, self.orderBy, !self.ascending
			self.selected = self.shows[0]

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
			self.selected = if angular.isNumber(show) then self.shows[show] else show
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

	@onOrderChange = ->
		showData.updateShowOrder self.orderBy, self.ascending
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
			showData.updateShow self.selected._id, changedFields
			.success ->
				do clearFields
				return
			.error (err) ->
				handleSaveError err, changedFields
				return
		else
			showData.createShow self.selected
			.success (id) ->
				do clearFields
				self.selected._id = id
				return
			.error (err) ->
				handleSaveError err, changedFields
				return
		return

	clearFields = ->
		do self.showForm.$setPristine
		do self.showForm.$setUntouched

	handleSaveError = (err, changedFields) ->
		# consider adding logic for a user friendly message display
		$log.info err

		if err.validationFailed is true
			debouncer.start saveShow

		return
	return

angular.module 'shows'
	.controller 'showController', ['showData', 'debouncer', 'showType', 'iconSelectorService', '$mdSidenav', '$log', '$q', 'orderByFilter', ShowController]
