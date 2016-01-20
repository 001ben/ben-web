describe('ShowController', function () {

	var showsController, $httpBackend, debouncer, $rootScope, $interval;

	beforeEach(module('shows'));

	beforeEach(inject(function (_$rootScope_, $compile, _$httpBackend_, _debouncer_, _$interval_) {
		// Storing describe level globals
		$rootScope = _$rootScope_;
		$httpBackend = _$httpBackend_;
		debouncer = _debouncer_;
		$interval = _$interval_;

		// Tracking calls to debouncer
		spyOn(debouncer, 'start').and.callThrough();
		spyOn(debouncer, 'clear').and.callThrough();

		// Initialise the fixtures path
		jasmine.getJSONFixtures().fixturesPath = '/base/tests/mock-data';

		// Setup the http backend
		$httpBackend.whenGET('/shows').respond(
			getJSONFixture('shows.json')
		);

		$httpBackend.whenGET('/shows/order').respond({
			showsOrderedBy: null,
			showsOrderedAscending: null
		});

		// Setup the shows controller with a html frontend
		var testHtml = '<div ng-controller="showController as ul">' +
			'<form name="ul.showForm">' +
			'<input ng-model="ul.selected.episodes" name="episodes" ng-change="ul.onFieldChange()"/>' +
			'<input ng-model="ul.selected.name" name="name" required ng-change="ul.onFieldChange()"/>' +
			'</form>' +
		'</div>';

		var element = angular.element(testHtml);
		scope = $rootScope.$new();

		element = $compile(element)(scope);
		scope.$digest();
		$httpBackend.flush();

		showsController = element.controller();
	}));

	afterEach(function() {
		// $httpBackend.verifyNoOutstandingExpectation();
		// $httpBackend.verifyNoOutstandingRequest();
	});

	/* test helper functions (for DRY) */
	function setViewValue(fieldName, value) {
		$rootScope.$apply(function () {
			showsController.showForm[fieldName].$setViewValue(value);
		});
	}

	describe('show list and show selection', function () {

		it('loads a list of shows with the mock shows controller', function () {
			expect(showsController.shows[0].name).toEqual('Test Show 1');
			expect(showsController.shows[1].name).toEqual('Test Show 2');
			expect(showsController.shows[2].name).toEqual('Test Show 3');
			expect(showsController.loading).toBe(false);
		});

		it('automatically selects the first show to display', function () {
			expect(showsController.selected).toBe(showsController.shows[0]);
			expect(showsController.selected.name).toEqual('Test Show 1');
			expect(showsController.selected.episodes).toEqual(35);
		});

		it('can change the selected show', inject(function (showData) {

			var shows;
			showData.loadAllShows().success(function (s) {
				shows = s;
			});
			$httpBackend.flush();

			expect(showsController.selected).toEqual(shows[0]);

			// Simulate unable to change to a different show if the form is invalid
			setViewValue('name', null);
			expect(showsController.showForm.$invalid).toBe(true);

			showsController.selectShow(shows[1]);
			expect(showsController.selected._id).toEqual(shows[0]._id);

			// Simulate user fixing errors so form not invalid
			setViewValue('name', 'value');
			expect(debouncer.start.calls.count()).toBe(2);

			// Setup http to respond when show is saved
			$httpBackend.whenPOST('/shows/update/1').respond();
			$interval.flush(1000);
			$httpBackend.flush();

			expect(showsController.showForm.$invalid).toBe(false);
			expect(showsController.showForm.$dirty).toBe(false);

			showsController.selectShow(shows[1]);
			expect(showsController.selected).toEqual(shows[1]);

			showsController.selectShow(shows[2]);
			expect(showsController.selected).toEqual(shows[2]);
		}));
	});

	describe('adding and removing shows', function () {

		it('adds a new show when you click the add button, it will automatically be invalid', inject(function () {

			var initialLength = showsController.shows.length;
			var initialSelected = showsController.selected;

			expect(showsController.selected).not.toBeNull();
			expect(initialLength).toBeGreaterThan(0);
			expect(showsController.showForm.$valid).toBeTruthy();

			scope.$apply(function () {
				showsController.addShow();
			});

			expect(showsController.shows.length).toBe(initialLength + 1);
			expect(showsController.selected).not.toBe(initialSelected);

			expect(showsController.showForm.$valid).toBeFalsy();
			expect(showsController.showForm.name.$valid).toBeFalsy();

			setViewValue('name', 'New Show Name');

			expect(showsController.showForm.$valid).toBeTruthy();
			expect(showsController.showForm.name.$valid).toBeTruthy();

			expect(showsController.selected.name).toBe('New Show Name');
			expect(debouncer.start.calls.count()).toBe(1);
		}));
	});

	describe('Saving functionality', function() {

		/* tests */
		it('Should save only the data entered into fields and the id after the timer has run', inject(function ($log) {

			expect(showsController.selected._id).toBe(1);

			setViewValue('name', 'new name');
			expect(showsController.selected.name).toEqual('new name');
			expect(showsController.showForm.name.$dirty).toBeTruthy();
			expect(showsController.showForm.name.$valid).toBeTruthy();

			$httpBackend.expectPOST('/shows/update/1', {name: 'new name'}).respond();
			$interval.flush(1000);
			$httpBackend.flush();

			expect($log.error.logs).not.toContain(['Test error']);

			expect(showsController.showForm.name.$pristine).toBeTruthy();
			expect(showsController.showForm.name.$dirty).toBeFalsy();
		}));

		it('Should not save until the form is valid', function () {
			expect(debouncer.start.calls.any()).toBeFalsy();
			expect(showsController.showForm.$valid).toBeTruthy();

			setViewValue('name', null);
			expect(showsController.showForm.$valid).toBeFalsy();
			expect(debouncer.start.calls.count()).toBe(1);

			$interval.flush(1000);
			$httpBackend.verifyNoOutstandingRequest();

			setViewValue('name', 'valid name');
			expect(showsController.showForm.$valid).toBeTruthy();
			expect(debouncer.start.calls.count()).toBe(2);

			$httpBackend.expectPOST('/shows/update/1').respond();
			$interval.flush(1000);
			$httpBackend.flush();
		});

		it('Should only save values that have actually changed', function () {
			expect(debouncer.start.calls.any()).toBeFalsy();

			setViewValue('name', 'new name');
			expect(showsController.showForm.name.$viewValue).toBe('new name');
			expect(debouncer.start.calls.count()).toBe(1);

			$httpBackend.expectPOST('/shows/update/1', { name: 'new name' }).respond();
			$interval.flush(1000);
			$httpBackend.flush();

			expect(showsController.showForm.$dirty).toBeFalsy();
			$rootScope.$apply(function() {
				showsController.selectShow(showsController.shows[1]);
			});
			expect(showsController.selected._id).toEqual(2);

			setViewValue('episodes', 6);
			expect(debouncer.start.calls.count()).toBe(2);
			expect(showsController.showForm.name.$dirty).toBeFalsy();
			expect(showsController.showForm.episodes.$dirty).toBeTruthy();

			$httpBackend.expectPOST('/shows/update/2', {episodes: 6}).respond();
			$interval.flush(1000);
			$httpBackend.flush();

			$rootScope.$apply(function() {
				showsController.selectShow(showsController.shows[2]);
			});
			expect(showsController.selected._id).toEqual(3);

			setViewValue('name', 'test name');
			setViewValue('episodes', 777);
			expect(debouncer.start.calls.count()).toBe(4);
			expect(showsController.showForm.name.$dirty).toBeTruthy();
			expect(showsController.showForm.episodes.$dirty).toBeTruthy();

			$httpBackend.expectPOST('/shows/update/3', {name: 'test name', episodes: 777})
				.respond();
			$interval.flush(1000);
			$httpBackend.flush();
		});

		it('Should create shows if the\'re new', function () {
			expect(debouncer.start.calls.any()).toBeFalsy();
			expect(showsController.shows.length).toBe(3);

			$rootScope.$apply(function() {
				showsController.addShow();
			});

			expect(showsController.showForm.$invalid).toBeTruthy();
			setViewValue('episodes', 9);
			expect(showsController.showForm.$invalid).toBeTruthy();

			$interval.flush(1000);
			$httpBackend.verifyNoOutstandingRequest();

			setViewValue('name', 'new show name');
			expect(showsController.showForm.$valid).toBeTruthy();

			var modifiedDate = showsController.selected.modified;
			$httpBackend.expectPOST('/shows/create', { name: 'new show name', episodes: 9, modified: modifiedDate })
				.respond(200, 4);
			$interval.flush(1000);
			$httpBackend.flush();

			expect(showsController.showForm.$dirty).toBeFalsy();
			expect(showsController.selected._id).toBe(4);

			setViewValue('episodes', 6);
			expect(showsController.showForm.name.$dirty).toBeFalsy();
			expect(showsController.showForm.episodes.$dirty).toBeTruthy();

			$httpBackend.expectPOST('/shows/update/4', {episodes: 6}).respond();
			$interval.flush(1000);
			$httpBackend.flush();

			expect(showsController.showForm.$dirty).toBeFalsy();
		});

		it('Should log http errors as info to the console', inject(function ($log) {
			$log.reset();

			var updateError = { error: 'an error occurred' };
			setViewValue('episodes', 6);
			$httpBackend.expectPOST('/shows/update/1')
				.respond(500, updateError);
			$interval.flush(1000);
			$httpBackend.flush();

			// Form isn't made dirty and validated again as it's not a data error
			expect($log.info.logs).toContain([updateError]);

			var validationError = { validationFailed: true, error: 'episodes needs to be numeric' };
			setViewValue('episodes','invalid');
			$httpBackend.expectPOST('/shows/update/1')
				.respond(500, validationError);
			$interval.flush(1000);
			$httpBackend.flush();

			// Form should be made dirty and validated again as it's a data error
			expect($log.info.logs).toContain([validationError]);
			expect(showsController.showForm.$dirty).toBeTruthy();
		}));

		it('Should save order information whenever an order field is changed', function() {
			expect(showsController.orderBy).toEqual('modified');
			expect(showsController.ascending).toEqual(false);
			showsController.orderBy = 'name';
			showsController.ascending = true;
			$httpBackend.expectPOST('/shows/updateOrder', {
				showsOrderedBy: 'name',
				showsOrderedAscending: true
			}).respond();

			showsController.onOrderChange();
			$httpBackend.flush();
		});
	});
});
