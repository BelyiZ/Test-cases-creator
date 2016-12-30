/** @namespace window.ru.belyiz.services.DatabaseService */
(function (global, Pattern, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.services.DatabaseService', DatabaseService);
    Pattern.extend(DatabaseService);

    /**
     * @constructor
     */
    function DatabaseService() {
        this.databaseName = 'testCases';
        this.settingsDocId = 'params';

        this.testCaseIdPrefix = 'testCase';
    }

    DatabaseService.prototype._init = function (callback) {
        this.db = new PouchDB(this.databaseName, {revs_limit: 10});


        this.db.get(this.settingsDocId)
            .then(() => typeof callback === 'function' && callback())
            .catch((err) => {
                if (err.status === 404) {
                    $.getJSON('defaultSettings.json', function (json) {
                        this.saveSettings(json, () => typeof callback === 'function' && callback());
                    }.bind(this));
                } else {
                    console.log(err);
                }
            });
    };

    DatabaseService.prototype.getSettings = function (callback) {
        this.getEntity(this.settingsDocId, callback);
    };

    DatabaseService.prototype.saveSettings = function (settings, callback) {
        settings._id = 'params';
        this.saveEntity(settings, callback);
    };

    DatabaseService.prototype.getEntity = function (id, callback) {
        this.db.get(id)
            .then(callback)
            .catch((err) => console.log(err));
    };

    DatabaseService.prototype.saveEntity = function (data, callback) {
        if (!data._id) {
            data._id = this.testCaseIdPrefix + this._generateId(data);
        }
        this.db.put(data)
            .then((response) => {
                if (typeof callback === 'function') {
                    callback(response);
                }
            })
            .catch(err => console.log(err));
    };

    DatabaseService.prototype.removeEntity = function (data, callback) {
        this.db.remove(data)
            .then((response) => {
                testCase._rev = response.rev;
                callback();
            })
            .catch(err => console.log(err));
    };

    DatabaseService.prototype.allTestCases = function (callback) {
        this.db
            .allDocs({
                include_docs: true,
                startkey: this.testCaseIdPrefix,
                endkey: this.testCaseIdPrefix + '\uffff'
            })
            .then(function (result) {
                let docs = [];
                for (let row of result.rows) {
                    docs.push(row.doc);
                }
                callback(docs);
            })
            .catch(err => console.log(err));
    };

    DatabaseService.prototype._generateId = function (data) {
        const string = '' + JSON.stringify(data);
        let hash = 0, i, chr, len;
        if (string.length !== 0) {
            for (i = 0, len = string.length; i < len; i++) {
                chr = string.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
        }
        return hash;
    };

})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.utils);