/** @namespace window.ru.belyiz.widgets.TestingResultTable */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestingResultTable', TestingResultTable);
    TestingResultTable.prototype = Object.create(Pattern.prototype);

    /**
     * @constructor
     */
    function TestingResultTable(setup) {
        setup = setup || {};

        this.$container = $(setup.container);
    }

    TestingResultTable.prototype.reDraw = function (testingResults, group) {
        let html = '';

        if (group) {
            html += this._getGroupHtml(group);
        }

        if (testingResults) {
            for (let i = 0; i < testingResults.length; i++) {
                const testingResult = testingResults[i];
                if (testingResult.testCaseInfo) {
                    let settings = $.extend(true, {}, testingResult.testCaseInfo.settings);
                    let headerValues = $.extend(true, {}, testingResult.testCaseInfo.headerValues);
                    let blocksValues = $.extend(true, {}, testingResult.testCaseInfo.blocksValues);

                    settings.totalColumnsInRow += 2;
                    for (let blockParams of settings.tests.blocks) {
                        blockParams.columns.push(
                            {
                                "code": "testingResult",
                                "colspan": 1,
                                "width": "1%",
                                "name": "Результат проверки",
                                "inResult": true
                            }, {
                                "code": "testingComment",
                                "colspan": 1,
                                "width": "1%",
                                "name": "Комментарий",
                                "inResult": true
                            }
                        );
                        for (let rowNum = 0; rowNum < blocksValues[blockParams.code].length; rowNum++) {
                            const rowValues = blocksValues[blockParams.code][rowNum];
                            const rowResult = testingResult.testingResult[blockParams.code][rowNum];
                            rowValues.testingResult = rowResult.result;
                            rowValues.testingComment = rowResult.comment;
                        }
                    }

                    html += this._getTestCaseHtml(settings, headerValues, blocksValues);
                    if (i < testingResult.length - 1) {
                        html += this._getTestCasesSeparatorHtml(settings.totalColumnsInRow);
                    }
                }
            }
        }

        this.$container.html(html);
    };

})(window, window.ru.belyiz.widgets.TestCaseResultTable, window.ru.belyiz.utils, window.ru.belyiz.widgets);