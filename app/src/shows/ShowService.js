(function () {
	'use strict';

	angular.module('shows')
		.service('showService', ['$q', ShowService]);

	/**
	 * Shows DataService
	 * Uses embedded, hard-coded data model; acts asynchronously to simulate
	 * remote data service call(s).
	 *
	 * @returns {{loadAll: Function}}
	 * @constructor
	 */
	function ShowService($q) {
		var shows = [
			{
				name: 'One Piece',
				imageUrl: './assets/show-images/one-piece.svg',
				episodes: 698,
				next: 699
      },
			{
				name: 'Naruto',
				imageUrl: './assets/show-images/naruto.svg',
				episodes: 220,
				next: -1
      },
			{
				name: 'Naruto Shippuden',
				imageUrl: './assets/show-images/naruto-shippuden.svg',
				episodes: 416,
				next: 411
      },
			{
				name: 'Tokyo Ghoul',
				imageUrl: 'svg-4',
				episodes: 12,
				next: -1
			},
			{
				name: 'Tokyo Ghoul root A',
				imageUrl: 'svg-5',
				episodes: 12,
				next: -1
			}
		];

		// Promise-based API
		return {
			loadAllShows: function () {
				// Simulate async nature of real remote calls
				return $q.when(shows);
			}
		};
	}

})();