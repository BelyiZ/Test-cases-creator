/** @namespace window.ru.belyiz.pages.TestCase */

(function (global, Pattern, utils, widgets, serices) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.TestCase', TestCase);
    Pattern.extend(TestCase);

    /**
     * @constructor
     */
    function TestCase() {
        this.downloadFileName = 'testCase';

        this.activeTestCaseId = -1;
    }

    TestCase.prototype._cacheElements = function () {
        this.$content = $('#content');
        this.$resultTable = $('#resultTable');
        this.$testCasesListContainer = $('#testCasesListContainer');

        this.$manageTestCaseBtnsContainer = $('.js-manage-test-case-buttons');
        this.$removeTestCaseBtn = this.$manageTestCaseBtnsContainer.find('.js-remove-test-case');
        this.$saveInDatabaseBtn = $('.js-save-in-db');
        this.$localDbBadge = $('.js-local-db-badge');
    };

    TestCase.prototype._createWidgets = function () {
        this.testCaseInfoWidget = new widgets.TestCaseInfo({container: this.$content}).initialize();
        this.testsSetWidget = new widgets.TestsSet({container: this.$content}).initialize();
        this.testCaseResultTableWidget = new widgets.TestCaseResultTable({container: this.$resultTable}).initialize();
        this.testCasesListWidget = new widgets.TestCasesList({container: this.$testCasesListContainer}).initialize();
        this.settingsModalWidget = new widgets.SettingsModal().initialize();

        this.casesVerticalMenu = new widgets.VerticalMenu({menuId: 'casesListVerticalMenu'}).initialize();
    };

    TestCase.prototype._bindEvents = function () {
        global.nodes.body.on('keyup', 'textarea', this._events.onTextAreaKeyup.bind(this));
        global.nodes.body.on('click', '.js-settings-button', this._events.onEditSettingsClick.bind(this));
        global.nodes.body.on('click', '.js-change-db-button', this._events.onChangeDbClick.bind(this));
        global.nodes.body.on('click', '.js-download-file', this._events.onDownloadButtonClick.bind(this));
        global.nodes.body.on('click', '.js-save-in-db', this._events.onSaveInDbClick.bind(this));
        global.nodes.body.on('click', '.js-create-button', this._events.onCreateButtonClick.bind(this));
        global.nodes.body.on('click', '.js-remove-test-case', this._events.onRemoveTestCaseClick.bind(this));

        this.settingsModalWidget.on('save', this._events.onSettingsSaved, this);

        this.testCasesListWidget.on('selected', this._events.onTestCaseSelected, this);
        this.testCasesListWidget.on('multipleSelected', this._events.onMultipleTestCasesSelected, this);
        this.testCasesListWidget.on('multipleSelectionModeOn', this._events.multipleSelectionModeOn, this);
        this.testCasesListWidget.on('multipleSelectionModeOff', this._events.multipleSelectionModeOff, this);

        this.testsSetWidget.on('changed', this._events.onTestsSetChanged, this);

        this.testCaseInfoWidget.on('changed', this._events.onTestCaseDataChanged, this);
    };

    TestCase.prototype._initServices = function () {
        this.databaseService = new serices.DatabaseService({
            onDatabaseSynchronized: this._events.onDatabaseSynchronized.bind(this)
        }).initialize();

        this.databaseService.on('dataBaseChanged', this._events.onDatabaseChanged, this);
    };

    TestCase.prototype._ready = function () {
    };

    TestCase.prototype._events = {
        onTestCaseDataChanged: function () {
            this.testCaseResultTableWidget.reDraw([this.testCaseInfoWidget.getTestCaseData()]);
        },

        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, this.downloadFileName, $target.data('fileType'));
        },

        onCreateButtonClick: function () {
            this.showTestCaseInfo();
            this.testCasesListWidget.resetSelection();
        },

        onRemoveTestCaseClick: function () {
            const testCaseData = this.testCaseInfoWidget.getTestCaseData();
            this.databaseService.removeEntity(testCaseData, () => this.showTestCaseInfo());
            this.showTestCasesList();
        },

        onEditSettingsClick: function () {
            this.databaseService.getSettings(settings => {
                this.settingsModalWidget.show(settings);
            });
        },

        onChangeDbClick: function () {
            this.databaseService.showDbChoosingDialog();
        },

        onSettingsSaved: function (newSettings) {
            this.databaseService.saveSettings(newSettings, (entity) => this.showTestCaseInfo());
            this.testCasesListWidget.resetSelection();
        },

        onTextAreaKeyup: function (e) {
            utils.InputsUtils.resizeTextArea(e.currentTarget);
        },

        onSaveInDbClick: function () {
            const data = this.testCaseInfoWidget.getTestCaseData();
            this.databaseService.saveEntity(data, response => {
                this.showTestCaseInfo(response.id);
                this.showTestCasesList(response.id);
            });
        },

        onTestCaseSelected: function (data) {
            this.casesVerticalMenu.hide();
            this.showTestCaseInfo(data.id);
        },

        onMultipleTestCasesSelected: function (data) {
            if (data.ids && data.ids.length) {
                this.databaseService.allTestCases(data.ids, (docs) => this.testsSetWidget.reDraw(docs));
            } else {
                this.testsSetWidget.reDraw();
            }
        },

        multipleSelectionModeOn: function () {
            this.testsSetWidget.reDraw();
            this.$saveInDatabaseBtn.hide();
            this.$manageTestCaseBtnsContainer.hide();
        },

        multipleSelectionModeOff: function () {
            this.showTestCaseInfo();
            this.$saveInDatabaseBtn.show();
        },

        onTestsSetChanged: function (ids) {
            if (ids && ids.length) {
                this.databaseService.allTestCases(ids, (docs) => {
                    this.testCaseResultTableWidget.reDraw(docs);
                });
            } else {
                this.testCaseResultTableWidget.reDraw();
            }
        },

        onDatabaseSynchronized: function () {
            this.showTestCasesList(this.activeTestCaseId);
            if (this.activeTestCaseId) {
                this.databaseService.getEntity(
                    this.activeTestCaseId,
                    entity => this.testCaseInfoWidget.showDifference(entity),
                    err => {
                        if (err.status === 404 && err.reason === 'deleted') {
                            this.testCaseInfoWidget.removedOnServer();
                            this.$removeTestCaseBtn.hide();
                        } else {
                            this.databaseService.processError.call(this.databaseService, err)
                        }
                    }
                );
            }
        },

        onDatabaseChanged: function (data) {
            this.databaseService.getSettings(settings => {
                this.testCaseResultTableWidget.useMarkDown = !!settings.markdown
            });
            this.showTestCasesList();
            this.showTestCaseInfo();
            this.$localDbBadge.toggle(!!data.local);
        },
    };

    TestCase.prototype.showTestCaseInfo = function (id) {
        function onSuccess(settings, values) {
            this.testCaseInfoWidget.reDraw(settings, values);
            this.testCaseResultTableWidget.reDraw([this.testCaseInfoWidget.getTestCaseData()]);
        }

        this.activeTestCaseId = id || '';

        if (id) {
            this.databaseService.getEntity(id, entity => onSuccess.call(this, entity.settings, entity));
            this.$removeTestCaseBtn.show();
        } else {
            this.databaseService.getSettings(settings => onSuccess.call(this, settings));
            this.$removeTestCaseBtn.hide();
        }
        this.$manageTestCaseBtnsContainer.show();
    };

    TestCase.prototype.showTestCasesList = function (activeId) {
        this.databaseService.allTestCases([], docs => this.testCasesListWidget.reDraw(docs, activeId));
    };

})(window, window.ru.belyiz.patterns.Page, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);