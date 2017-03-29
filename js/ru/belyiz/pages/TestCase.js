/** @namespace window.ru.belyiz.pages.TestCase */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.TestCase', TestCase);
    Pattern.extend(TestCase);

    /**
     * @constructor
     */
    function TestCase() {
        this.pageSettings = {
            pageCode: 'TestCase',
            createBtnText: 'Создать новый',
            saveBtnText: 'Сохранить изменения',
            removeBtnText: 'Удалить тест-кейс',
            entityInfoWidget: widgets.TestCaseInfo,
            entitiesListWidget: widgets.ItemsList,
            entitiesListWidgetSetup: {emptyListMsg: 'Нет сохраненных тест кейсов'},
            entitiesListPrepareDataFunction: this._prepareTestCasesForList,
            entityService: services.TestCasesService,
            downloadFileName: 'testCase',
            activeEntityId: '',
        };
    }

    TestCase.prototype._createWidgets = function () {
        Pattern.clazz.prototype._createWidgets.call(this);

        this.testCaseResultTableWidget = new widgets.TestCaseResultTable({container: this.$resultTable}).initialize();
    };

    TestCase.prototype._bindEvents = function () {
        Pattern.clazz.prototype._bindEvents.call(this);

        global.nodes.body.on('keyup', '[data-page-code="TestCase"] textarea', this._events.onTextAreaKeyup.bind(this));
        global.nodes.body.on('click', '[data-page-code="TestCase"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
    };

    TestCase.prototype._bindWidgetsEvents = function () {
        Pattern.clazz.prototype._bindWidgetsEvents.call(this);

        this.entityInfoWidget.on('changed', this._events.onTestCaseDataChanged, this);
    };

    TestCase.prototype._unbindWidgetsEvents = function () {
        Pattern.clazz.prototype._unbindWidgetsEvents.call(this);

        this.entityInfoWidget.off('changed', this._events.onTestCaseDataChanged, this);
    };

    TestCase.prototype._events = $.extend({
        onTestCaseDataChanged: function () {
            this.testCaseResultTableWidget.reDraw([this.entityInfoWidget.getData()]);
        },

        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, this.pageSettings.downloadFileName, $target.data('fileType'));
        },

        onTextAreaKeyup: function (e) {
            utils.InputsUtils.resizeTextArea(e.currentTarget);
        },

    }, Pattern.clazz.prototype._events);

    TestCase.prototype._prepareTestCasesForList = function (docs) {
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

})(window, window.ru.belyiz.patterns.AbstractEntityInfoPage, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);