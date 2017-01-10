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
        this.brForExcel = '<br style="mso-data-placement:same-cell;" />';
    }

    TestCaseResultTable.prototype.reDraw = function (testCases) {
        let html = '';

        if (testCases) {
            for (let i = 0; i < testCases.length; i++) {
                html += this._getTestCaseHtml(testCases[i]);

                if (i < testCases.length - 1) {
                    const columnsCount = this._calculateColumnsCount($(html)[0]);
                    html += this._getTestCasesSeparatorHtml(columnsCount);
                }
            }
        }

        this.$container.html(html);
    };

    TestCaseResultTable.prototype._getTestCaseHtml = function (testCaseData) {
        let html = '';
        for (let rowParam of testCaseData.settings.headerParams.rows) {
            if (rowParam.inResult) {
                html += this._getHeaderRowHtml(rowParam, testCaseData.headerValues[rowParam.code]);
            }
        }

        for (let blockParams of testCaseData.settings.blocks) {
            html += this._getBlockTitlesHTML(blockParams);

            let rowNum = 1;
            for (let rowData of testCaseData.blocksValues[blockParams.code]) {
                if (this._checkCellsHasDataInResult(blockParams.cells, rowData)) {
                    let rowContent = '';
                    for (let cellParam of blockParams.cells) {
                        const value = this._brakesForExcelFix(cellParam.isOrderNumber ? rowNum : rowData[cellParam.code]);
                        if (cellParam.inResult) {
                            rowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width}">${value}</td>`;
                        }
                    }
                    html += `<tr>${rowContent}</tr>`;
                    rowNum++;
                }
            }
        }
        return html;
    };

    TestCaseResultTable.prototype._getHeaderRowHtml = function (rowParam, value) {
        value = this._brakesForExcelFix(value);
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
                    <b>${blockParams.title.text}:</b>
                </td>
            </tr>
            <tr>${titleRowContent}</tr>
        `;
    };

    TestCaseResultTable.prototype._getTestCasesSeparatorHtml = function (columnsCount) {
        return `<tr><td colspan="${columnsCount}">${this.brForExcel}${this.brForExcel}${this.brForExcel}</td></tr>`;
    };

    TestCaseResultTable.prototype._checkCellsHasDataInResult = function (cells, rowData) {
        for (let cellParam of cells) {
            if (!cellParam.isOrderNumber && cellParam.inResult && rowData[cellParam.code]) {
                return true;
            }
        }
        return false;
    };

    TestCaseResultTable.prototype._brakesForExcelFix = function (str) {
        str = str ? str + '' : '';
        return (str || '').replace(/\n/g, '<br style="mso-data-placement:same-cell;" />');
    };

    TestCaseResultTable.prototype._calculateColumnsCount = function (tr) {
        let columnsCount = 0;
        for (let td of $(tr).find('td')) {
            columnsCount += parseInt($(td).attr('colspan'));
        }
        return columnsCount;
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);