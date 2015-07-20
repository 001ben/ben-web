angular.module('shows').directive('benEditable', BenEditable);

function BenEditable() {
    return {
        restrict: 'A',
        require: 'ngModel',
        transclude: true,
        template: '<div><span contenteditable tabindex="{{tabindex}}" ng-style="style" data-ph="{{placeholder}}"></span></div><ng-transclude></ng-transclude>',
        scope: {
            modelValue: '=ngModel',
            tabindex: '=',
            placeholder: '@'
        },
        link: function (scope, element, attrs, ngModel) {
            var inlineSpan = angular.element(element.children()[0].childNodes[0]);

            scope.isEmpty = false;
            scope.style = {};

            function updateTextStyle(text) {
                if (scope.isEmpty != (!text)) {
                    scope.isEmpty = !scope.isEmpty;

                    if (scope.isEmpty) {
                        scope.style = {
                            display: 'inline-block',
                            width: '200px'
                        };
                    } else {
                        scope.style = {};
                    }
                }
            }

            function read() {
                var text = inlineSpan.text();
                updateTextStyle(text);
                ngModel.$setViewValue(text);
            }

            function write() {
                var text = ngModel.$viewValue || '';
                updateTextStyle(text);
                inlineSpan.text(text);
            }

            ngModel.$render = write;

            inlineSpan.bind('blur keyup change', function () {
                if (!scope.$$phase) {
                    scope.$apply(read);
                } else {
                    read();
                }
            });
        }
    };
}