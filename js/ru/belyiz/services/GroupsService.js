/** @namespace window.ru.belyiz.services.GroupsService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(GroupsService);

    /**
     * @constructor
     */
    function GroupsService() {
        this.type = 'groups';
    }

    GroupsService.prototype.getEntity = function (id, callback, errorCallback) {
        services.DatabaseService.getEntityWithRelations(this.type, id, response => {
            if (response[this.type].length) {
                const groupData = response[this.type][0];
                let testCasesById = {};
                let sortedTestCases = [];
                if (groupData && groupData.testCases) {
                    for (let testCase of response[services.TestCasesService.type] || []) {
                        testCasesById[testCase.id] = testCase;
                    }
                    for (let id of groupData.testCases) {
                        sortedTestCases.push(testCasesById[id]);
                    }
                }
                typeof callback === 'function' && callback({
                    group: groupData,
                    testCases: testCasesById,
                    sortedTestCases: sortedTestCases,
                    settings: (groupData && groupData.settings) || {}
                });
            } else {
                typeof errorCallback === 'function' && errorCallback({
                    status: 404
                });
            }
        }, errorCallback);
    };

    GroupsService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveEntity(this.type, data, callback, errorCallback);
    };

    GroupsService.prototype.removeEntity = function (data, callback, errorCallback) {
        services.DatabaseService.removeEntity(this.type, data, () => {
            const msg = (data.headerValues && data.headerValues.name) ? `Группа «${data.headerValues.name}» удалена.` : 'Группа удалена.';
            services.UndoService.show(msg, services.DatabaseService.buildRelId(this.type, data.id), data.rev);
            typeof (callback) === 'function' && callback();
        }, errorCallback);
    };

    GroupsService.prototype.all = function (ids, callback, errorCallback) {
        services.DatabaseService.allDocs(this.type, callback, errorCallback);
    };

    GroupsService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.type, ids, callback, errorCallback);
    };

    GroupsService.prototype.addTestCase = function (groupId, testCaseId, callback, errorCallback) {
        services.DatabaseService.getEntity(this.type, groupId, (group) => {
            group.testCases = utils.ArraysUtils.removeAllMatches(group.testCases, testCaseId);
            group.testCases.push(testCaseId);
            this.saveEntity(group, callback, errorCallback);
        });
    };

    GroupsService.prototype.removeTestCase = function (groupId, testCaseId, callback, errorCallback) {
        services.DatabaseService.getEntity(this.type, groupId, (group) => {
            group.testCases = utils.ArraysUtils.removeAllMatches(group.testCases, testCaseId);
            this.saveEntity(group, callback, errorCallback);
        });
    };

    GroupsService.prototype.setTestCases = function (groupId, testCases, callback, errorCallback) {
        services.DatabaseService.getEntity(this.type, groupId, (group) => {
            group.testCases = testCases || [];
            this.saveEntity(group, callback, errorCallback);
        });
    };

    utils.Package.declare('ru.belyiz.services.GroupsService', new GroupsService().initialize());
})(window, window.ru.belyiz.patterns.AbstractEntityService, window.ru.belyiz.services, window.ru.belyiz.utils);