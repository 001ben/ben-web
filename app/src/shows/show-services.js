(function () {
    'use strict';

    angular.module('shows').service('showSaver', ['showData', '$timeout', '$log', '$rootScope', ShowSaver]);

    var saverDebounceRate = 1000;

    // Service just maps object methods to api urls
    function ShowSaver(showData, $timeout, $log, $rootScope) {

        var currentId,
            currentForm,
            currentShowObject,
            currentModels,
            debouncer = {},
            storedModelObjects = {};

        function cancelCountdown(showId) {
            showId = showId || currentId;

            if (debouncer[showId]) {
                $timeout.cancel(debouncer[showId]);
                debouncer[showId] = null;
            }
        }

        function startCountdown(showId, showObject, attemptNo) {
            showId = showId || currentId;
            showObject = showObject || currentShowObject;
            attemptNo = attemptNo || 0;

            cancelCountdown(showId);
            debouncer[showId] = $timeout(countdownComplete, saverDebounceRate, true, showId, showObject, attemptNo);
        }

        function copyChangedFields(models, showObject) {
            var copyObject = {},
                atLeastOneProperty = false;

            for (var m in models) {
                if (models[m].$dirty) {
                    if (models[m].$invalid) {
                        $log.error('Should not call copyChangedFields on invalid form');
                        return null;
                    }

                    atLeastOneProperty = true;
                    copyObject[m] = showObject[m];
                }
            }

            if (atLeastOneProperty)
                return copyObject;
            else
                $log.error('All model objects are pristine');
        }

        function countdownComplete(saveId, saveObject, attemptNo) {
            debouncer[saveId] = null;
            var submitObject;

            // This block handles case that we've switched shows and saving is occurring
            // We're assuming that the stored model object has changes and is valid (check before saving it). Will log error if not.
            if (storedModelObjects[saveId]) {
                submitObject = copyChangedFields(storedModelObjects[saveId], saveObject);

                if (!submitObject) {
                    $log.error('An invalid object was saved');
                }
            }
            // This block handles the case that we're saving the current show
            else if (saveId == currentId && currentForm.$dirty && currentForm.$valid) {
                submitObject = copyChangedFields(currentModels, saveObject);

                if (submitObject) {
                    // Clear form as we'll set all submitted fields to dirty if there is an error
                    currentForm.$setPristine();
                    currentForm.$setUntouched();
                }
            }

            // only case a submit object should not be found is if the current form is pristine or invalid
            if (!submitObject) {
                startCountdown(saveId, saveObject);
            } else {
                showData.updateShow(saveId, submitObject)
                    .success(function () {
                        if (storedModelObjects[saveId]) {
                            storedModelObjects[saveId] = null;
                        }
                    })
                    .error(function (err) {
                        $log.info(err);

                        // Make all fields dirty if still on current so resubmission is successful    
                        if (currentId == saveId) {
                            for (var m in submitObject) {
                                currentModels[m].$setDirty(true);
                                currentModels[m].$setTouched(true);
                                currentModels[m].$validate();
                            }
                        }

                        // Keep on resubmitting for 5 attempts then log error
                        else if (err.validationFailed !== true && attemptNo < 4)
                            startCountdown(saveId, saveObject, attemptNo + 1);
                        else
                            $log.error('Attempted to save 5 times unsuccessfully', err);
                    });
            }
        }

        function saveCurrent() {
            if (!currentId || !currentModels) {
                $log.error("Tried saving current before initialisation");
                return false;
            } else if (debouncer[currentId]) {
                if (currentForm.$pristine) {
                    $timeout.cancel(debouncer[currentId]);
                } else if (currentForm.$invalid) {
                    return false;
                } else {
                    var obj = {};

                    for (var m in currentModels) {
                        obj[m] = {
                            $dirty: currentModels[m].$dirty,
                            $valid: currentModels[m].$valid
                        };
                    }

                    storedModelObjects[currentId] = obj;
                }
            }
            
            return true;
        }

        function clearAll() {
            for (var id in debouncer) {
                $timeout.cancel(debouncer[id]);
            }
            for (var id in storedModelObjects) {
                storedModelObjects[id] = null;
            }

            currentId = null;
            currentForm = null;
            currentShowObject = null;
            currentModels = null;
        }

        var watches = [];

        function watchCurrentShowObjectChanges() {
            while (watches.length > 0) {
                watches.pop()();
            }

            for (var p in currentForm) {
                if (p[0] != '$') {
                    currentModels[p] = currentForm[p];

                    watches.push($rootScope.$watch(
                        function (showProperty) {
                            return function () {
                                return currentShowObject[showProperty];
                            };
                        }(p),
                        function (newVal, oldVal) {
                            startCountdown();
                        }
                    ));
                }
            }
        };

        function initialise(form, show) {
            currentId = show._id;
            currentForm = form;
            currentShowObject = show;
            currentModels = {};

            watchCurrentShowObjectChanges();
        }

        return {
            init: initialise,
            saveCurrent: saveCurrent,
            clearAll: clearAll
        };
    }
})();