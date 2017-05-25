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

    TestingResultTable.prototype.reDraw = function (entireTestingResult) {
        let html = '';

        if (entireTestingResult.group) {
            let settings = $.extend(true, {}, entireTestingResult.group.settings);
            settings.totalColumnsInRow += 2;
            html += this._getGroupHtml(settings, entireTestingResult.group.headerValues);
        }

        for (let i = 0; i < entireTestingResult.testCases.length; i++) {
            const testCase = entireTestingResult.testCases[i];
            const testingResult = entireTestingResult.testingResult[testCase.id];
            if (testingResult) {
                let settings = $.extend(true, {}, testCase.settings);
                let headerValues = $.extend(true, {}, testCase.headerValues);
                let blocksValues = $.extend(true, {}, testCase.blocksValues);

                settings.totalColumnsInRow += 2;
                for (let blockParams of settings.tests.blocks) {
                    if (blockParams.executable) {
                        this._addResultColumnsIntoBlock(blockParams, blocksValues[blockParams.code], testingResult[blockParams.code]);
                    } else {
                        blockParams.columns[blockParams.columns.length - 1].colspan += 2;
                    }
                }

                html += this._getTestCaseHtml(settings, headerValues, blocksValues);
                if (i < entireTestingResult.testCases.length - 1) {
                    html += this._getTestCasesSeparatorHtml(settings.totalColumnsInRow);
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