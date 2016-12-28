/** @namespace window.ru.belyiz.services.DatabaseService */
(function (global, Pattern, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.services.DatabaseService', DatabaseService);
    Pattern.extend(DatabaseService);

    /**
     * @constructor
     */
    function DatabaseService(setup) {
        setup = setup || {};

        this.databaseName = 'testCases';
        this.settingsDocId = 'params';

        this.ready = false;
    }

    DatabaseService.prototype._init = function (callback) {
        this.db = new PouchDB(this.databaseName);

        this.db.get(this.settingsDocId)
            .then(() => typeof callback === 'function' && callback())
            .catch((err) => {
                if (err.status === 404) {
                    $.getJSON('defaultSettings.json', function (json) {
                        this.saveSettings(json, () => typeof callback === 'function' && callback());
                    });
                }
                console.log(err);
            });
    };

    DatabaseService.prototype.getSettings = function (callback) {
        this.db.get(this.settingsDocId)
            .then(callback)
            .catch((err) => console.log(err));
    };

    DatabaseService.prototype.saveSettings = function (settings, callback) {
        let newSettings = $.extend(true, {}, settings);
        newSettings._id = 'params';
        this.db.put(newSettings)
            .then((response) => {
                newSettings._rev = response._rev;
                this.settings = newSettings;
                if (typeof callback === 'function') {
                    callback();
                }
            })
            .catch(err => console.log(err));
    };


})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.utils);