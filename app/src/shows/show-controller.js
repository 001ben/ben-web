(function () {

    angular.module('shows').controller('showController', ['showsData', '$mdSidenav', '$log', '$q', ShowController]);

    function ShowController(showsData, $mdSidenav, $log, $q) {
        var self = this;

        self.selected = null;
        self.shows = [];
        self.selectShow = selectShow;
        self.toggleList = toggleShowsList;

        // Load all registered shows

        showsData
            .loadAllShows()
            .success(function (shows) {
                console.log('finally hit success');
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