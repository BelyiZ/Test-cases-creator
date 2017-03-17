/** @namespace window.ru.belyiz.services.TestCasesService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(TestCasesService);

    /**
     * @constructor
     */
    function TestCasesService() {
        this.testCaseIdPrefix = 'testCases';
    }

    TestCasesService.prototype.getEntity = function (id, callback, errorCallback) {
        services.DatabaseService.getEntity(this.testCaseIdPrefix, id, callback, errorCallback);
    };

    TestCasesService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveEntity(this.testCaseIdPrefix, data, callback, errorCallback);
    };

    TestCasesService.prototype.removeEntity = function (data, callback, errorCallback) {
        services.DatabaseService.removeEntity(this.testCaseIdPrefix, data, callback, errorCallback);
    };

    TestCasesService.prototype.all = function (ids, callback, errorCallback) {
        services.DatabaseService.allDocs(this.testCaseIdPrefix, callback, errorCallback);
    };

    TestCasesService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.testCaseIdPrefix, ids, callback, errorCallback);
    };

    TestCasesService.prototype.findGroups = function (testCaseId, callback, errorCallback) {
        services.DatabaseService.indexQuery(
            'myIndex/groupsByTestCaseId',
            {key: testCaseId},
            result => {
                let ids = $.map(result.rows, row => {
                    return services.DatabaseService.parseId(row.id);
                });
                (ids.length && services.GroupsService.some(ids, callback, errorCallback)) || callback([]);
            },
            errorCallback
        );
    };

    utils.Package.declare('ru.belyiz.services.TestCasesService', new TestCasesService().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.services, window.ru.belyiz.utils);