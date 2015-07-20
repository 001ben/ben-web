(function () {
    'use strict';

    angular.module('shows').service('showData', ['$q', '$http', ShowService]);

    // Service just maps object methods to api urls
    function ShowService($q, $http) {
        
        // Methods return http promises. 
        return {
            loadAllShows: function () {
                return $http.get('/shows');
            },
            updateShow: function(showId, showObj) {
                return $http.post('/shows/update/' + showId, showObj);
            }
        };
    }
})();