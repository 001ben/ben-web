(function () {
    'use strict';

    // Prepare the 'shows' module for subsequent registration of controllers and delegates
    angular.module('iconSelector').controller('iconSelectorController', ['$mdDialog', 'cseRenderer', '$timeout', '$scope', 'decyclicSearch', IconSelectorController]);

    function IconSelectorController($mdDialog, cseRenderer, $timeout, $scope, decyclicSearch) {
        var self = this;

        self.screens = {
            search: 'search',
            load: 'load',
            position: 'position'
        };

        self.back = back;
        self.close = close;
        self.accept = accept;
        self.currentScreen = self.screens.search;

        self.imageProperties = {
            'background-size': 'contain',
            'background-position': '50% 50%',
            'background-repeat': 'no-repeat',
            'border-radius': 'initial',
            position: 'relative',
            height: '128px',
            width: '128px',
            top: '0px',
            left: '0px'
        };
        
        // Render the image search AFTER the modal has loaded (was getting issues with initializing originally for a few hours)
        $timeout(function () {
            cseRenderer.render('icon-select-search', self.preSearchValue);
            watchImages();
        }, 0);

        // Watches for new images loaded and listens for clicks on the elements
        var firstRef;
        var imgDomPath = '#icon-select-search .gs-image-thumbnail-box img';
        var domObserver = new MutationObserver(function () {
            $('.gs-result').removeAttr('onmouseover');
            var curRef = $(imgDomPath).first().attr('src');

            if (firstRef != curRef) {
                firstRef = curRef;
                $(imgDomPath).click(function (event) {
                    event.preventDefault();
                    var src = $(event.target).attr('src');
                    var result = findFullUrl(src);
                    $scope.$apply(function () {
                        self.currentScreen = self.screens.load;
                    });
                    getImageForPositioning(result, src);
                });
            }
        });;

        function watchImages() {
            domObserver.observe($('#icon-select-search')[0], {
                childList: true,
                subtree: true
            });
        }

        var img;
        // Image cleanup function
        function cleanupImage() {
            if (img) {
                img.remove();
                img = null;
            }
        }

        // Check if image at url loads, else default to thumbnail
        function getImageForPositioning(url, backupUrl) {
            cleanupImage();

            img = $('<img>', {
                src: url,
                error: function () {
                    if (backupUrl)
                        getImageForPositioning(backupUrl);
                    else {
                        $scope.$apply(function () {
                            console.error('something fucked up');
                            self.currentScreen = self.screens.search;
                        });
                    }
                },
                load: function () {
                    initializePositionScreen(url);
                }
            });
        }

        var imageX = numberProp(-32, onUpdatePxField('left'), positionValidationSet),
            imageY = numberProp(-35, onUpdatePxField('top'), positionValidationSet),
            imageDimension = numberProp(198, onUpdateDimensionField(), dimensionValidationSet);

        self.minDimension = 128;
        self.maxDimension = 600;
        self.scrollDimension = imageDimension.getVal();

        $scope.$watch(function () {
            return self.scrollDimension;
        }, function (newVal) {
            if (newVal !== imageDimension.getVal())
                imageDimension.modify(imageDimension.getVal() - newVal);
        });

        // image properties
        function numberProp(initialValue, onChangeHandler, validationSetHandler) {
            var p = initialValue;

            var accessors = {
                modify: function (amount) {
                    if (!accessors.validationSet)
                        p += amount;
                    else
                        p = accessors.validationSet(p, amount);

                    if (accessors.onChange)
                        accessors.onChange(p, amount);
                },
                getVal: function () {
                    return angular.copy(p);
                },
                validationSet: validationSetHandler,
                onChange: onChangeHandler
            };

            if (onChangeHandler)
                onChangeHandler(p, null);

            return accessors;
        }

        // returns a function for setting a specified image positioning property
        function onUpdatePxField(propName) {
            return function (newVal) {
                self.imageProperties[propName] = (newVal + 'px');
            };
        }

        // returns the function that will update both width and height when dimension is changed
        function onUpdateDimensionField() {
            var updateHeight = onUpdatePxField('height');
            var updateWidth = onUpdatePxField('width');

            return function (newVal, amount) {
                updateHeight(newVal);
                updateWidth(newVal);

                if (amount) {
                    imageX.modify(amount / 2);
                    imageY.modify(amount / 2);
                    self.scrollDimension = newVal;
                }
            };
        }

        // function which will set dimension validation
        function dimensionValidationSet(val, amount) {
            val -= amount;
            val = Math.max(val, self.minDimension);
            val = Math.min(val, self.maxDimension);
            return val;
        }

        // function which will set position validation
        function positionValidationSet(val, amount) {
            val += amount;
            val = Math.max(val, 128 - imageDimension.getVal());
            val = Math.min(val, 0);
            return val;
        }

        // track mouse location
        // zoom modifier
        var currentX, currentY;
        var zoomSpeed = 2;

        // Set up events and initialize styles
        function initializePositionScreen(url) {
            self.imageProperties['background-image'] = 'url(' + url + ')';
            cleanupImage();

            // Pointer down starts tracking mouse position and registers move and up handlers
            getImageElement().on('pointerdown', function (event) {
                currentX = event.pageX;
                currentY = event.pageY;

                getImageElement().on('pointermove', moveElement);
                getImageElement().on('pointerup', letGoOfElement);
            });

            getImageElement().mousewheel(scrollElement);

            // Utilize separate apply to allow ng-style to initialize so images can render before we switch screens
            // The disconnect seems cleaner, though it may do that automatically.. would need to check priorities
            $scope.$apply(function () {
                self.currentScreen = self.screens.position;
            });
        }

        function moveElement(event) {
            var moveX = event.pageX - currentX;
            var moveY = event.pageY - currentY;
            currentX = event.pageX;
            currentY = event.pageY;
            $scope.$apply(function () {
                imageX.modify(moveX);
                imageY.modify(moveY);
            });
        }

        function letGoOfElement() {
            getImageElement().off('pointermove');
            getImageElement().off('pointerup');
        }

        function scrollElement(event) {
            var dimensionChange = (event.deltaY * zoomSpeed);
            $scope.$apply(function () {
                imageDimension.modify(dimensionChange);
            });
        }

        function getImageElement() {
            return $('#icon-select-draggable');
        }

        var searchObj, lastObjPath, baseObj = google.search;
        // Url finding function
        function findFullUrl(src) {
            searchObj = baseObj;

            if (lastObjPath) {
                searchObj = getFromPath(lastObjPath, baseObj, 3);
                if (!searchObj) {
                    console.error('no object found from last path');
                    lastObjPath = null;
                    searchObj = baseObj;
                }
            }

            var resultObj = decyclicSearch.search(searchObj, src);
            if (resultObj) {
                if (!lastObjPath)
                    lastObjPath = resultObj.p;
                else
                    console.log('last obj path worked!! :D');

                resultObj = getFromPath(resultObj.p, searchObj, 1);
                return resultObj['url'];
            } else if (lastObjPath) {
                lastObjPath = null;
                console.log('lastObjPath didnt work, defaulting to full search');
                return findFullUrl(src);
            } else {
                console.error('tried to find, did not work :(');
                return '';
            }
        }

        // Get object from object given string path
        function getFromPath(path, obj, backCount) {
            backCount = backCount || 0;
            path = path.trim('$').replace(/(\$\[|\])/g, '').split('[');
            for (var i = 0; i < (path.length - backCount); i++) {
                obj = obj[JSON.parse(path[i])];
            }
            return obj;
        }

        function accept() {
            self.currentScreen = self.screens.load;
            self.imageUploader(self.showId, self.imageProperties)
                .success(function (data) {
                    close(data);
                })
                .error(function (err) {
                    console.error(err);
                    self.currentScreen = self.screens.search;
                });
        }

        // Returns to search screen
        function back() {
            self.currentScreen = self.screens.search;
        }

        // function for closing the dialog
        function close(imageProperties) {
            domObserver.disconnect();
            getImageElement().unbind();
            // Clear the image as animation + filter = lag
            self.imageProperties = {};
            var returnObj = {
                hasNewImage: !!imageProperties,
                newImageProperties: imageProperties
            };
            
            $mdDialog.hide(returnObj);
        }
    }
})();