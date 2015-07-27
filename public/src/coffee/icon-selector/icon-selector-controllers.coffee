IconSelectorController = ($mdDialog, cseRenderer, $timeout, $scope, decyclicSearch) ->
	self = this;

	@screens =
		search: 'search'
		load: 'load'
		position: 'position'

	@imageProperties =
		'background-size': 'contain'
		'background-position': '50% 50%'
		'background-repeat': 'no-repeat'
		'border-radius': 'initial'
		position: 'relative'
		height: '128px'
		width: '128px'
		top: '0px'
		left: '0px'

	@currentScreen = @screens.search

	# Render the image search AFTER the modal has loaded (was getting issues with initializing originally for a few hours)
	$timeout ->
		cseRenderer.render 'icon-select-search', self.preSearchValue
		watchImages()
		return
	, 0

	# Watches for new images loaded and listens for clicks on the elements
	firstRef = null
	imgDomPath = '#icon-select-search .gs-image-thumbnail-box img'
	domObserver = new MutationObserver ->
		$('.gs-result').removeAttr('onmouseover')
		curRef = $(imgDomPath).first().attr('src')

		if firstRef != curRef
			firstRef = curRef
			$(imgDomPath).click (event) ->
				event.preventDefault()
				src = $(event.target).attr('src')
				result = findFullUrl src
				
				$scope.$apply ->
					self.currentScreen = self.screens.load
					return
				
				getImageForPositioning(result, src)
				return
		return

	watchImages = ->
		domObserver.observe $('#icon-select-search')[0],
			childList: true
			subtree: true
		return

	img = null
	# Image cleanup function
	cleanupImage = ->
		if img?
			img.remove()
			img = null
		return

	# Check if image at url loads, else default to thumbnail
	getImageForPositioning = (url, backupUrl) ->
		cleanupImage()

		img = $('<img>', {
			src: url
			error: ->
				if backupUrl?
					getImageForPositioning(backupUrl)
				else
					$scope.$apply ->
						console.error('something fucked up')
						self.currentScreen = self.screens.search
						return
				return
			load: ->
				initializePositionScreen(url)
				return
		})
		return

	$scope.$watch ->
		self.scrollDimension
	,
	(newVal) ->
		if newVal isnt imageDimension.getVal()
			imageDimension.modify imageDimension.getVal() - newVal
		return

	# image properties
	numberProp = (initialValue, onChangeHandler, validationSetHandler) ->
		p = initialValue;

		accessors =
			modify: (amount) ->
				if accessors.validationSet?
					p = accessors.validationSet(p, amount);
				else
					p += amount;

				accessors.onChange(p, amount) if accessors.onChange?
				return
			, getVal: ->
					return angular.copy(p)
			, validationSet: validationSetHandler
			, onChange: onChangeHandler

		onChangeHandler(p, null) if onChangeHandler?

		return accessors;

	# returns a function for setting a specified image positioning property
	onUpdatePxField = (propName) ->
		(newVal) ->
			self.imageProperties[propName] = newVal + 'px'
			return

	# returns the function that will update both width and height when dimension is changed
	onUpdateDimensionField = () ->
		updateHeight = onUpdatePxField 'height'
		updateWidth = onUpdatePxField 'width'

		(newVal, amount) ->
			updateHeight(newVal)
			updateWidth(newVal)

			if amount?
				imageX.modify(amount / 2);
				imageY.modify(amount / 2);
				self.scrollDimension = newVal;
					
	# function which will set dimension validation
	dimensionValidationSet = (val, amount) ->
		val -= amount
		val = Math.max(val, self.minDimension)
		val = Math.min(val, self.maxDimension)
		return val;

	# function which will set position validation
	positionValidationSet = (val, amount) ->
		val += amount;
		val = Math.max(val, 128 - imageDimension.getVal());
		val = Math.min(val, 0);
		return val;

	# track mouse location
	# zoom modifier
	currentX = currentY = null
	zoomSpeed = 2

	# Set up events and initialize styles
	initializePositionScreen = (url) ->
		self.imageProperties['background-image'] = "url(#{url})"
		cleanupImage()

		# Pointer down starts tracking mouse position and registers move and up handlers
		getImageElement().on 'pointerdown', (event) ->
			currentX = event.pageX
			currentY = event.pageY

			getImageElement().on('pointermove', moveElement)
			getImageElement().on('pointerup', letGoOfElement)
			return

		getImageElement().mousewheel(scrollElement)

		# Utilize separate apply to allow ng-style to initialize so images can render before we switch screens
		# The disconnect seems cleaner, though it may do that automatically.. would need to check priorities
		$scope.$apply ->
			self.currentScreen = self.screens.position
			return

		return

	moveElement = (event) ->
		moveX = event.pageX - currentX
		moveY = event.pageY - currentY
		currentX = event.pageX
		currentY = event.pageY
		$scope.$apply ->
			imageX.modify(moveX)
			imageY.modify(moveY)
			return
		return

	letGoOfElement = ->
		getImageElement().off('pointermove')
		getImageElement().off('pointerup')
		return

	scrollElement = (event) ->
		dimensionChange = event.deltaY * zoomSpeed
		$scope.$apply ->
			imageDimension.modify(dimensionChange)
			return
		return

	getImageElement = ->
		return $('#icon-select-draggable')

	searchObj = lastObjPath = null
	baseObj = google.search
	
	# Url finding function
	findFullUrl= (src) ->
		searchObj = baseObj

		if lastObjPath?
			searchObj = getFromPath(lastObjPath, baseObj, 3)
			if !searchObj
				console.error 'no object found from last path'
				lastObjPath = null
				searchObj = baseObj

		resultObj = decyclicSearch.search(searchObj, src)
		if resultObj?
			if !lastObjPath
				lastObjPath = resultObj.p
			else
				console.log 'last obj path worked!! :D'

			resultObj = getFromPath(resultObj.p, searchObj, 1)
			return resultObj['url']
		else if lastObjPath?
			lastObjPath = null;
			console.log('lastObjPath didnt work, defaulting to full search')
			return findFullUrl(src)
		else
			console.error 'tried to find, did not work :('
			return '';

	imageX = numberProp(-32, onUpdatePxField('left'), positionValidationSet)
	imageY = numberProp(-35, onUpdatePxField('top'), positionValidationSet)
	imageDimension = numberProp(198, onUpdateDimensionField(), dimensionValidationSet)

	@minDimension = 128
	@maxDimension = 600
	@scrollDimension = imageDimension.getVal()

	# Get object from object given string path
	getFromPath = (path, obj, backCount = 0) ->
		path = path.trim('$').replace(/(\$\[|\])/g, '').split('[')
		
		for i in [0...(path.length - backCount)]
				obj = obj[JSON.parse(path[i])];
	
		return obj;

	# sends picture to server
	@accept = () ->
		self.currentScreen = self.screens.load
		self.imageUploader self.showId, self.imageProperties
		.success (data) ->
			self.close(data)
			return
		.error (err) ->
			console.error(err)
			self.currentScreen = self.screens.search
			return
		return

	# Returns to search screen
	@back = () ->
		self.currentScreen = self.screens.search
		return

	# function for closing the dialog
	@close = (imageProperties) ->
		domObserver.disconnect()
		getImageElement().unbind()
		
		# Clear the image as animation + filter = lag
		self.imageProperties = {}
		returnObj =
			hasNewImage: imageProperties?
			newImageProperties: imageProperties

		$mdDialog.hide(returnObj)
		return
	return

angular.module 'iconSelector'
.controller 'iconSelectorController', ['$mdDialog', 'cseRenderer', '$timeout', '$scope', 'decyclicSearch', IconSelectorController]