/** @namespace window.ru.belyiz.widgets.TestCaseGroups */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestCaseGroups', TestCaseGroups);
    Pattern.extend(TestCaseGroups);

    /**
     * Виджет для панели со списком групп, в которые бул добавлен тест-кейс
     *
     * @constructor
     */
    function TestCaseGroups(setup) {
        setup = setup || {};

        this.containerId = setup.containerId;
        this.testCaseId = setup.testCaseId || '';

        this.usedGroups = [];
    }

    TestCaseGroups.prototype._createWidgets = function () {
        this.groupsModal = new widgets.ItemsListModal({
            title: 'Выберите группу тест-кейсов',
            closable: true,
            hideApplyBtn: true,
            emptyMsg: 'Группы кончились ☹'
        }).initialize();
    };

    TestCaseGroups.prototype._bindEvents = function () {
        global.nodes.body.on('click', `#${this.containerId} .js-add-into-group`, this._events.onAddIntoGroupClick.bind(this));
        global.nodes.body.on('click', `#${this.containerId} .js-remove-from-group`, this._events.onRemoveFromGroupClick.bind(this));

        this.groupsModal.on('selected', this._events.onGroupSelected, this);
    };

    TestCaseGroups.prototype._events = {
        onAddIntoGroupClick: function () {
            global.ru.belyiz.services.GroupsService.all([], (groups) => {
                let items = $.map(groups, group => {
                    return $.inArray(group.id, this.usedGroups) === -1 ? {name: group.headerValues.name, code: group.id} : null;
                });
                this.groupsModal.setItems(items, true);
            });
        },

        onGroupSelected: function (data) {
            global.ru.belyiz.services.GroupsService.addTestCase(data.code, this.testCaseId, this._addGroupBadge.bind(this));
        },

        onRemoveFromGroupClick: function (e) {
            const $target = $(e.currentTarget);
            const groupId = $target.data('groupId');
            global.ru.belyiz.services.GroupsService.removeTestCase(groupId, this.testCaseId, () => {
                this.usedGroups = utils.ArraysUtils.removeAllMatches(this.usedGroups, groupId);
                $target.closest('.badge').remove();
            });
        },
    };

    TestCaseGroups.prototype.reDraw = function (groups) {
        this.usedGroups = [];
        $(`#${this.containerId}`).find(`.js-test-case-groups`).html('');
        for (let group of groups) {
            this._addGroupBadge(group);
        }
    };

    TestCaseGroups.prototype.setTestCaseId = function (testCaseId) {
        this.testCaseId = testCaseId;
    };

    TestCaseGroups.prototype._addGroupBadge = function (group) {
        this.usedGroups.push(group.id);
        $(`#${this.containerId}`).find(`.js-test-case-groups`).append(this._getGroupBadgeHtml(group));
    };

    TestCaseGroups.prototype._getGroupBadgeHtml = function (group) {
        return `
            <div class="badge badge-primary">
                ${group.headerValues.name}
                <i class="fa fa-remove js-remove-from-group" data-group-id="${group.id}" role="button"></i>
            </div>
        `;
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);