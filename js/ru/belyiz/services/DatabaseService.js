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

        this.onDatabaseSynchronized = setup.onDatabaseSynchronized;

        this.databaseName = 'testCases';
        this.settingsDocId = 'params';

        this.serverDatabaseUrl = 'http://192.168.130.60:5984/test_cases';

        this.testCaseIdPrefix = 'testCase';

        this._msgOptimisticLock = 'Кто-то успел измененить исходные данные, пока ты редактировал(а). Нужно обновиться и только потом сохранить свои изменения.';
        this._msgUnparsedError = 'Произошла ошибка во время работы с базой данных. Подробности: <br> ';
        this._msgNonDatabaseError = 'Произошла кое-какая ошибка. Подробности: <br> ';
    }

    DatabaseService.prototype._init = function (callback) {
        this.localDB = new PouchDB(this.databaseName, {revs_limit: 10});
        this.remoteDB = new PouchDB(this.serverDatabaseUrl, {revs_limit: 10});

        this.localDB
            .sync(this.remoteDB, {
                live: true,
                retry: true
            })
            .on('change', this._onDatabaseSynchronized.bind(this))
            .on('paused', () => console.debug('Database sync paused.'))
            .on('active', () => console.debug('Database sync resumed.'))
            .on('error', (err) => console.error('Database sync error. ' + err));


        // проверяем наличие настроек в базе, если их нет - загружаем значения по умолчанию из файла
        this.localDB.get(this.settingsDocId)
            .then(() => typeof callback === 'function' && callback())
            .catch((err) => {
                if (err.status === 404) {
                    $.getJSON('defaultSettings.json', function (json) {
                        this.saveSettings(json, () => typeof callback === 'function' && callback());
                    }.bind(this));
                } else {
                    this.processError.call(this, err);
                }
            });
    };

    DatabaseService.prototype._onDatabaseSynchronized = function () {
        console.debug('Database changes synchronized.');
        typeof this.onDatabaseSynchronized === 'function' && this.onDatabaseSynchronized();
    };

    DatabaseService.prototype.processError = function (err) {
        if (!err.status) {
            utils.ShowNotification.error(this._msgNonDatabaseError + err);
        } else if (err.status === 409) {
            utils.ShowNotification.error(this._msgOptimisticLock);
        } else {
            utils.ShowNotification.error(this._msgUnparsedError + JSON.stringify(err));
        }
        console.debug(err);
    };

    DatabaseService.prototype.getSettings = function (callback, errorCallback) {
        this.getEntity(this.settingsDocId, callback, errorCallback);
    };

    DatabaseService.prototype.saveSettings = function (settings, callback, errorCallback) {
        settings._id = this.settingsDocId;
        this.saveEntity(settings, callback, errorCallback);
    };

    DatabaseService.prototype.getEntity = function (id, callback, errorCallback) {
        this.localDB.get(id)
            .then(callback)
            .catch(typeof errorCallback === 'function' && errorCallback || this.processError.bind(this));
    };

    DatabaseService.prototype.saveEntity = function (data, callback, errorCallback) {
        data._id = data._id || this.testCaseIdPrefix + this._generateId(data);

        this.localDB.put(data)
            .then((response) => typeof callback === 'function' && callback(response))
            .catch(typeof errorCallback === 'function' && errorCallback || this.processError.bind(this));
    };

    DatabaseService.prototype.removeEntity = function (data, callback, errorCallback) {
        this.localDB.remove(data)
            .then(() => typeof callback === 'function' && callback())
            .catch(typeof errorCallback === 'function' && errorCallback || this.processError.bind(this));
    };

    DatabaseService.prototype.allTestCases = function (ids, callback, errorCallback) {
        let queryParams = {include_docs: true};
        if (ids && ids.length) {
            queryParams.keys = ids;
        } else {
            queryParams.startkey = this.testCaseIdPrefix;
            queryParams.endkey = this.testCaseIdPrefix + '\uffff';
        }

        this.localDB
            .allDocs(queryParams)
            .then(function (result) {
                let docs = [];
                for (let row of result.rows) {
                    docs.push(row.doc);
                }
                callback(docs);
            })
            .catch(typeof errorCallback === 'function' && errorCallback || this.processError.bind(this));
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