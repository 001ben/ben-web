describe('ShowController', function () {

	var $controller, showsController, $httpBackend, debouncer, showsForm;

	beforeEach(module('shows', function ($provide) {
		debouncer = jasmine.createSpyObj('debouncer', ['start', 'clear', 'callSave']);
		showsForm = jasmine.createSpyObj('showForm', ['$setPristine', '$setUntouched', '$invalid']);


		$provide.value('debouncer', debouncer);
		$provide.value('showForm', showsForm);
	}));

	beforeEach(inject(function ($injector) {
		$httpBackend = $injector.get('$httpBackend');
		jasmine.getJSONFixtures().fixturesPath = '/base/tests/mock-data';

		$httpBackend.whenGET('/shows').respond(
			getJSONFixture('shows.json')
		);

		$controller = $injector.get('$controller');
	}));

	beforeEach(inject(function (showData, $mdSidenav, $log, $q) {

		var injectables = {
			showData, debouncer, $mdSidenav, $log, $q
		};

		showsController = $controller('showController', injectables);
		showsController.showForm = showsForm;

		$httpBackend.flush();
	}));

	describe('shows', function () {

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
			showsForm.$invalid = true;

			showsController.selectShow(shows[1]);
			expect(showsController.selected).toEqual(shows[0]);

			// Simulate user fixing errors so form not invalid
			showsForm.$invalid = false;

			showsController.selectShow(shows[1]);
			expect(debouncer.start.calls.count()).toBe(0);
			expect(showsForm.$setPristine.calls.count()).toBe(0);
			expect(showsForm.$setUntouched.calls.count()).toBe(0);

			showsController.selectShow(shows[2]);
			expect(showsController.selected).toEqual(shows[2]);
		}));
	});

	describe('adding and removing shows', function () {

		var controllerWithForm, scope;

		beforeEach(inject(function ($rootScope, $compile) {
			var testHtml = '<div ng-controller="showController as ul">' +
				'<form name="ul.showForm">' +
				'<input name="name" ng-model="ul.selected.name" ng-change="ul.onFieldChange()" required/>' +
				'</form>' +
				'</div>';

			var element = angular.element(testHtml);
			scope = $rootScope.$new();

			element = $compile(element)(scope);
			scope.$digest();
			$httpBackend.flush();

			controllerWithForm = element.controller();
		}));

		it('adds a new show when you click the add button, it will automatically be invalid', inject(function () {

			var initialLength = controllerWithForm.shows.length;
			var initialSelected = controllerWithForm.selected;

			expect(controllerWithForm.selected).not.toBeNull();
			expect(initialLength).toBeGreaterThan(0);
			expect(controllerWithForm.showForm.$valid).toBeTruthy();

			scope.$apply(function () {
				controllerWithForm.addShow();
			});

			expect(controllerWithForm.shows.length).toBe(initialLength + 1);
			expect(controllerWithForm.selected).not.toBe(initialSelected);

			expect(controllerWithForm.showForm.$valid).toBeFalsy();
			expect(controllerWithForm.showForm.name.$valid).toBeFalsy();

			scope.$apply(function () {
				controllerWithForm.showForm.name.$setViewValue('New Show Name');
			});

			expect(controllerWithForm.showForm.$valid).toBeTruthy();
			expect(controllerWithForm.showForm.name.$valid).toBeTruthy();

			expect(controllerWithForm.selected.name).toBe('New Show Name');
			expect(debouncer.start.calls.count()).toBe(1);
		}));
	});
});
