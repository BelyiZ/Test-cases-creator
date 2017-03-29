/** @namespace window.ru.belyiz.services.TestCasesService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(TestCasesService);

    /**
     * @constructor
     */
    function TestCasesService() {
        this.type = 'testCases';
    }

    TestCasesService.prototype.getEntity = function (id, callback, errorCallback) {
        services.DatabaseService.getEntity(this.type, id, callback, errorCallback);
    };

    TestCasesService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveEntity(this.type, data, callback, errorCallback);
    };

    TestCasesService.prototype.removeEntity = function (data, callback, errorCallback) {
        services.DatabaseService.removeEntity(this.type, data, () => {
            const msg = (data.headerValues && data.headerValues.name) ? `Тест-кейс «${data.headerValues.name}» удален.` : 'Тест-кейс удален.';
            services.UndoService.show(msg, services.DatabaseService.buildRelId(this.type, data.id), data.rev);
            typeof (callback) === 'function' && callback();
        }, errorCallback);
    };

    TestCasesService.prototype.all = function (ids, callback, errorCallback) {
        services.DatabaseService.allDocs(this.type, callback, errorCallback);
    };

    TestCasesService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.type, ids, callback, errorCallback);
    };

    TestCasesService.prototype.findGroups = function (testCaseId, callback, errorCallback) {
        services.DatabaseService.find(
            {
                selector: {
                    'data.testCases': {
                        '$elemMatch': {'$eq': testCaseId}
                    }
                }
            },
            result => {
                let ids = $.map(result.docs, doc => {
                    return services.DatabaseService.parseId(doc._id);
                });
                (ids.length && services.GroupsService.some(ids, callback, errorCallback)) || callback([]);
            },
            errorCallback
        );
    };

    utils.Package.declare('ru.belyiz.services.TestCasesService', new TestCasesService().initialize());
})(window, window.ru.belyiz.patterns.AbstractEntityService, window.ru.belyiz.services, window.ru.belyiz.utils);