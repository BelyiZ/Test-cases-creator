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

        this.multipleSelectionMode = false;
        this.selectedIds = [];

        this._eventHandlers = {};
        this._eventNames = {
            selected: 'selected',
            multipleSelectionModeOn: 'multipleSelectionModeOn',
            multipleSelectionModeOff: 'multipleSelectionModeOff',
            multipleSelected: 'multipleSelected'
        };
    }

    TestCasesList.prototype._cacheElements = function () {
        this.$listContainer = this.$container.find('.js-test-cases-list');
        this.$selectSomeCasesBtn = this.$container.find('.js-select-some-cases');
    };

    TestCasesList.prototype._bindEvents = function () {
        this.$container.on('click', '.js-test-case-item', this._events.onListItemCLick.bind(this));
        this.$container.on('click', '.js-select-some-cases', this._events.onSelectSomeCasesClick.bind(this));
    };

    TestCasesList.prototype._events = {
        onListItemCLick: function (e) {
            const $target = $(e.currentTarget);
            const id = $target.data('testCaseId');
            const rev = $target.data('testCaseRev');

            if (this.multipleSelectionMode) {
                $target.toggleClass('active');

                const isActive = $target.hasClass('active');
                $target.find('.js-checkbox').toggleClass('fa-square-o', !isActive).toggleClass('fa-check-square-o', isActive);

                if (isActive) {
                    this.selectedIds.push(id);
                } else {
                    const pos = this.selectedIds.indexOf(id);
                    if (pos !== -1) {
                        this.selectedIds.splice(pos, 1);
                    }
                }
                this.trigger(this._eventNames.multipleSelected, {ids: this.selectedIds});

            } else if (!$target.hasClass('active')) {
                this.resetSelection();
                $target.addClass('active');

                this.trigger(this._eventNames.selected, {id: id, rev: rev});
            }
        },

        onSelectSomeCasesClick: function (e) {
            const $target = $(e.currentTarget);

            this.multipleSelectionMode = !this.multipleSelectionMode;
            this.selectedIds = [];

            this.resetSelection();
            this.$container.toggleClass('multiple-selection', this.multipleSelectionMode);

            if (this.multipleSelectionMode) {
                this.trigger(this._eventNames.multipleSelectionModeOn);
                $target.text('Вернуться к редактированию');
            } else {
                this.trigger(this._eventNames.multipleSelectionModeOff);
                $target.text('Выбрать несколько готовых');
            }
        }
    };

    TestCasesList.prototype.reDraw = function (testCases, currentTestCaseId) {
        this.$listContainer.html('');

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
                this.$listContainer.append(`
                    <div class="list-group-item list-group-item-action clickable js-test-case-item ${isActive ? 'active' : ''}"
                         data-test-case-id="${testCase._id}"
                         data-test-case-rev="${testCase._rev}">
                         <div class="hidden vertical-top cases-list-checkbox"><i class="fa fa-square-o vertical-middle js-checkbox"/></div>
                         <div class="d-inline-block full-width">${html}</div>
                    </div>
                `);
            }
            this.$selectSomeCasesBtn.show();
        } else {
            this.$selectSomeCasesBtn.hide();
            this.$listContainer.html(`<div class="alert alert-info">Нет сохраненных тест-кейсов</div>`);
        }
    };

    TestCasesList.prototype.resetSelection = function () {
        this.$listContainer.find('.active').removeClass('active');
        this.$listContainer.find('.js-checkbox').addClass('fa-square-o').removeClass('fa-check-square-o');
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);