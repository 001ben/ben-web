(function () {

    angular.module('shows')
        .controller('showController', ['showData', 'showSaver', '$mdSidenav', '$log', '$q', ShowController]);

    function ShowController(showData, showSaver, $mdSidenav, $log, $q) {
        var self = this;
        
        self.selected = {
            name: ' '
        };
        self.shows = [];
        self.selectShow = selectShow;
        self.toggleList = toggleShowsList;
        self.loading = true;

        // Load all registered shows
        showData
            .loadAllShows()
            .success(function (shows) {
                self.shows = [].concat(shows);
                self.selected = shows[0];
                self.loading = false;
                initSaver();
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
            if(!showSaver.saveCurrent())
                return;
            
            self.selected = angular.isNumber(show) ? $scope.shows[show] : show;
            self.toggleList();
            initSaver();
        }
        
        function initSaver() {
            showSaver.init(self.showForm, self.selected);
            self.showForm.$setPristine();
            self.showForm.$setUntouched();
        }
    }
})();