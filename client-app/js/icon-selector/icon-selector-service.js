(function () {
    'use strict';

    // Prepare the 'shows' module for subsequent registration of controllers and delegates
    angular.module('iconSelector').service('iconSelectorService', ['$mdDialog', IconSelectorService]);

    function IconSelectorService($mdDialog) {

        return {
            getShowSelector: getShowSelector
        };

        /* Implementation */
        function getShowSelector(handleResult) {
            return function () {
                $mdDialog.show({
                    clickOutsideToClose: true,
                    templateUrl: '/assets/views/icon-selector-dialog.html',
                    controller: 'iconSelectorController',
                    controllerAs: 'icon'
                }).then(handleResult);
            };
        }
    }
})();