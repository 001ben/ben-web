describe('ShowController', function () {

    var $controller, showsController, $httpBackend, showSaver, showsForm;

    beforeEach(module('shows'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        jasmine.getJSONFixtures().fixturesPath = '/base/tests/mock-data';

        $httpBackend.whenGET('/shows').respond(
            getJSONFixture('shows.json')
        );

        $controller = $injector.get('$controller');
    }));

    beforeEach(inject(function (showData, $mdSidenav, $log, $q) {
        showSaver = jasmine.createSpyObj('showSaver', ['storeCurrent', 'init']);
        showForm = jasmine.createSpyObj('showsForm', ['$setPristine', '$setUntouched']);

        var injectables = {
            showData, showSaver, $mdSidenav, $log, $q
        };

        showsController = $controller('showController', injectables);
        showsController.showForm = showForm;

        $httpBackend.flush();
    }));

    describe('shows', function () {
        it('loads a list of shows with the mock shows controller', function () {
            expect(showsController.shows[0].name).toEqual('Test Show 1');
            expect(showsController.shows[1].name).toEqual('Test Show 2');
            expect(showsController.shows[2].name).toEqual('Test Show 3');
            expect(showSaver.init.calls.count()).toBe(1);
        });

        it('automatically selects the first show to display', function () {
            expect(showsController.selected.name).toEqual('Test Show 1');
            expect(showsController.selected.episodes).toEqual(6);
            expect(showSaver.init.calls.count()).toBe(1);
        });

        it('can change the selected show', inject(function (showData) {

            var shows;
            showData.loadAllShows().success(function (s) {
                shows = s;
            });
            $httpBackend.flush();

            expect(showsController.selected).toEqual(shows[0]);
            expect(showSaver.init.calls.count()).toBe(1);
            expect(showForm.$setPristine.calls.count()).toBe(1);
            expect(showForm.$setUntouched.calls.count()).toBe(1);

            // Simulate unable to change to a different show if the form is invalid
            showSaver.storeCurrent.and.returnValue(false);

            showsController.selectShow(shows[1]);
            expect(showsController.selected).toEqual(shows[0]);
            expect(showSaver.storeCurrent.calls.count()).toBe(1);
            expect(showSaver.init.calls.count()).toBe(1);
            expect(showForm.$setPristine.calls.count()).toBe(1);
            expect(showForm.$setUntouched.calls.count()).toBe(1);

            // Simulate user fixing errors so form not invalid
            showSaver.storeCurrent.and.returnValue(true);

            showsController.selectShow(shows[1]);
            expect(showsController.selected).toEqual(shows[1]);
            expect(showSaver.storeCurrent.calls.count()).toBe(2);
            expect(showSaver.init.calls.count()).toBe(2);
            expect(showForm.$setPristine.calls.count()).toBe(2);
            expect(showForm.$setUntouched.calls.count()).toBe(2);

            showsController.selectShow(shows[2]);
            expect(showsController.selected).toEqual(shows[2]);
            expect(showSaver.storeCurrent.calls.count()).toBe(3);
            expect(showSaver.init.calls.count()).toBe(3);
            expect(showForm.$setPristine.calls.count()).toBe(3);
            expect(showForm.$setUntouched.calls.count()).toBe(3);            
        }));
    });
});