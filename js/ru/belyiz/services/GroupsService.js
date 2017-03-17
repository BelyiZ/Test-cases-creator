/** @namespace window.ru.belyiz.services.GroupsService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(GroupsService);

    /**
     * @constructor
     */
    function GroupsService() {
        this.groupIdPrefis = 'groups';
    }

    GroupsService.prototype.getEntity = function (id, callback, errorCallback) {
        services.DatabaseService.getEntityWithRelations(this.groupIdPrefis, id, response => {
            const groupData = (response[this.groupIdPrefis].length ? response[this.groupIdPrefis][0] : null);
            let testCases = {};
            for (let testCase of response[services.TestCasesService.testCaseIdPrefix] || []) {
                testCases[testCase.id] = testCase;
            }
            callback({
                group: groupData,
                testCases: testCases,
                settings: (groupData && groupData.settings) || {}
            });
        }, errorCallback);
    };

    GroupsService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveEntity(this.groupIdPrefis, data, callback, errorCallback);
    };

    GroupsService.prototype.removeEntity = function (data, callback, errorCallback) {
        services.DatabaseService.removeEntity(this.groupIdPrefis, data, callback, errorCallback);
    };

    GroupsService.prototype.all = function (ids, callback, errorCallback) {
        services.DatabaseService.allDocs(this.groupIdPrefis, callback, errorCallback);
    };

    GroupsService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.groupIdPrefis, ids, callback, errorCallback);
    };

    GroupsService.prototype.addTestCase = function (groupId, testCaseId, callback, errorCallback) {
        services.DatabaseService.getEntity(this.groupIdPrefis, groupId, (group) => {
            group.testCases.push(testCaseId);
            this.saveEntity(group, callback, errorCallback);
        });
    };

    GroupsService.prototype.removeTestCase = function (groupId, testCaseId, callback, errorCallback) {
        services.DatabaseService.getEntity(this.groupIdPrefis, groupId, (group) => {
            group.testCases.splice($.inArray(testCaseId, group.testCases), 1);
            this.saveEntity(group, callback, errorCallback);
        });
    };

    utils.Package.declare('ru.belyiz.services.GroupsService', new GroupsService().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.services, window.ru.belyiz.utils);