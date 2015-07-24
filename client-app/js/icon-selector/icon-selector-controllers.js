(function () {
    'use strict';

    // Prepare the 'shows' module for subsequent registration of controllers and delegates
    angular.module('iconSelector').controller('iconSelectorController', ['$mdDialog', IconSelectorController]);
    
    function IconSelectorController($mdDialog) {
        var self = this;
        
        self.message = 'hello';
        self.close = close;
        
        function close() {
            $mdDialog.hide('DONE IT!');
        }
    }
})();