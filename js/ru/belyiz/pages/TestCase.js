/** @namespace window.ru.belyiz.pages.TestCase */

(function (global, Pattern, utils, widgets, serices) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.TestCase', TestCase);
    Pattern.extend(TestCase);

    /**
     * @constructor
     */
    function TestCase(setup) {
        setup = setup || {};

        this.downloadFileName = 'testCase';
    }

    TestCase.prototype._cacheElements = function () {
        this.$content = $('#content');
        this.$resultContent = $('#resultContent');
        this.$resultTable = $('#resultTable');
    };

    TestCase.prototype._createWidgets = function () {
        this.testCaseInfoWidget = new widgets.TestCaseInfo({container: this.$content}).initialize();
        this.TestCaseResultTableWidget = new widgets.TestCaseResultTable({container: this.$resultTable}).initialize();
        this.settingsModalWidget = new widgets.SettingsModal().initialize();
    };

    TestCase.prototype._bindEvents = function () {

    };
    TestCase.prototype._initServices = function () {
        this.databaseService = new serices.DatabaseService().initialize(this.showTestCaseInfo.bind(this));
    };

    TestCase.prototype._ready = function () {
        global.nodes.body.on('click', '.js-do-magic', this._events.onGenerateTableClick.bind(this));
        global.nodes.body.on('keyup', 'textarea', this._events.onTextAreaKeyup.bind(this));
        global.nodes.body.on('keyup paste change', 'textarea,input', () => this.$resultContent.hide());
        global.nodes.body.on('click', '.js-settings-button', this._events.onEditSettingsClick.bind(this));
        global.nodes.body.on('click', '.js-download-file', this._events.onDownloadButtonClick.bind(this));

        this.settingsModalWidget.on('save', this._events.onSettingsSaved, this);
        global.nodes.body.on('click', '.js-save-in-db', function () {
            // db.post(currentTestCase).then(function (response) {
            //          console.log(JSON.stringify(response));
            //      });
        });
    };

    TestCase.prototype._events = {
        onGenerateTableClick: function () {
            this.databaseService.getSettings((settings) => {
                this.TestCaseResultTableWidget.reDraw(settings, this.testCaseInfoWidget.getTestCaseData());
                this.$resultContent.slideDown();
            });
        },

        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, this.downloadFileName, $target.data('fileType'));
        },

        onEditSettingsClick: function () {
            this.databaseService.getSettings((settings) => {
                this.settingsModalWidget.show(settings);
            });
        },

        onSettingsSaved: function (newSettings) {
            this.databaseService.saveSettings(newSettings, this.showTestCaseInfo.bind(this));
        },

        onTextAreaKeyup: function (e) {
            utils.InputsUtils.resizeTextArea(e.currentTarget);
        }
    };

    TestCase.prototype.showTestCaseInfo = function (testCaseInfo) {
        this.databaseService.getSettings((settings) => {
            this.testCaseInfoWidget.reDraw(settings, testCaseInfo);
            this.$resultContent.slideUp();
        });
    };

})(window, window.ru.belyiz.patterns.Page, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);