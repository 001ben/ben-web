(function () {

    angular.module('shows')
        .controller('showController', ['showData', 'showSaver', 'showType', '$mdSidenav', '$log', '$q', ShowController]);

    function ShowController(showData, showSaver, showType, $mdSidenav, $log, $q) {
        var self = this;

        self.selected = {
            name: ' '
        };
        
        self.showType = showType;
        self.shows = [];
        self.selectShow = selectShow;
        self.toggleList = toggleShowsList;
        self.addShow = addShow;
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
            if (self.showForm.$invalid || !showSaver.storeCurrent())
                return;

            self.selected = angular.isNumber(show) ? $scope.shows[show] : show;
            self.toggleList();
            initSaver();
        }

        function initSaver(isNew) {
            var funcName = 'init' + (!isNew ? 'Show' : 'New');
            showSaver[funcName](self.showForm, self.selected);
            
            self.showForm.$setPristine();
            self.showForm.$setUntouched();
        }

        function addShow() {
            if (!showSaver.storeCurrent())
                return;
            
            var newShow = { };
            
            self.shows.unshift(newShow);
            self.selected = newShow;
            initSaver(true);
        }
    }
})();