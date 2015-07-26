(function () {
    'use strict';

    // Prepare the 'shows' module for subsequent registration of controllers and delegates
    angular.module('iconSelector').service('cseRenderer', ['$location', CseRenderer]);
    
    function CseRenderer($location) {
        var cx = '002346021416897782818:ziotcz2o5qa';
        
        var service = {
            initialised: false,
            initialise: initialise,
            render: render
        };
        
        function initialise(callback) {
            // Insert it before the CSE code snippet so that cse.js can take the script
            // parameters, like parsetags, callbacks.
            window.__gcse = {
                parsetags: 'explicit',
                callback: callback || function() {
                    service.initialised = true;
                }
            };
            
            $.getScript($location.protocol() + '://cse.google.com/cse.js?cx=' + cx);
        }
        
        function render(searchId, searchString) {
            if (!service.initialised) {
                initialise(function() {
                    service.initialised = true;
                    render(searchId);
                });
            }
            else {
                var searchConfig = {
                    div: searchId,
                    tag: 'search',
                    attributes: {
                        enableImageSearch: true,
                        disableWebSearch: true,
                        imageSearchLayout: 'popup'
                    }
                };
                
                var cse = google.search.cse.element.render(searchConfig);

                if(searchString)
                    cse.execute(searchString);
            }
        }
        
        return service;
    }
})();