(function () {
    'use strict';

    angular.module('shows').service('showsData', ['$q', '$http', ShowService]);

    function ShowService($q, $http) {
        
        // Promise-based API
        return {
            loadAllShows: function () {
                // Simulate async nature of real remote calls
                return $http.get('/shows');
            }
        };
    }
})();