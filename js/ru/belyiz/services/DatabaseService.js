/** @namespace window.ru.belyiz.services.DatabaseService */
(function (global, Pattern, widgets, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.services.DatabaseService', DatabaseService);
    Pattern.extend(DatabaseService);

    /**
     * @constructor
     */
    function DatabaseService(setup) {
        setup = setup || {};

        this.onDatabaseSynchronized = setup.onDatabaseSynchronized;

        this.localSystemDB = null;
        this.localSystemDbName = 'tccSystemDB';
        this.remoteDbSettingsId = '_local/remoteDbSettings';
        this.remoteDbSettingsRev = '';
        this.localDBName = 'testCasesLocal';

        this.localDB = null;
        this.remoteDB = null;
        this.settingsDocId = 'params';

        // this.remoteDbUrl = 'http://testcasecreator-vrn:5984';
        this.remoteDbUrl = 'http://192.168.130.60:5984';

        this.testCaseIdPrefix = 'testCase';

        this._msgOptimisticLock = 'Кто-то успел измененить исходные данные, пока ты редактировал(а). Нужно обновиться и только потом сохранить свои изменения.';
        this._msgUnparsedError = 'Произошла ошибка во время работы с базой данных. Подробности: <br> ';
        this._msgNonDatabaseError = 'Произошла кое-какая ошибка. Подробности: <br> ';

        this._eventHandlers = {};
        this._eventNames = {
            dataBaseChanged: 'dataBaseChanged',
        };
    }

    DatabaseService.prototype._init = function () {
        this.localSystemDB = new PouchDB(this.localSystemDbName);

        this.localSystemDB.get(this.remoteDbSettingsId)
            .then((doc) => {
                this.remoteDbSettingsRev = doc._rev;
                if (doc.name) {
                    this.localDB = new PouchDB(doc.name, {revs_limit: 10});
                    if (!doc.local) {
                        this._initSync(doc.name);
                    }
                    this.trigger(this._eventNames.dataBaseChanged, {local: !!doc.local});
                } else {
                    this.showDbChoosingDialog();
                }
            })
            .catch((err) => {
                if (err.status === 404) {
                    this.showDbChoosingDialog();
                } else {
                    this.processError.call(this, err);
                }
            });
    };

    DatabaseService.prototype._initSync = function (remoteDbName) {
        console.debug(`Connecting to remote DB [${this.remoteDbUrl + '/' + remoteDbName}]`);
        this.remoteDB = new PouchDB(this.remoteDbUrl + '/' + remoteDbName, {revs_limit: 10});
        this.localDB
            .sync(this.remoteDB, {
                live: true,
                retry: true
            })
            .on('change', this._onDatabaseSynchronized.bind(this))
            .on('paused', () => console.debug('Database sync paused.'))
            .on('active', () => console.debug('Database sync resumed.'))
            .on('error', (err) => console.error('Database sync error. ' + err));
    };

    DatabaseService.prototype.showDbChoosingDialog = function () {
        $.get(this.remoteDbUrl + '/_all_dbs', (data) => {
            const $dbsList = $('<div class="list-group"></div>');
            for (let dbName of data) {
                $dbsList.append(`<div class="list-group-item list-group-item-action js-db-name-item" role="button">${dbName}</div>`);
            }

            const modal = new widgets.Modal({
                title: 'Нужно выбрать базу данных',
                cancelBtnText: 'Использовать локальную БД',
                contentHtml: $dbsList[0].outerHTML
            }).initialize();

            let selectedDbName = '';
            const onDbNameSelected = function (e) {
                const $target = $(e.currentTarget);
                selectedDbName = $target.text();
                $('.js-db-name-item').removeClass('active');
                $target.addClass('active');
            }.bind(this);

            const onApplyBtnClick = function () {
                if (selectedDbName) {
                    this.localSystemDB.put({
                        _id: this.remoteDbSettingsId,
                        _rev: this.remoteDbSettingsRev,
                        name: selectedDbName,
                        local: false
                    })
                        .then(() => {
                            this._init();
                            modal.hide();
                        })
                        .catch(this.processError.bind(this));

                } else {
                    utils.ShowNotification.error('Нельзя просто так взять и закрыть окно, ничего не выбрав!')
                }
            }.bind(this);

            const onCancelBtnClick = function () {
                this.localSystemDB.put({_id: this.remoteDbSettingsId, _rev: this.remoteDbSettingsRev, name: this.localDBName, local: true})
                    .then(this._init.bind(this))
                    .catch(this.processError.bind(this));
            }.bind(this);

            modal.on('show', () => global.nodes.body.on('click', '.js-db-name-item', onDbNameSelected), this);
            modal.on('hide', () => global.nodes.body.off('click', '.js-db-name-item', onDbNameSelected), this);
            modal.on('apply', onApplyBtnClick, this);
            modal.on('cancel', onCancelBtnClick, this);

            modal.show();
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

    /**
     * Получаем из базы данных настройки проекта, если их нет - загружаем значения по умолчанию из файла
     * @param callback функция, которая выполнить в случае успешной инициализации настроекд
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.getSettings = function (callback, errorCallback) {
        this.localDB.get(this.settingsDocId)
            .then(typeof callback === 'function' && callback)
            .catch((err) => {
                if (err.status === 404) {
                    $.getJSON('defaultSettings.json', function (json) {
                        this.saveSettings(json, () => typeof successCallback === 'function' && successCallback());
                    }.bind(this));
                } else {
                    typeof errorCallback === 'function' && errorCallback() || this.processError.bind(this);
                }
            });
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
        if (!data._id) {
            delete data._id;
            delete data._rev;
            delete data.hash;

            data.hash = this._generateHash(data);
            data._id = this.testCaseIdPrefix + data.hash + Math.random();
        }

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

    DatabaseService.prototype._generateHash = function (data) {
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

})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.widgets, window.ru.belyiz.utils);