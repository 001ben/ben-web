(function () {

	angular.module('shows')
		.controller('ShowController', [
			'showService', '$mdSidenav', '$mdBottomSheet', '$log', '$q',
			ShowController
		]);

	/**
	 * Main Controller for the Angular Material Starter App
	 * @param $scope
	 * @param $mdSidenav
	 * @param avatarsService
	 * @constructor
	 */
	function ShowController(showService, $mdSidenav, $mdBottomSheet, $log, $q) {
		var self = this;

		self.selected = null;
		self.shows = [];
		self.selectShow = selectShow;
		self.toggleList = toggleShowsList;
		self.showContactOptions = showContactOptions;

		// Load all registered shows

		showService
			.loadAllShows()
			.then(function (shows) {
				self.shows = [].concat(shows);
				self.selected = shows[0];
			});

		// *********************************
		// Internal methods
		// *********************************

		/**
		 * First hide the bottomsheet IF visible, then
		 * hide or Show the 'left' sideNav area
		 */
		function toggleShowsList() {
			var pending = $mdBottomSheet.hide() || $q.when(true);

			pending.then(function () {
				$mdSidenav('left').toggle();
			});
		}

		/**
		 * Select the current avatars
		 * @param menuId
		 */
		function selectShow(show) {
			self.selected = angular.isNumber(show) ? $scope.shows[show] : show;
			self.toggleList();
		}

		/**
		 * Show the bottom sheet
		 */
		function showContactOptions($event) {
			var show = self.selected;

			return $mdBottomSheet.show({
				parent: angular.element(document.getElementById('content')),
				templateUrl: './src/shows/view/contactSheet.html',
				controller: ['$mdBottomSheet', ContactPanelController],
				controllerAs: "cp",
				bindToController: true,
				targetEvent: $event
			}).then(function (clickedItem) {
				clickedItem && $log.debug(clickedItem.name + ' clicked!');
			});

			/**
			 * Bottom Sheet controller for the Avatar Actions
			 */
			function ContactPanelController($mdBottomSheet) {
				this.show = show;
				this.actions = [
					{
						name: 'Phone',
						icon: 'phone',
						icon_url: 'assets/svg/phone.svg'
					},
					{
						name: 'Twitter',
						icon: 'twitter',
						icon_url: 'assets/svg/twitter.svg'
					},
					{
						name: 'Google+',
						icon: 'google_plus',
						icon_url: 'assets/svg/google_plus.svg'
					},
					{
						name: 'Hangout',
						icon: 'hangouts',
						icon_url: 'assets/svg/hangouts.svg'
					}
          ];
				this.submitContact = function (action) {
					$mdBottomSheet.hide(action);
				};
			}
		}

	}

})();