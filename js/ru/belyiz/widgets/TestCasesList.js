/** @namespace window.ru.belyiz.widgets.TestCasesList */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestCasesList', TestCasesList);
    Pattern.extend(TestCasesList);

    /**
     * @constructor
     */
    function TestCasesList(setup) {
        setup = setup || {};

        this.$container = $(setup.container);

        this._eventHandlers = {};
        this._eventNames = {
            selected: 'selected'
        };
    }

    TestCasesList.prototype._bindEvents = function () {
        this.$container.on('click', '.js-test-case-item:not(.active)', this._events.onListItemCLick.bind(this))
    };

    TestCasesList.prototype._events = {
        onListItemCLick: function (e) {
            const $target = $(e.currentTarget);
            const id = $target.data('testCaseId');
            const rev = $target.data('testCaseRev');

            this.resetSelection();
            $target.addClass('active');

            this.trigger(this._eventNames.selected, {id: id, rev: rev});
        }
    };

    TestCasesList.prototype.reDraw = function (testCases, currentTestCaseId) {
        this.$container.html('');

        if (testCases && testCases.length) {
            for (let testCase of testCases) {
                let html = '';
                for (let rowParam of testCase.settings.headerParams.rows) {
                    html += `
                    <div class="truncate">
                        <b class="font-smaller">${rowParam.name}:</b> 
                        ${testCase.headerValues[rowParam.code]}
                    </div>
                `;
                }

                const isActive = currentTestCaseId && currentTestCaseId === testCase._id;
                this.$container.append(`
                    <div class="list-group-item list-group-item-action clickable js-test-case-item ${isActive ? 'active' : ''}"
                         data-test-case-id="${testCase._id}"
                         data-test-case-rev="${testCase._rev}"
                        >${html}</div>
                `);
            }
        } else {
            this.$container.html(`<div class="alert alert-info">Нет сохраненных тест-кейсов</div>`);
        }
    };

    TestCasesList.prototype.resetSelection = function () {
        this.$container.find('.active').removeClass('active');
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);