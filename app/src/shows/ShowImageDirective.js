(function () {
    'use strict';

    // Prepare the 'shows' module for subsequent registration of controllers and delegates
    angular.module('shows')
    .directive('showImage', function ShowImageDirective() {
        
        var getImageHtml = function(img, classes) {
            if (!!img.imageUrl)
            {
                return '<img src="' + img.imageUrl + '" class="' + classes + '">';
            }
            else
            {
                return '<md-icon class="' + classes + '">' + (img.iconName || 'movie') + '</md-icon>';
            }  
        };
        
        var updateImage = function(img, classes, element) {
            img = img || {};
            element.outerHTML = getImageHtml(img);
        };
        
        return {
            restrict: 'E',
            scope: {
                image: '=',
                containerClass: '@',
                imageClass: '@'
            },
            templateUrl:'./src/shows/templates/show-image-template.html'
        };
    });
})();