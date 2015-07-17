describe('ShowController', function () {

    var $controller, showsController, $httpBackend;

    beforeEach(module('shows'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        jasmine.getJSONFixtures().fixturesPath = '/base/tests/mock-data';

        $httpBackend.whenGET('/shows').respond(
            getJSONFixture('shows.json')
        );
        
        $controller = $injector.get('$controller');        
    }));
    
    beforeEach(inject(function(showsData, $mdSidenav, $log, $q) {
        showsController = $controller('showController', {
            showsData, $mdSidenav, $log, $q
        });
        
        $httpBackend.flush();
    }));

    describe('shows', function () {
        it('loads a list of shows with the mock shows controller', function () {
            expect(showsController.shows[0].name).toEqual('Test Show 1');
            expect(showsController.shows[1].name).toEqual('Test Show 2');
            expect(showsController.shows[2].name).toEqual('Test Show 3');
        });

        it('automatically selects the first show to display', function () {
            expect(showsController.selected.name).toEqual('Test Show 1');
            expect(showsController.selected.episodes).toEqual(6);
        });

        it('select show function changes selected object', inject(function (showsData) {

            var shows;
            showsData.loadAllShows().success(function (s) {
                shows = s;
            });
            $httpBackend.flush();

            expect(showsController.selected).toEqual(shows[0]);
            showsController.selectShow(shows[1]);
            expect(showsController.selected).toEqual(shows[1]);
            showsController.selectShow(shows[2]);
            expect(showsController.selected).toEqual(shows[2]);
        }));
    });
});