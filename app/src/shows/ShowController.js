(function () {

    angular.module('shows').controller('ShowController', ['showService', '$mdSidenav', '$log', '$q', ShowController]);

    function ShowController(showService, $mdSidenav, $log, $q) {
        var self = this;

        self.selected = null;
        self.shows = [];
        self.selectShow = selectShow;
        self.toggleList = toggleShowsList;

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
            $mdSidenav('left').toggle();
        }

        function selectShow(show) {
            self.selected = angular.isNumber(show) ? $scope.shows[show] : show;
            self.toggleList();
        }
    }
})();