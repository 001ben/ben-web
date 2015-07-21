describe('Show Services', function () {

    describe('Auto Save Service', function () {

        /* Test Variables */
        var showData, $scope, $form, $log, $rootScope;

        /* beforeEach logic */
        function getFakeHttpPromise(returnSuccess, validationFailed) {
            var q;

            inject(function ($q) {
                q = $q;
            });

            var deferred = q.defer();

            deferred.promise.success = function (fn) {
                deferred.promise.then(fn);
                return deferred.promise;
            };

            deferred.promise.error = function (fn) {
                deferred.promise.catch(fn);
                return deferred.promise;
            };

            if (returnSuccess) {
                deferred.resolve();
            } else {
                deferred.reject({ validationFailed: validationFailed });
            }

            return deferred.promise;
        };


        beforeEach(module('shows', function ($provide) {
            showData = {
                returnsSuccess: true,
                validationFailed: false,
                updateShow: function (id, show) {
                    return getFakeHttpPromise(this.returnsSuccess, this.validationFailed);
                }
            };

            $provide.value('showData', showData);
            spyOn(showData, 'updateShow').and.callThrough();
        }));

        beforeEach(inject(function (_$rootScope_, $compile, _$interval_, _$log_) {
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $interval = _$interval_;
            $log = _$log_;

            var element = angular.element(
                '<form name="testForm">' +
                '<input ng-model="test.field" name="field" />' +
                '<input ng-model="test.fieldRequired" name="fieldRequired" required />' +
                '</form>');

            $compile(element)($scope);

            $form = $scope.testForm;
            $scope.test = {
                _id: '12345',
                field: '',
                fieldRequired: ''
            };
        }));

        /* test helper functions (for DRY) */
        function setViewValue(fieldName, value) {
            $rootScope.$apply(function () {
                $form[fieldName].$setViewValue(value);
            });
        }

        /* tests */
        it('Should save only the data entered into fields and the id after the timer has run', inject(function (showSaver) {
            $scope.$apply(function () {
                showSaver.init($form, $scope.test);
            });

            expect(showData.updateShow.calls.any()).toBe(false);

            setViewValue('fieldRequired', 'diff value');
            expect($scope.test.fieldRequired).toEqual('diff value');

            setViewValue('fieldRequired', 'a value');
            expect($form.fieldRequired.$dirty).toBe(true);
            expect($form.fieldRequired.$valid).toBe(true);
            expect($scope.test.fieldRequired).toEqual('a value');

            $interval.flush(1000);

            expect(showData.updateShow).toHaveBeenCalledWith('12345', {
                fieldRequired: 'a value'
            });
            expect($log.error.logs).not.toContain(['Test error']);

            expect($form.fieldRequired.$pristine).toBe(true);
            expect($form.fieldRequired.$dirty).toBe(false);
        }));

        it('Should not save until the form is valid', inject(function (showSaver) {
            $scope.$apply(function () {
                showSaver.init($form, $scope.test);
            });
            expect(showData.updateShow.calls.any()).toBe(false);

            setViewValue('field', 'new value');
            $interval.flush(1000);
            expect(showData.updateShow.calls.any()).toBe(false);

            setViewValue('fieldRequired', 'a new value');
            $interval.flush(1000);

            expect(showData.updateShow).toHaveBeenCalledWith('12345', {
                field: 'new value',
                fieldRequired: 'a new value'
            });
        }));

        it('Should only save values that have actually changed', inject(function (showSaver) {
            $scope.$apply(function () {
                showSaver.init($form, $scope.test);
            });
            expect(showData.updateShow.calls.any()).toBe(false);

            setViewValue('field', 'new value');
            expect($scope.test.field).toEqual('new value');
            $interval.flush(1000);
            expect(showData.updateShow.calls.any()).toBe(false);
            expect($form.field.$dirty).toBe(true);
            expect($scope.test.field).toEqual('new value');

            setViewValue('field', '');
            expect($scope.test.field).toEqual('');
            $interval.flush(1000);
            expect(showData.updateShow.calls.any()).toBe(false);

            setViewValue('fieldRequired', 'new value');
            $interval.flush(1000);

            expect(showData.updateShow).toHaveBeenCalledWith('12345', {
                field: '',
                fieldRequired: 'new value'
            });
        }));

        it('Should log http errors as info to the console and resubmit up to 5 times', inject(function (showSaver) {
            showData.returnsSuccess = false;
            $log.reset();

            $scope.$apply(function () {
                showSaver.init($form, $scope.test);
                $form.fieldRequired.$setViewValue('test value');
                $form.field.$setViewValue('new value');
            });
            
            showData.validationFailed = true;
            expect($form.fieldRequired.$dirty).toBe(true);
            $interval.flush(1000);
            expect($log.info.logs.length).toBe(1);
            expect($log.info.logs).toContain([ { validationFailed: true } ]);
            
            showData.validationFailed = false;
            
            setViewValue('fieldRequired', 'new value');

            expect($form.fieldRequired.$dirty).toBe(true);

            $interval.flush(1000);
            expect($log.info.logs).toContain([ { validationFailed: false } ]);
            expect($form.$dirty).toBe(true);
            expect($form.fieldRequired.$dirty).toBe(true);

            for (var i = 1; i < 5; i++) {
                $interval.flush(1000);
            }

            expect($log.info.logs.length).toBe(6);
            expect($log.error.logs).toContain(['Attempted to save 5 times unsuccessfully', { validationFailed: false }]);
            expect($form.fieldRequired.$dirty).toBe(true);

            showData.returnsSuccess = true;
            expect($scope.test.fieldRequired).toEqual('new value');
            setViewValue('fieldRequired', 'fix error');
            expect($scope.test.fieldRequired).toEqual('fix error');
            expect($form.fieldRequired.$viewValue).toEqual('fix error');

            $interval.flush(1000);

            expect($form.$dirty).toBe(false);
            expect($form.fieldRequired.$dirty).toBe(false);

            expect(showData.updateShow).toHaveBeenCalledWith('12345', {
                field: 'new value',
                fieldRequired: 'fix error'
            });
        }));

        it('Should save all operations still in progress when current is saved', inject(function (showSaver) {

            var scope2, form2;

            inject(function ($rootScope, $compile) {
                scope2 = $rootScope.$new();

                var element = angular.element(
                    '<form name="testForm2">' +
                    '<input ng-model="test.field" name="field" />' +
                    '</form>');

                $compile(element)(scope2);
                form2 = scope2.testForm2;

                scope2.test = {
                    _id: '54321',
                    field: ''
                };
            });

            $scope.$apply(function () {
                showSaver.init($form, $scope.test);
            });

            expect(showSaver.storeCurrent()).toBe(true);

            setViewValue('fieldRequired', 'new value 1');
            setViewValue('fieldRequired', '');

            expect(showSaver.storeCurrent()).toBe(false);
            
            $interval.flush(1000);
            expect(showData.updateShow.calls.any()).toBe(false);
            
            setViewValue('fieldRequired', 'new value 1');
            expect($form.fieldRequired.$dirty).toBe(true);

            showSaver.storeCurrent();

            showSaver.init(form2, scope2.test);
            scope2.$apply(function () {
                form2.field.$setViewValue('new value 2');
            });

            expect(form2.field.$dirty).toBe(true);
            expect(scope2.test.field).toEqual('new value 2');

            $interval.flush(1000);
            expect(showData.updateShow.calls.count()).toBe(2);
            expect(showData.updateShow).toHaveBeenCalledWith('12345', {
                fieldRequired: 'new value 1'
            });
            expect(showData.updateShow).toHaveBeenCalledWith('54321', {
                field: 'new value 2'
            });
        }));
    });
});