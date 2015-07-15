(function () {
    'use strict';

    angular.module('shows')
        .provider('extendDefaultObjects', ExtendDefaultObjects)
        .filter('extendDefault', ['extendDefaultObjects', ExtendDefaultFilter])
        .filter('isShowType', ['showType', isShowTypeFilter]);

    function ExtendDefaultObjects() {
        var defaults = [];

        return {
            objectFor: function (name, object) {
                defaults.push([name, object]);
                return this;
            },
            $get: function () {
                return {
                    getObjectFor: function (name) {
                        for (var i = 0; i < defaults.length; i++) {
                            if (defaults[i][0] == name) {
                                return defaults[i][1];
                            }
                        }
                    },
                    extendObject: function (name, object) {
                        var defaultValue = this.getObjectFor(name);
                        return angular.extend({}, defaultValue, object);
                    }
                };
            }
        };
    };

    function ExtendDefaultFilter(extendDefaultObjects) {
        return function (input, name) {
            return extendDefaultObjects.extendObject(name, input);
        };
    };
    
    function isShowTypeFilter(showType) {
        return function(input, typeName) {
            var showTypeValue = showType[typeName];
            if (!showTypeValue) {
                return false;
            }
            
            return input == showTypeValue;
        };
    };
})();