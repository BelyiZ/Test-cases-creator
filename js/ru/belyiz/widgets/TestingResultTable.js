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
                const testingData = testingResults[i];
                if (testingData.testCaseInfo) {
                    let settings = $.extend(true, {}, testingData.testCaseInfo.settings);
                    let headerValues = $.extend(true, {}, testingData.testCaseInfo.headerValues);
                    let blocksValues = $.extend(true, {}, testingData.testCaseInfo.blocksValues);

                    settings.totalColumnsInRow += 2;
                    for (let blockParams of settings.tests.blocks) {
                        if (blockParams.executable) {
                            this._addResultColumnsIntoBlock(blockParams, blocksValues[blockParams.code], testingData.testingResult[blockParams.code]);
                        } else {
                            blockParams.columns[blockParams.columns.length - 1].colspan += 2;
                        }
                    }

                    html += this._getTestCaseHtml(settings, headerValues, blocksValues);
                    if (i < testingData.length - 1) {
                        html += this._getTestCasesSeparatorHtml(settings.totalColumnsInRow);
                    }
                }
            }
        }

        this.$container.html(html);
    };

    TestingResultTable.prototype._addResultColumnsIntoBlock = function (blockParams, blockValues, testingResult) {
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

        if (testingResult) {
            for (let rowNum = 0; rowNum < blockValues.length; rowNum++) {
                const rowValues = blockValues[rowNum];
                const rowResult = testingResult[rowNum];
                rowValues.testingResult = rowResult.result;
                rowValues.testingComment = rowResult.comment;
            }
        }
    };

})(window, window.ru.belyiz.widgets.TestCaseResultTable, window.ru.belyiz.utils, window.ru.belyiz.widgets);