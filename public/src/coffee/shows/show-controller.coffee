ShowController = (showData, showSaver, showType, iconSelectorService, $mdSidenav, $log, $q) ->
	self = this

	@shows = []
	@loading = true
	@showType = showType
	@selected =
		name: ' '

	# Load all registered shows
	showData
		.loadAllShows()
		.success (shows) ->
			self.shows = [].concat(shows)
			self.selected = shows[0]
			self.loading = false
			do initSaver
			return
	
	###
	 Controller methods
	###
	@toggleShowsList = ->
		do $mdSidenav('left').toggle
		return

	@selectShow = (show) ->
		return if self.showForm.$invalid or !showSaver.storeCurrent()

		self.selected = if angular.isNumber(show) then $scope.shows[show] else show
		do self.toggleShowsList
		do initSaver
		return

	@addShow = ->
		return if !showSaver.storeCurrent()

		newShow = {}

		self.shows.unshift newShow
		self.selected = newShow
		initSaver true
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
	
	###
	 Internal methods
	###
	initSaver = (isNew) ->
		funcName = 'init' + if isNew then 'New' else 'Show'

		showSaver[funcName] self.showForm, self.selected
	
		do self.showForm.$setPristine
		do self.showForm.$setUntouched
		return
	
	return

angular.module 'shows'
	.controller 'showController', ['showData', 'showSaver', 'showType', 'iconSelectorService', '$mdSidenav', '$log', '$q', ShowController]