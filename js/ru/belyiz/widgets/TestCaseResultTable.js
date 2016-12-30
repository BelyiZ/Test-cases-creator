/** @namespace window.ru.belyiz.widgets.TestCaseResultTable */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestCaseResultTable', TestCaseResultTable);
    Pattern.extend(TestCaseResultTable);

    /**
     * @constructor
     */
    function TestCaseResultTable(setup) {
        setup = setup || {};

        this.$container = $(setup.container);
    }

    TestCaseResultTable.prototype.reDraw = function (settings, testCaseData) {
        let html = '';

        for (let rowParam of settings.headerParams.rows) {
            if (rowParam.inResult) {
                html += this._getHeaderRowHtml(rowParam, testCaseData.headerValues[rowParam.code]);
            }
        }

        for (let blockParams of settings.blocks) {
            html += this._getBlockTitlesHTML(blockParams);

            let rowNum = 1;
            for (let rowData of testCaseData.blocksValues[blockParams.code]) {
                let rowContent = '';
                for (let cellParam of blockParams.cells) {
                    const value = cellParam.isOrderNumber ? rowNum : rowData[cellParam.code];
                    if (cellParam.inResult) {
                        rowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width}">${value}</td>`;
                    }
                }
                html += `<tr>${rowContent}</tr>`;
                rowNum++;
            }
        }

        this.$container.html(html);
    };

    TestCaseResultTable.prototype._getHeaderRowHtml = function (rowParam, value) {
        return `
            <tr>
                <td width="${rowParam.width}" colspan="${rowParam.colspan}"><b>${rowParam.name}:</b></td>
                <td colspan="${rowParam.valueColspan}">${value}</td>
            </tr>
        `;
    };

    TestCaseResultTable.prototype._getBlockTitlesHTML = function (blockParams) {
        let titleRowContent = '';
        for (let cellParam of blockParams.cells) {
            titleRowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width || ''}">${cellParam.name}</td>`
        }

        return `
            <tr>
                <td colspan="${blockParams.title.colspan}">
                    <br>
                    <b>${blockParams.title.text}:</b>
                </td>
            </tr>
            <tr>${titleRowContent}</tr>
        `;
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);