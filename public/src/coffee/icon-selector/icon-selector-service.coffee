IconSelectorService = ($mdDialog, $rootScope) ->
	getShowSelector: getShowSelector = (handleResult, getPreSearchValue, getShowId, imageUploader) ->
		->
			$mdDialog.show
				clickOutsideToClose: false
				escapeToClose: false
				templateUrl: '/html/icon-selector-dialog.html'
				controller: 'iconSelectorController'
				controllerAs: 'icon'
				locals:
					preSearchValue: getPreSearchValue()
					showId: getShowId()
					imageUploader: imageUploader
				,
				bindToController: true
			.then (data) ->
				if $rootScope.$$phase?
					handleResult data
				else
					$rootScope.$apply ->
						handleResult data
						return
				return
			return

angular.module 'iconSelector'
.service 'iconSelectorService', ['$mdDialog', '$rootScope', IconSelectorService]