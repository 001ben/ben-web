(function () {
    'use strict';

    // Prepare the 'shows' module for subsequent registration of controllers and delegates
    angular.module('shows')
    .directive('showImage', function ShowImageDirective() {
        return {
            restrict: 'E',
            scope: {
                image: '@',
                class: '@'
            },
            link: function (scope, element, attrs) {
                var img = JSON.parse(scope.image || '{}');
                var showImageHtml = '';
                if (!!img.imageUrl)
                {
                    showImageHtml = '<img src="' + img.imageUrl + '" class="' + scope.class + '">';
                }
                else
                {
                    showImageHtml = '<md-icon class="' + scope.class + '">' + (img.iconName || 'movie') + '</md-icon>';
                }
                element[0].outerHTML = showImageHtml;
            }
        };
    });
})();