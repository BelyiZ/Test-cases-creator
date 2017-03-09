/** @namespace window.ru.belyiz.services.TestCasesService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(TestCasesService);

    /**
     * @constructor
     */
    function TestCasesService() {
        this.testCaseIdPrefix = 'testCase';
    }

    TestCasesService.prototype.getEntity = function (id, callback, errorCallback) {
        services.DatabaseService.getEntity(id, callback, errorCallback);
    };

    TestCasesService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveEntity(this.testCaseIdPrefix, data, callback, errorCallback);
    };

    TestCasesService.prototype.removeEntity = function (data, callback, errorCallback) {
        services.DatabaseService.removeEntity(data, callback, errorCallback);
    };

    TestCasesService.prototype.all = function (ids, callback, errorCallback) {
        services.DatabaseService.allDocs(this.testCaseIdPrefix, [], callback, errorCallback);
    };

    utils.Package.declare('ru.belyiz.services.TestCasesService', new TestCasesService().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.services, window.ru.belyiz.utils);