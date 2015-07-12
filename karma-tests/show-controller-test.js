describe('ShowController', function () {

    var $controller;

    beforeEach(module('shows', function ($provide) {
        $provide.value('showService', {
            loadAllShows: function () {
                return {
                    then: function (fn) {
                        fn([
                            {
                                name: 'Test Show 1',
                                image: {},
                                episodes: 6
                            },
                            {
                                name: 'Test Show 2',
                                image: {},
                                episodes: 3
                            },
                            {
                                name: 'Test Show 3',
                                image: {},
                                episodes: 10
                            }
                        ]);
                    }
                };
            }
        });
    }));

    beforeEach(inject(function (_$controller_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));

    describe('shows', function () {
        it('loads a list of shows with the mock shows controller', inject(function (showService, $mdSidenav, $log, $q) {

            var controller = $controller('ShowController', {
                showService, $mdSidenav, $log, $q
            });

            expect(controller.shows[0].name).toEqual('Test Show 1');
            expect(controller.shows[1].name).toEqual('Test Show 2');
            expect(controller.shows[2].name).toEqual('Test Show 3');
        }));

        it('automatically selects the first show to display', inject(function (showService, $mdSidenav, $log, $q) {
            var controller = $controller('ShowController', {
                showService, $mdSidenav, $log, $q
            });

            expect(controller.selected.name).toEqual('Test Show 1');
            expect(controller.selected.episodes).toEqual(6);
        }));

        it('select show function changes selected object', inject(function (showService, $mdSidenav, $log, $q) {
            var controller = $controller('ShowController', {
                showService, $mdSidenav, $log, $q
            });

            var shows;
            showService.loadAllShows().then(function (s) {
                shows = s
            });

            expect(controller.selected).toEqual(shows[0]);
            controller.selectShow(shows[1]);
            expect(controller.selected).toEqual(shows[1]);
            controller.selectShow(shows[2]);
            expect(controller.selected).toEqual(shows[2]);
        }));
    });
});