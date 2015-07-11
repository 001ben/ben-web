(function () {
	'use strict';

	angular.module('shows').service('showService', ['$q', ShowService]);

	function ShowService($q) {
		var shows = [
			{
				name: 'One Piece',
				image: {
					imageUrl: './assets/show-images/one-piece.svg',
					style: {
						zoom: '12%',
						position: 'relative',
						left: '-17%'
					}
				},
				notes: 'This is my main show, I love it. Released on sunday\'s a bit after midday',
				episodes: 700,
				next: 701
			},
			{
				name: 'Naruto',
				image: {
					imageUrl: './assets/show-images/naruto.svg',
					style: {
						zoom: '11%',
						position: 'relative',
						top: '18%'
					}
				},
				episodes: 220,
				next: -1
			},
			{
				name: 'Naruto Shippuden',
				image: {
					imageUrl: './assets/show-images/naruto-shippuden.svg',
					style: {
						zoom: '11%',
						position: 'relative',
						top: '18%'
					}
				},
				episodes: 417,
				next: 418
			},
			{
				name: 'Tokyo Ghoul',
				image: {
					imageUrl: './assets/show-images/touka.png',
					style: {
						zoom: '20%'
					}
				},
				episodes: 12,
				next: -1
			},
			{
				name: 'Tokyo Ghoul root A',
				image: {
					imageUrl: './assets/show-images/kaneki-face.png',
					style: {
						zoom: '11%',
						position: 'relative',
						left: '-6%',
						top: '-6%'
					}
				},
				episodes: 12,
				next: -1
			},
			{
				name: 'Game of Thrones',
				image: {
					imageUrl: './assets/show-images/tyrion-face.png',
					style: {
						zoom: '20%',
						position: 'relative',
						left: '-34%'
					},
				},
				seasons: 5,
				seasonEpisodes: 12,
				next: 'Season 6'
			},
			{
				name: 'Attack on Titan',
				imageUrl: 'svg-5',
				episodes: 25,
				next: 22
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
