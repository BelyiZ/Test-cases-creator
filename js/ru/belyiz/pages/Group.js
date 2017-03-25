/** @namespace window.ru.belyiz.pages.Group */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.Group', Group);
    Pattern.extend(Group);


    /**
     * @constructor
     */
    function Group() {
        this.pageSettings = {
            pageCode: 'Group',
            createBtnText: 'Создать группу',
            saveBtnText: 'Сохранить изменения',
            removeBtnText: 'Удалить группу',
            entityInfoWidget: widgets.GroupInfo,
            entitiesListWidget: widgets.ItemsList,
            entitiesListWidgetSetup: {emptyListMsg: 'Нет сохраненных групп'},
            entitiesListPrepareDataFunction: this._prepareGroupsForList,
            entityService: services.GroupsService,
            downloadFileName: 'testCasesGroup',
            activeEntityId: '',
        };
    }

    Group.prototype._createWidgets = function () {
        Pattern.clazz.prototype._createWidgets.call(this);

        this.testCaseResultTableWidget = new widgets.TestCaseResultTable({container: this.$resultTable}).initialize();
    };

    Group.prototype._bindEvents = function () {
        Pattern.clazz.prototype._bindEvents.call(this);

        global.nodes.body.on('click', '[data-page-code="Group"] .js-download-file', this._events.onDownloadButtonClick.bind(this));

        this.entityInfoWidget.on('testCasesReordered', this._events.onTestCasesReordered, this);
        this.entityInfoWidget.on('changed', this._events.onGroupDataChanged, this);
    };

    Group.prototype._events = $.extend({
        onTestCasesReordered: function (data) {
            services.GroupsService.setTestCases(data.id, data.testCases, (group) => {
                this.entityInfoWidget.groupRevision = group.rev;
            });
        },

        onGroupDataChanged: function () {
            services.GroupsService.getEntity(this.pageSettings.activeEntityId, data => {
                this.testCaseResultTableWidget.reDraw(data.sortedTestCases, this.entityInfoWidget.getData());
            });
        },

        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, this.pageSettings.downloadFileName, $target.data('fileType'));
        },

    }, Pattern.clazz.prototype._events);

    Group.prototype._prepareGroupsForList = function (docs) {
        let groups = [];
        for (let doc of docs) {
            let group = {id: doc.id, rev: doc.rev};
            for (let rowParams of doc.settings.groupParams.rows) {
                group[rowParams.name] = doc.headerValues[rowParams.code];
            }

            groups.push(group);
        }
        return groups;
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoPage, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);