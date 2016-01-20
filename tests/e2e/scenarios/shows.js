'use strict';

var ShowList = require('../pages/show-list.js');
var ShowDetails = require('../pages/show-details.js');
var Help = require('../help/helpers.js');
var requestP = require('request-promise');

// Jquery HasClass Implementation
function hasClass(element, selector) {
  var className = " " + selector + " ";
  return (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(" thatClass ") > -1;
}

describe('my app', function () {

  var shows = new ShowList();
  var details = new ShowDetails();
  var help = new Help();

  beforeEach(function () {
    browser.wait(requestP(browser.params.testUrl + '/shows/reset')).then(function () {
      shows.loadAll();
    });
  });

  it('should load a list of shows', function () {
    expect(shows.count()).toBeGreaterThan(1);
  });

  describe('selecting a show', function () {

    it('should display a different show title in the details', function () {
        shows.selectShow(0);
        var name = details.showName();
        shows.selectShow(1);
        expect(details.showName()).not.toEqual(name);
    });
  });

  describe('toggling a show as complete', function () {

    it('should hide the "next" input', function () {
      shows.selectShow(0);
      var checkbox = element(by.model('ul.selected.watched'));
      var checkboxVal = checkbox.getAttribute('aria-checked');
      var nextBoxDisplayed = element(by.model('ul.selected.next')).isDisplayed();

      var initialValue, initialDisplayed;

      checkboxVal.then(function (v) {
          initialValue = v;
      });

      nextBoxDisplayed.then(function (v) {
          initialDisplayed = v;
      });

      checkbox.click();
      expect(checkboxVal).not.toEqual(initialValue);
      expect(nextBoxDisplayed).not.toEqual(initialDisplayed);
    });
  });

  describe('adding a show', function () {
    it('should initialise as invalid', function () {
      expect(details.showForm().getAttribute('class')).toMatch('ng-valid');
      details.addButton().click();
      expect(details.showForm().getAttribute('class')).toMatch('ng-invalid');
    });

    it('should add the show to the list', function () {
      browser.wait(shows.count()).then(function (val) {
        details.addButton().click();
        expect(shows.count()).toBe(val + 1);
      });
    });

    it('should save to the database when valid, not before', function () {
      var serverCountUrl = {
        uri: browser.params.testUrl + '/shows/count',
        transform: function (body) {
          return JSON.parse(body);
        }
      }

      browser.wait(requestP(serverCountUrl)).then(function (initialCount) {
        details.addButton().click();
        expect(details.showForm().getAttribute('class')).toMatch('ng-invalid');

        expect(requestP(serverCountUrl)).toEqual(initialCount);

        details.getModelField('ul.selected.name').element(by.css('[contenteditable]')).sendKeys('My favourite show');
        element(by.css('md-select[name=filmType]')).click();
        element(by.css('md-option[value=episodes]')).click();

        expect(details.showForm().getAttribute('class')).toMatch('ng-valid');

        browser.sleep(1000).then(function () {
            expect(requestP(serverCountUrl)).toBe(initialCount + 1);
        });
      });
    });

    it('should not be able to add another one before the first one is valid', function () {
      var initialCount;

      browser.wait(shows.count()).then(function (count) {
        initialCount = count;

        details.addButton().click();
        expect(shows.count()).toBe(initialCount + 1);
        element(by.css('md-select[name=filmType]')).click();
        element(by.css('md-option[value=episodes]')).click();
        expect(details.showForm().getAttribute('class')).toMatch('ng-invalid');

        return browser.sleep(1000);
      }).then(function () {
        expect(details.showForm().getAttribute('class')).toMatch('ng-invalid');
        details.addButton().click();
        expect(shows.count()).toBe(initialCount + 1);
        details.getModelField('ul.selected.name').element(by.css('[contenteditable]')).sendKeys('Best test');

        expect(details.showForm().getAttribute('class')).toMatch('ng-valid');
        return browser.sleep(1200);
      }).then(function () {
        expect(details.showForm().getAttribute('class')).toMatch('ng-pristine');
        details.addButton().click();
        expect(shows.count()).toBe(initialCount + 2);
        expect(details.showForm().getAttribute('class')).toMatch('ng-invalid');
      });
    });
  });

  describe('ordering shows', function() {
    beforeEach(function () {
      browser.wait(requestP(browser.params.testUrl + '/shows/reset')).then(function () {
        shows.loadAll();
      });
    });

    it('should begin in date modified order', function() {
      var selectedName;
      shows.getShowNames().then(function(names) {
        selectedName = names[2];
        shows.selectShow(2);
        details.getModelField('ul.selected.watched').click();
        return browser.sleep(1000);
      }).then(function() {
        return shows.getShowNames();
      }).then(function(names) {
        expect(names[0]).toEqual(selectedName);
        selectedName = names[1];
        shows.selectShow(1);
        details.getModelField('ul.selected.watched').click();
        return browser.sleep(1000);
      }).then(function() {
        return shows.getShowNames();
      }).then(function(names) {
        expect(names[0]).toEqual(selectedName);
        shows.reverseOrder();
        return browser.sleep(1000);
      }).then(function() {
        return shows.getShowNames();
      }).then(function(names) {
        expect(names[2]).toEqual(selectedName);
        shows.reverseOrder();
        return browser.sleep(1000);
      }).then(function() {
        return shows.getShowNames();
      }).then(function(names) {
        expect(names[0]).toEqual(selectedName);
      });
    });

    it('Should allow different orders', function() {
      var showNames, descendingNames, ascendingNames;
      shows.getShowNames().then(function(names) {
        showNames = names;
        ascendingNames = names.slice().sort();
        descendingNames = ascendingNames.slice().reverse();
        shows.selectOrder('name');
        expect(shows.getShowNames()).toEqual(descendingNames);
        shows.reverseOrder();
        expect(shows.getShowNames()).toEqual(ascendingNames);
        shows.reverseOrder();
        shows.selectOrder('watched');
        return shows.getShowNames();
      }).then(function(names) {
        expect(names[0]).toEqual('Test Show 3');
        shows.reverseOrder();
        return shows.getShowNames();
      }).then(function(names) {
        expect(names[2]).toEqual('Test Show 3');
      });
    });
  });
});
