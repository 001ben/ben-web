(function () {
    'use strict';

    angular.module('shows').service('showService', ['$q', ShowService]);

    function ShowService($q) {
        var shows = [
            {
                name: 'One Piece',
                image: {
                    'background-image': 'url(./assets/show-images/one-piece.svg)'
                },
                notes: 'This is my main show, I love it. Released on sunday\'s a bit after midday',
                episodes: 700,
                next: 701
            },
            {
                name: 'Naruto',
                image: {
                    'background-image': 'url(./assets/show-images/naruto.svg)',
                    'background-size': '80% 80%'
                },
                episodes: 220,
                next: -1
            },
            {
                name: 'Naruto Shippuden',
                image: {
                    'background-image': 'url(./assets/show-images/naruto-shippuden.svg)',
                    'background-size': '80% 80%'
                },
                episodes: 417,
                next: 418
            },
            {
                name: 'Tokyo Ghoul',
                image: {
                    'background-image': 'url(./assets/show-images/touka-small.png)',
                    'background-size': '157% 110%',
                    'background-position': '-10% 10%'
                },
                episodes: 12,
                next: -1
            },
            {
                name: 'Tokyo Ghoul root A',
                image: {
                    'background-image': 'url(./assets/show-images/kaneki-small.png)'
                },
                episodes: 12,
                next: -1
            },
            {
                name: 'Game of Thrones',
                image: {
                    'background-image': 'url(./assets/show-images/tyrion-small.png)',
                    'background-position': '0% 50%'
                },
                seasons: 5,
                seasonEpisodes: 12,
                next: 'Season 6'
            },
            {
                name: 'Attack on Titan',
                image: {
                    'background-image': 'url(./assets/show-images/bertolt.png)',
                    'background-position': '0% 10%',
                    'background-size': '200% 125%'
                },
                episodes: 25,
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