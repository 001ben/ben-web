(function () {
    'use strict';

    angular.module('shows').service('showSaver', ['showData', '$interval', '$log', '$rootScope', ShowSaver]);

    var saverDebounceRate = 1000,
        retries = 5;

    // Service just maps object methods to api urls
    function ShowSaver(showData, $interval, $log, $rootScope) {

        var currentId,
            currentForm,
            currentShowObject,
            currentModels,
            debouncer = {},
            storedModelObjects = {};

        function cancelSaver(showId) {
            showId = showId || currentId;

            if (!debouncer[showId])
                return
            else if (debouncer[showId].$$state.status || $interval.cancel(debouncer[showId]))
                debouncer[showId] = null;
            else
                $log.error('Could not cancel showId: ' + showId);
        }

        function startSaver(showId, showObject, retryCount) {
            showId = showId || currentId;
            showObject = showObject || currentShowObject;
            retryCount = retryCount || 0;

            cancelSaver(showId);
            debouncer[showId] = $interval(attemptSave, saverDebounceRate, 1, true, showId, showObject, retryCount);
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

        function attemptSave(saveId, saveObject, retryCount) {
            var submitObject = null;

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

            if (submitObject) {
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

                        if (err.validationFailed === true)
                            cancelSaver(saveId);
                        else if (retryCount < (retries - 1))
                            startSaver(saveId, saveObject, retryCount + 1);
                        else
                            $log.error('Attempted to save ' + retries + ' times unsuccessfully', err);
                    });
            }
        }

        function storeCurrent() {
            if (!currentId || !currentModels) {
                $log.error("Tried saving current before initialisation");
                return false;
            } else if (debouncer[currentId]) {
                if (currentForm.$pristine) {
                    cancelSaver(currentId);
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
                cancelSaver(id);
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
                            startSaver();
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
            storeCurrent: storeCurrent,
            clearAll: clearAll
        };
    }
})();