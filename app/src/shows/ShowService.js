(function () {
    'use strict';

    angular.module('shows').service('showService', ['$q', ShowService]);

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
                image: {
                    imageUrl: './assets/show-images/one-piece.svg',
                    style: {
                        zoom: '12%',
                        position: 'relative',
                        left: '-17%'
                    }
                },
                notes: 'This is my main show, I love it. Released on sunday\'s a bit after midday',
                episodes: 698,
                next: 699
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
                episodes: 416,
                next: 411
            },
            {
                name: 'Tokyo Ghoul',
                image: {
                    imageUrl: 'http://pre01.deviantart.net/ec16/th/pre/f/2014/226/5/5/touka_kirishima__tokyo_ghoul____render_v1_by_azizkeybackspace-d7v7l2o.png',
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
                    imageUrl: 'http://imgs.tuts.dragoart.com/how-to-draw-kaneki-ken-from-tokyo-ghoul_3_000000020971_5.png',
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
                    imageUrl: 'http://images.tvrage.com/news/game-of-thrones-new-teaser-promises-chaos-for-season-3.png',
                    style: {
                        zoom: '20%',
                        position: 'relative',
                        left: '-34%'
                    },
                },
                seasons: 5,
                seasonEpisodes: 12,
                next: 'Season 6'
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