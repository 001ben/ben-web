CseRenderer = ($location) ->
	cx = '002346021416897782818:ziotcz2o5qa';

	service =
		initialised: false
		initialise: (callback) ->
			# Insert it before the CSE code snippet so that cse.js can take the script
			# parameters, like parsetags, callbacks.
			window.__gcse =
				parsetags: 'explicit',
				callback: callback || ->
					service.initialised = true
					return

			$.getScript "#{$location.protocol()}://cse.google.com/cse.js?cx=#{cx}"
			return
		render: (searchId, searchString) ->
			if !service.initialised
				service.initialise ->
					service.initialised = true
					render searchId, searchString
			else
				searchConfig =
					div: searchId
					tag: 'search'
					attributes:
						enableImageSearch: true
						disableWebSearch: true
						imageSearchLayout: 'popup'

				cse = google.search.cse.element.render(searchConfig)

				if searchString
					cse.execute searchString
			return

	return service;

angular.module 'iconSelector'
.service 'cseRenderer', ['$location', CseRenderer]
