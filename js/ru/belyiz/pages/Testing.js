/** @namespace window.ru.belyiz.pages.Testing */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.Testing', Testing);
    Pattern.extend(Testing);

    /**
     * @constructor
     */
    function Testing(setup) {
        setup = setup || {};
    }

    Testing.prototype._cacheElements = function () {
        this.$content = $('#content');
        this.$resultTable = $('#resultTable');
        this.$itemsListContainer = $('#itemsVerticalListContainer');
    };

    Testing.prototype._createWidgets = function () {
        this.entityInfoWidget = new widgets.TestCaseExecute({
            container: this.$content,
            entityService: services.TestCasesService
        }).initialize();

        this.entitiesListWidget = new widgets.ItemsList({
            emptyListMsg: 'Нет сохраненных тест кейсов',
            container: this.$itemsListContainer
        }).initialize();

        this.testCaseResultTableWidget = new widgets.TestingResultTable({container: this.$resultTable}).initialize();
    };

    Testing.prototype._bindWidgetsEvents = function () {
        this._unbindWidgetsEvents();
        this.entityInfoWidget.on('changed', this._events.onTestCaseDataChanged, this);
        this.entitiesListWidget.on('selected', this._events.onItemSelected, this);
        services.DatabaseService.on('dbChanged', this._events.onDatabaseChanged, this);
        services.DatabaseService.on('dbSynchronized', this._events.onDatabaseSynchronized, this);
        services.UndoService.on('undo', this._events.onActionUndo, this);
    };

    Testing.prototype._unbindWidgetsEvents = function () {
        this.entitiesListWidget.off('selected', this._events.onItemSelected);
        services.DatabaseService.off('dbChanged', this._events.onDatabaseChanged);
        services.DatabaseService.off('dbSynchronized', this._events.onDatabaseSynchronized);
        services.UndoService.off('undo', this._events.onActionUndo);
        this.entityInfoWidget.off('changed', this._events.onTestCaseDataChanged, this);
    };

    Testing.prototype._bindEvents = function () {
        this._bindWidgetsEvents();

        global.nodes.body.on('keyup', '[data-page-code="Testing"] textarea', this._events.onTextAreaKeyup.bind(this));
        global.nodes.body.on('click', '[data-page-code="Testing"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
    };


    Testing.prototype._events = {
        onTestCaseDataChanged: function () {
            this.testCaseResultTableWidget.reDraw([this.entityInfoWidget.getData()]);
        },

        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, 'testingResult', $target.data('fileType'));
        },

        onTextAreaKeyup: function (e) {
            utils.InputsUtils.resizeTextArea(e.currentTarget);
        },

        onSaveButtonClick: function () {
            // todo сохранить в базе
        },

        onDatabaseChanged: function () {
            this.showEntitiesList();
            this.showEntityInfo();
        },

        onDatabaseSynchronized: function () {
            // todo перезапусти или продолжить
        },

        onItemSelected: function (data) {
            global.nodes.body.trigger('closeVerticalMenu');
            this.showEntityInfo(data.id);
        },
    };

    Testing.prototype._prepareTestCasesForList = function (docs) {
        let testCases = [];
        for (let doc of docs) {
            let testCase = {id: doc.id, rev: doc.rev};
            for (let rowParams of doc.settings.headerParams.rows) {
                testCase[rowParams.name] = doc.headerValues[rowParams.code];
            }

            testCases.push(testCase);
        }
        return testCases;
    };


    Testing.prototype._ready = function () {
        this.$content.html('');
        this.$itemsListContainer.html('');
        this.$resultTable.html('');
        $('.js-manage-item-buttons').hide();

        if (services.DatabaseService.isInitialized()) {
            this.showEntitiesList();
        }
    };

    Testing.prototype.enable = function () {
        this._bindWidgetsEvents();
        this._ready();
    };

    Testing.prototype.disable = function () {
        this._unbindWidgetsEvents();
    };

    Testing.prototype.showEntityInfo = function (id) {
        function onSuccess(testCaseInfo) {
            this.entityInfoWidget.reDraw(testCaseInfo);
            this.testCaseResultTableWidget.reDraw([this.entityInfoWidget.getData()]);
        }

        this.activeEntityId = id || '';

        if (id) {
            services.TestCasesService.getEntity(id, entity => onSuccess.call(this, entity));
        } else {
            onSuccess.call(this);
        }
    };

    Testing.prototype._prepareTestCasesForList = function (docs) {
        let testCases = [];
        for (let doc of docs) {
            let testCase = {id: doc.id, rev: doc.rev};
            for (let rowParams of doc.settings.headerParams.rows) {
                testCase[rowParams.name] = doc.headerValues[rowParams.code];
            }
            testCases.push(testCase);
        }
        return testCases;
    };

    Testing.prototype.showEntitiesList = function (activeId) {
        services.TestCasesService.all([], docs => {
            const entities = this._prepareTestCasesForList(docs);
            this.entitiesListWidget.reDraw(entities, activeId);
        });
    };

})(window, window.ru.belyiz.patterns.Page, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);