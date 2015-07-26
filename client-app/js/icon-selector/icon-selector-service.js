(function () {
    'use strict';

    // Prepare the 'shows' module for subsequent registration of controllers and delegates
    angular.module('iconSelector').service('iconSelectorService', ['$mdDialog', '$rootScope', IconSelectorService]);

    function IconSelectorService($mdDialog, $rootScope) {

        return {
            getShowSelector: getShowSelector
        };

        /* Implementation */
        function getShowSelector(handleResult, getPreSearchValue, getShowId, imageUploader) {
            return function () {
                $mdDialog.show({
                    clickOutsideToClose: false,
                    escapeToClose: false,
                    templateUrl: '/assets/views/icon-selector-dialog.html',
                    controller: 'iconSelectorController',
                    controllerAs: 'icon',
                    locals: {
                        preSearchValue: getPreSearchValue(),
                        showId: getShowId(),
                        imageUploader: imageUploader
                    },
                    bindToController: true
                }).then(function(data) {
                    if (!$rootScope.$$phase)
                        $rootScope.$apply(function() {
                            handleResult(data);
                        });
                    else
                        handleResult(data);
                });
            };
        }
    }
})();