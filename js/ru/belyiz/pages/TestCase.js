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
    }

    TestCase.prototype._cacheElements = function () {
        this.$content = $('#content');
        this.$resultContent = $('#resultContent');
        this.$resultTable = $('#resultTable');
        this.$testCasesListContainer = $('#testCasesListContainer');

        this.$createTestCaseBtn = $('.js-create-button');
        this.$removeTestCaseBtn = $('.js-remove-test-case');
    };

    TestCase.prototype._createWidgets = function () {
        this.testCaseInfoWidget = new widgets.TestCaseInfo({container: this.$content}).initialize();
        this.testCaseResultTableWidget = new widgets.TestCaseResultTable({container: this.$resultTable}).initialize();
        this.testCasesListWidget = new widgets.TestCasesList({container: this.$testCasesListContainer}).initialize();
        this.settingsModalWidget = new widgets.SettingsModal().initialize();
    };

    TestCase.prototype._bindEvents = function () {
        global.nodes.body.on('click', '.js-do-magic', this._events.onGenerateTableClick.bind(this));
        global.nodes.body.on('keyup', 'textarea', this._events.onTextAreaKeyup.bind(this));
        global.nodes.body.on('keyup paste change', 'textarea,input', () => this.$resultContent.hide());
        global.nodes.body.on('click', '.js-settings-button', this._events.onEditSettingsClick.bind(this));
        global.nodes.body.on('click', '.js-download-file', this._events.onDownloadButtonClick.bind(this));
        global.nodes.body.on('click', '.js-save-in-db', this._events.onSaveInDbClick.bind(this));
        global.nodes.body.on('click', '.js-create-button', this._events.onCreateButtonClick.bind(this));
        global.nodes.body.on('click', '.js-remove-test-case', this._events.onRemoveTestCaseClick.bind(this));

        this.settingsModalWidget.on('save', this._events.onSettingsSaved, this);
        this.testCasesListWidget.on('selected', this._events.onTestCaseSelected, this);
    };

    TestCase.prototype._initServices = function () {
        this.databaseService = new serices.DatabaseService().initialize(this.showTestCaseInfo.bind(this));
    };

    TestCase.prototype._ready = function () {
        this.showTestCasesList();
    };

    TestCase.prototype._events = {
        onGenerateTableClick: function () {
            this.databaseService.getSettings(settings => {
                this.testCaseResultTableWidget.reDraw(settings, this.testCaseInfoWidget.getTestCaseData());
                this.$resultContent.slideDown();
            });
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
            this.showTestCaseInfo(data.id);
        }
    };

    TestCase.prototype.showTestCaseInfo = function (id) {
        function onSuccess(settings, values) {
            this.testCaseInfoWidget.reDraw(settings, values);
            this.$resultContent.slideUp();
        }

        if (id) {
            this.databaseService.getEntity(id, entity => onSuccess.call(this, entity.settings, entity));
            this.$createTestCaseBtn.show();
            this.$removeTestCaseBtn.show();
        } else {
            this.databaseService.getSettings(settings => onSuccess.call(this, settings));
            this.$createTestCaseBtn.hide();
            this.$removeTestCaseBtn.hide();
        }
    };

    TestCase.prototype.showTestCasesList = function (activeId) {
        this.databaseService.allTestCases(docs => this.testCasesListWidget.reDraw(docs, activeId));
    };

})(window, window.ru.belyiz.patterns.Page, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);