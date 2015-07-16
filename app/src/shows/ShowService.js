(function () {
    'use strict';

    angular.module('shows').service('showService', ['$q', 'showType', ShowService]);

    function ShowService($q, showType) {
        var shows = [
            {
                name: 'One Piece',
                image: {
                    'background-image': 'url(./assets/show-images/one-piece.svg)'
                },
                notes: 'This is my main show, I love it. Released on sunday\'s a bit after midday',
                episodes: 700,
                next: 701,
                filmType: showType.episodes
            },
            {
                name: 'Naruto',
                image: {
                    'background-image': 'url(./assets/show-images/naruto.svg)',
                    'background-size': '80% 80%'
                },
                episodes: 220,
                watched: true,
                filmType: showType.episodes
            },
            {
                name: 'Naruto Shippuden',
                image: {
                    'background-image': 'url(./assets/show-images/naruto-shippuden.svg)',
                    'background-size': '80% 80%'
                },
                episodes: 417,
                next: 418,
                watched: false,
                filmType: showType.episodes
            },
            {
                name: 'Tokyo Ghoul',
                image: {
                    'background-image': 'url(./assets/show-images/touka-small.png)',
                    'background-size': '157% 110%',
                    'background-position': '-10% 10%'
                },
                episodes: 12,
                watched: true,
                filmType: showType.episodes
            },
            {
                name: 'Tokyo Ghoul root A',
                image: {
                    'background-image': 'url(./assets/show-images/kaneki-small.png)'
                },
                episodes: 12,
                watched: true,
                filmType: showType.episodes
            },
            {
                name: 'Game of Thrones',
                image: {
                    'background-image': 'url(./assets/show-images/tyrion-small.png)',
                    'background-position': '0% 50%'
                },
                seasons: 5,
                seasonEpisodes: 12,
                watched: false,
                next: 'Season 6',
                filmType: showType.seasons
            },
            {
                name: 'Attack on Titan',
                image: {
                    'background-image': 'url(./assets/show-images/bertolt.png)',
                    'background-position': '0% 10%',
                    'background-size': '200% 125%'
                },
                episodes: 25,
                watched: true,
                filmType: showType.episodes
            },
            {
                name: 'Breaking Bad',
                image: {
                    'background-image': 'url(https://upload.wikimedia.org/wikipedia/en/6/61/Breaking_Bad_title_card.png)'
                },
                episodes: 25,
                watched: true,
                filmType: showType.seasons
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