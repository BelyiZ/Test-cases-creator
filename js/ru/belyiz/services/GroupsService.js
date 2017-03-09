/** @namespace window.ru.belyiz.services.GroupsService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(GroupsService);

    /**
     * @constructor
     */
    function GroupsService() {
        this.groupIdPrefis = 'group';
    }

    GroupsService.prototype.getEntity = function (id, callback, errorCallback) {
        services.DatabaseService.getEntity(id, callback, errorCallback);
    };

    GroupsService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveEntity(this.groupIdPrefis, data, callback, errorCallback);
    };

    GroupsService.prototype.removeEntity = function (data, callback, errorCallback) {
        services.DatabaseService.removeEntity(data, callback, errorCallback);
    };

    GroupsService.prototype.all = function (ids, callback, errorCallback) {
        services.DatabaseService.allDocs(this.groupIdPrefis, [], callback, errorCallback);
    };

    utils.Package.declare('ru.belyiz.services.GroupsService', new GroupsService().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.services, window.ru.belyiz.utils);