describe('Show Services', function () {

	describe('Auto Save Service', function () {

		/* Test Variables */
		var showData, $scope, $form, $log, $rootScope;

		/* beforeEach logic */
		function getFakeHttpPromise(returnValue, returnSuccess, validationFailed) {
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
				deferred.resolve(returnValue);
			} else {
				deferred.reject({
					validationFailed: validationFailed
				});
			}

			return deferred.promise;
		};


		beforeEach(module('shows', function ($provide) {
			showData = {
				returnsSuccess: true,
				validationFailed: false,
				returnVal: null,
				updateShow: function (id, show) {
					return getFakeHttpPromise(this.returnVal, this.returnsSuccess, this.validationFailed);
				},
				createShow: function (show) {
					return getFakeHttpPromise(this.returnVal, this.returnsSuccess, this.validationFailed);
				}
			};

			$provide.value('showData', showData);
			spyOn(showData, 'updateShow').and.callThrough();
			spyOn(showData, 'createShow').and.callThrough();
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
				showSaver.initShow($form, $scope.test);
			});

			expect(showData.updateShow.calls.any()).toBeFalsy();

			setViewValue('fieldRequired', 'diff value');
			expect($scope.test.fieldRequired).toEqual('diff value');

			setViewValue('fieldRequired', 'a value');
			expect($form.fieldRequired.$dirty).toBeTruthy();
			expect($form.fieldRequired.$valid).toBeTruthy();
			expect($scope.test.fieldRequired).toEqual('a value');

			$interval.flush(1000);

			expect(showData.updateShow).toHaveBeenCalledWith('12345', {
				fieldRequired: 'a value'
			});
			expect($log.error.logs).not.toContain(['Test error']);

			expect($form.fieldRequired.$pristine).toBeTruthy();
			expect($form.fieldRequired.$dirty).toBeFalsy();
		}));

		it('Should not save until the form is valid', inject(function (showSaver) {
			$scope.$apply(function () {
				showSaver.initShow($form, $scope.test);
			});
			expect(showData.updateShow.calls.any()).toBeFalsy();
			expect($form.$valid).toBeFalsy();

			$scope.$apply(function () {
				showSaver.initShow($form, $scope.test);
			});

			$interval.flush(1000);

			expect($log.error.logs).toContain(['attempted initialising while current form invalid']);
			expect(showData.updateShow.calls.any()).toBeFalsy();

			setViewValue('field', 'new value');
			$interval.flush(1000);
			expect($form.$valid).toBeFalsy();
			expect(showData.updateShow.calls.any()).toBeFalsy();

			setViewValue('fieldRequired', 'a new value');
			expect($form.$valid).toBeTruthy();
			$interval.flush(1000);

			expect(showData.updateShow).toHaveBeenCalledWith('12345', {
				field: 'new value',
				fieldRequired: 'a new value'
			});
		}));

		it('Should only save values that have actually changed', inject(function (showSaver) {
			$scope.$apply(function () {
				showSaver.initShow($form, $scope.test);
			});

			expect(showData.updateShow.calls.any()).toBeFalsy();

			setViewValue('field', 'new value');
			expect($scope.test.field).toEqual('new value');
			$interval.flush(1000);
			expect(showData.updateShow.calls.any()).toBeFalsy();
			expect($form.field.$dirty).toBeTruthy();
			expect($scope.test.field).toEqual('new value');

			setViewValue('field', '');
			expect($scope.test.field).toEqual('');
			$interval.flush(1000);
			expect(showData.updateShow.calls.any()).toBeFalsy();

			setViewValue('fieldRequired', 'new value');
			$interval.flush(1000);

			expect(showData.updateShow).toHaveBeenCalledWith('12345', {
				field: '',
				fieldRequired: 'new value'
			});
		}));

		it('Should save new shows once, then start updating', inject(function (showSaver) {
			var newObj = {};
			$scope.test = newObj;

			$scope.$apply(function () {
				showSaver.initNew($form, $scope.test);
			});

			expect($form.$invalid).toBeTruthy();
			expect(showData.updateShow).not.toHaveBeenCalled();
			expect(showData.createShow).not.toHaveBeenCalled();

			$interval.flush(1000);

			expect($form.$invalid).toBeTruthy();
			expect(showData.updateShow).not.toHaveBeenCalled();
			expect(showData.createShow).not.toHaveBeenCalled();

			var testId = 'abc123';
			showData.returnVal = testId;
			setViewValue('fieldRequired', 'Valid Value');
			$interval.flush(1000);

			expect($form.$valid).toBeTruthy();
			expect(showData.updateShow).not.toHaveBeenCalled();
			expect(showData.createShow).toHaveBeenCalledWith({
				fieldRequired: 'Valid Value'
			});
			expect(newObj).toEqual({
				_id: testId,
				fieldRequired: 'Valid Value'
			});

			setViewValue('field', 'Diff Value');
			$interval.flush(1000);

			expect(showData.updateShow).toHaveBeenCalledWith(testId, {
				field: 'Diff Value'
			});
		}));

		it('Should only store objects when conditions are met', inject(function (showSaver) {

			var saveResult;
			$scope.$apply(function () {
				saveResult = showSaver.storeCurrent();
			});

			expect(saveResult).toBeFalsy();
			expect($log.error.logs).toContain(['Tried saving current before initialisation']);

			var originalTestObject = $scope.test;
			$scope.test = {};
			$log.reset();

			$scope.$apply(function () {
				showSaver.initNew($form, $scope.test);
			});

			expect($log.error.logs.length).toBe(0);
			expect($form.$invalid).toBeTruthy();

			$interval.flush(1000);
			expect(showData.createShow).not.toHaveBeenCalled();
			expect($log.error.logs.length).toBe(0);

			$scope.$apply(function () {
				saveResult = showSaver.storeCurrent();
			});

			expect(saveResult).toBeFalsy();
			expect($log.error.logs.length).toBe(0);

			setViewValue('fieldRequired', 'I am here now');
			expect($form.$valid).toBeTruthy();

			$scope.$apply(function () {
				showSaver.initNew();
			});

			expect($log.error.logs).toContain(['attempted to initialise a new show before previous new show was saved']);
			$log.reset();

			showData.returnsSuccess = false;
			$interval.flush(1000);

			expect(showData.createShow).toHaveBeenCalled();
			expect($log.info.logs).toContain([{
				validationFailed: false
			}]);
			$log.reset();

			showData.validationFailed = true;
			$interval.flush(1000);

			expect(showData.createShow).toHaveBeenCalled();
			expect($log.info.logs).toContain([{
				validationFailed: true
			}]);

			$log.reset();
			showData.returnsSuccess = true;
			showData.validationFailed = false;
			$interval.flush(1000);

			expect($log.info.logs.length).toBe(0);
			expect(showData.createShow).toHaveBeenCalledWith({
				fieldRequired: 'I am here now'
			});

			$log.reset();
			$scope.$apply(function () {
				showSaver.initShow($form, originalTestObject);
				saveResult = showSaver.storeCurrent();
			});

			expect($log.error.logs.length).toBe(0);
			expect(saveResult).toBeTruthy();
		}));

		it('Should log http errors as info to the console and resubmit up to 5 times', inject(function (showSaver) {
			showData.returnsSuccess = false;
			$log.reset();

			$scope.$apply(function () {
				showSaver.initShow($form, $scope.test);
				$form.fieldRequired.$setViewValue('test value');
				$form.field.$setViewValue('new value');
			});

			showData.validationFailed = true;
			expect($form.fieldRequired.$dirty).toBeTruthy();
			$interval.flush(1000);
			expect($log.info.logs.length).toBe(1);
			expect($log.info.logs).toContain([{
				validationFailed: true
						}]);

			showData.validationFailed = false;

			setViewValue('fieldRequired', 'new value');

			expect($form.fieldRequired.$dirty).toBeTruthy();

			$interval.flush(1000);
			expect($log.info.logs).toContain([{
				validationFailed: false
						}]);
			expect($form.$dirty).toBeTruthy();
			expect($form.fieldRequired.$dirty).toBeTruthy();

			for (var i = 1; i < 5; i++) {
				$interval.flush(1000);
			}

			expect($log.info.logs.length).toBe(6);
			expect($log.error.logs).toContain(['Attempted to save 5 times unsuccessfully', {
				validationFailed: false
						}]);
			expect($form.fieldRequired.$dirty).toBeTruthy();

			showData.returnsSuccess = true;
			expect($scope.test.fieldRequired).toEqual('new value');
			setViewValue('fieldRequired', 'fix error');
			expect($scope.test.fieldRequired).toEqual('fix error');
			expect($form.fieldRequired.$viewValue).toEqual('fix error');

			$interval.flush(1000);

			expect($form.$dirty).toBeFalsy();
			expect($form.fieldRequired.$dirty).toBeFalsy();

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
				showSaver.initShow($form, $scope.test);
			});

			expect(showSaver.storeCurrent()).toBeTruthy();

			setViewValue('fieldRequired', 'new value 1');
			setViewValue('fieldRequired', '');

			expect(showSaver.storeCurrent()).toBeFalsy();

			$interval.flush(1000);
			expect(showData.updateShow.calls.any()).toBeFalsy();

			setViewValue('fieldRequired', 'new value 1');
			expect($form.fieldRequired.$dirty).toBeTruthy();

			expect(showSaver.storeCurrent()).toBeTruthy();
			expect(showData.updateShow.calls.count()).toBeFalsy();

			showSaver.initShow(form2, scope2.test);
			scope2.$apply(function () {
				form2.field.$setViewValue('new value 2');
			});

			expect(form2.field.$dirty).toBeTruthy();
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
