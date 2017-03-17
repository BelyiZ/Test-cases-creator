/** @namespace window.ru.belyiz.widgets.TestsSet */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestsSet', TestsSet);
    Pattern.extend(TestsSet);

    /**
     * @constructor
     */
    function TestsSet(setup) {
        setup = setup || {};

        this.$container = $(setup.container);

        this.msgNoOneTestSelected = 'Не выбрано ни одного теста';

        this._eventHandlers = {};
        this._eventNames = {
            changed: 'changed'
        };
    }

    TestsSet.prototype.reDraw = function (testCases) {
        this.$container.html('');

        if (testCases && testCases.length) {
            for (let testCase of testCases) {
                let html = '';
                for (let rowParam of testCase.settings.headerParams.rows) {
                    html += `
                        <div>
                            <small><b>${rowParam.name}:</b></small>
                            ${testCase.headerValues[rowParam.code]}
                        </div>
                    `;
                }

                this.$container.append(`
                    <div class="list-group-item draggable js-test-case-item mt-2" data-test-case-id="${testCase.id}">
                         <div class="align-top d-inline-block"><i class="fa fa-arrows-v big-icon mt-2 mr-3"></i></div>
                         <div class="d-inline-block">${html}</div>
                    </div>
                `);
            }

            this.$container.sortable({
                items: ">.draggable",
                update: () => this.trigger(this._eventNames.changed, this._getTestsCasesIds())
            });
        } else {
            this.$container.html(`<div class="alert alert-info mt-2">${this.msgNoOneTestSelected}</div>`);
        }

        this.trigger(this._eventNames.changed, this._getTestsCasesIds());
    };

    TestsSet.prototype._getTestsCasesIds = function () {
        return $.map(this.$container.find('.js-test-case-item'), (obj) => $(obj).data('testCaseId'));
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);