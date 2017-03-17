/** @namespace window.ru.belyiz.services.DatabaseService */
(function (global, Pattern, widgets, utils) {
    'use strict';
    Pattern.extend(DatabaseService);

    /**
     * @constructor
     */
    function DatabaseService() {
        this.localSystemDB = null;
        this.localSystemDbName = 'tccSystemDB';
        this.remoteDbSettingsId = '_local/remoteDbSettings';
        this.remoteDbSettingsRev = '';
        this.localDBName = 'testCasesLocal';

        this.localDB = null;
        this.remoteDB = null;
        this.settingsDocId = 'params';

        this.schema = [
            {singular: 'settings', plural: 'settings'},
            {singular: 'testCases', plural: 'testCases'},
            {singular: 'groups', plural: 'groups', relations: {testCases: {hasMany: 'testCases'}}}
        ];

        this.index = {
            _id: '_design/myIndex',
            views: {
                groupsByTestCaseId: {
                    map: 'function(doc) { ' +
                    '   for (let id of doc.data.testCases) { emit(id); }' +
                    '}'
                }
            }
        };

        this.remoteDbUrl = 'http://testcasecreator-vrn/couchdb';

        this.initialized = false;

        this._msgOptimisticLock = 'Кто-то успел измененить исходные данные, пока ты редактировал(а). Нужно обновиться и только потом сохранить свои изменения.';
        this._msgUnparsedError = 'Произошла ошибка во время работы с базой данных. Подробности: <br> ';
        this._msgNonDatabaseError = 'Произошла кое-какая ошибка. Подробности: <br> ';

        this._eventHandlers = {};
        this._eventNames = {
            dbChanged: 'dbChanged',
            dbSynchronized: 'dbSynchronized',
        };
    }

    DatabaseService.prototype._init = function () {
        this._initDbChoosingDialog();
        this._initDatabases();
    };

    DatabaseService.prototype._initDatabases = function () {
        this.localSystemDB = new PouchDB(this.localSystemDbName);
        this.localSystemDB.get(this.remoteDbSettingsId)
            .then((doc) => {
                this.remoteDbSettingsRev = doc._rev;
                if (doc.name) {
                    this.localDB = new PouchDB(doc.name, {revs_limit: 10});
                    this.localDB.setSchema(this.schema);
                    this.localDB
                        .put(this.index)
                        .catch(err => {
                            if (err.name !== 'conflict') {
                                this.processError(err);
                            }
                        });

                    const finishInitialization = function () {
                        this.initialized = true;
                        this.trigger(this._eventNames.dbChanged, {local: !!doc.local, name: doc.name});
                    }.bind(this);
                    if (doc.local) {
                        this.getSettings(finishInitialization);
                    } else {
                        this._initSync(doc.name);
                        finishInitialization();
                    }
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
            .on('change', () => {
                console.debug('Database changes synchronized.');
                this.trigger(this._eventNames.dbSynchronized);
            })
            .on('paused', () => console.debug('Database sync paused.'))
            .on('active', () => console.debug('Database sync resumed.'))
            .on('error', (err) => console.error('Database sync error. ' + err));
    };

    DatabaseService.prototype._initDbChoosingDialog = function () {
        this.dbChoosingModal = new widgets.Modal({
            title: 'Нужно выбрать базу данных',
            cancelBtnText: 'Использовать локальную БД',
        }).initialize();

        let selectedDbName = '';

        global.nodes.body.on('click', '.js-db-name-item', function (e) {
            const $target = $(e.currentTarget);
            selectedDbName = $target.text();
            $('.js-db-name-item').removeClass('active');
            $target.addClass('active');
        }.bind(this));

        this.dbChoosingModal.on('apply', () => {
            if (selectedDbName) {
                this.localSystemDB
                    .put({_id: this.remoteDbSettingsId, _rev: this.remoteDbSettingsRev, name: selectedDbName, local: false})
                    .then(() => {
                        this._initDatabases();
                        this.dbChoosingModal.hide();
                    })
                    .catch(this.processError.bind(this));
            } else {
                utils.ShowNotification.error('Нельзя просто так взять и закрыть окно, ничего не выбрав!')
            }
        });

        this.dbChoosingModal.on('cancel', function () {
            this.localSystemDB
                .put({_id: this.remoteDbSettingsId, _rev: this.remoteDbSettingsRev, name: this.localDBName, local: true})
                .then(this._initDatabases.bind(this))
                .catch(this.processError.bind(this));
        }, this);
    };

    DatabaseService.prototype.showDbChoosingDialog = function () {
        $.get(this.remoteDbUrl + '/_all_dbs', (data) => {
            const $dbsList = $('<div class="list-group"></div>');
            for (let dbName of data) {
                if (!dbName.startsWith('_')) {
                    $dbsList.append(`<div class="list-group-item list-group-item-action js-db-name-item" role="button">${dbName}</div>`);
                }
            }
            this.dbChoosingModal.setContentHtml($dbsList[0].outerHTML);
            this.dbChoosingModal.show();
        });
    };

    /**
     * Обработка ошибок возникающих во время работы с базой данных или коллбэках
     * @param err информация об ошибке
     */
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
     * @param callback функция, которая выполнить в случае успешной инициализации настроек
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.getSettings = function (callback, errorCallback) {
        this.getEntity(
            'settings', this.settingsDocId,
            doc => {
                if (doc) {
                    typeof callback === 'function' && callback(doc);
                } else {
                    $.getJSON('defaultSettings.json', (json) => this.saveSettings(json, callback));
                }
            },
            errorCallback
        );
    };

    /**
     * Сохранение новых значений настроек в базе данных
     * @param settings новые настройки
     * @param callback функция, которая выполнить в случае успешной инициализации настроек
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.saveSettings = function (settings, callback, errorCallback) {
        settings.id = this.settingsDocId;
        this.saveEntity('settings', settings, callback, errorCallback);
    };

    /**
     * Выполнение запроса по построенному индексу
     * @param indexName название индекса
     * @param options параметры запроса
     * @param callback функция, которая выполнить в случае успешной инициализации настроек
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.indexQuery = function (indexName, options, callback, errorCallback) {
        this.localDB.query(indexName, options)
            .then(callback)
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Запрос данных сущности по ее типу и идентификатору.
     * Возвращаются только сами данных сущности, все дочерние элементы откидываются
     * @param type тип сущности
     * @param id идентификатор сущности
     * @param callback функция, которая выполнить в случае успешной инициализации настроек
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.getEntity = function (type, id, callback, errorCallback) {
        this.localDB.rel.find(type, id)
            .then(result => callback(result[type].length ? result[type][0] : null))
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Запрос данных сущности по ее типу и идентификатору.
     * Возвращаются данные самой сущности, а так же данные сущностей, которые к ней относятся
     * @param type тип сущности
     * @param id идентификатор сущности
     * @param callback функция, которая выполнить в случае успешной инициализации настроек
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.getEntityWithRelations = function (type, id, callback, errorCallback) {
        this.localDB.rel.find(type, id)
            .then(callback)
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Сохранение сущности в базе данных
     * @param type тип сущности
     * @param data данные сущности
     * @param callback функция, которая выполнить в случае успешной инициализации настроек
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.saveEntity = function (type, data, callback, errorCallback) {
        if (!data.id) {
            delete data.id;
            delete data.rev;
            delete data.hash;

            data.hash = this._generateHash(data);
            data.id = $.now();
        }

        this.localDB.rel.save(type, data)
            .then((result) => typeof callback === 'function' && callback(result[type].length ? result[type][0] : {}))
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Удаление сущности из базе данных
     * @param type тип сущности
     * @param data данные сущности. Объект должен содержать id и rev параметры!
     * @param callback функция, которая выполнить в случае успешной инициализации настроек
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.removeEntity = function (type, data, callback, errorCallback) {
        this.localDB.rel.del(type, data)
            .then(() => typeof callback === 'function' && callback())
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Запрос всех сущностей одного типа
     * @param type тип сущности
     * @param callback функция, которая выполнить в случае успешной инициализации настроек
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.allDocs = function (type, callback, errorCallback) {
        this.localDB.rel
            .find(type)
            .then(result => callback(result[type]))
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Запрос сущностей одного типа по списку идентификаторов
     * @param type тип сущности
     * @param ids список идентификаторов
     * @param callback функция, которая выполнить в случае успешной инициализации настроек
     * @param errorCallback функция, которая выполнить в случае ошибки
     */
    DatabaseService.prototype.someDocs = function (type, ids, callback, errorCallback) {
        this.localDB.rel
            .find(type, ids)
            .then(result => callback(result[type]))
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Получение числового идентификатора сущности по комплексному (от relational-pouch)
     * @param id комплексный идентификатор сущности
     */
    DatabaseService.prototype.parseId = function (id) {
        return this.localDB.rel.parseDocID(id).id;
    };


    /**
     * Получение типа сущности по комплексному идентификатору (от relational-pouch)
     * @param id комплексный идентификатор сущности
     */
    DatabaseService.prototype.parseType = function (id) {
        return this.localDB.rel.parseDocID(id).type;
    };

    /**
     * @returns {boolean} готов ли сервис к использованию
     */
    DatabaseService.prototype.isInitialized = function () {
        return this.initialized;
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

    utils.Package.declare('ru.belyiz.services.DatabaseService', new DatabaseService().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.widgets, window.ru.belyiz.utils);