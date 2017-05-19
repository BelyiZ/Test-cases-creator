/** @namespace window.ru.belyiz.widgets.TestingResultTable */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestingResultTable', TestingResultTable);
    Pattern.extend(TestingResultTable);

    /**
     * @constructor
     */
    function TestingResultTable(setup) {
        setup = setup || {};

        this.useMarkDown = !!setup.useMarkDown;

        this.$container = $(setup.container);
        this.brForExcel = '<br style="mso-data-placement:same-cell;" />';
    }

    TestingResultTable.prototype.reDraw = function (testingResults, group) {
        let html = '';

        if (group) {
            html += this._getGroupHtml(group);
        }

        if (testingResults) {
            for (let i = 0; i < testingResults.length; i++) {
                html += this._getTestCaseHtml(testingResults[i]);

                if (i < testingResults.length - 1) {
                    const columnsCount = this._calculateColumnsCount($(html)[0]);
                    html += this._getTestCasesSeparatorHtml(columnsCount);
                }
            }
        }

        this.$container.html(html);
    };

    TestingResultTable.prototype._getGroupHtml = function (group) {
        let html = '';
        const rows = group.settings.headerParams.rows;
        if (rows && rows.length) {
            const colspan = rows[0].valueColspan + rows[0].colspan;
            html += `<tr><td width="100%" colspan="${colspan}" style="text-align: center;"><b>ГРУППА:</b></td></tr>`;
            for (let rowParam of rows) {
                if (rowParam.inResult) {
                    html += this._getHeaderRowHtml(rowParam, group.headerValues[rowParam.code]);
                }
            }
            html += this._getTestCasesSeparatorHtml(colspan);
            html += `<tr><td width="100%" colspan="${colspan}" style="text-align: center;"><b>ТЕСТ-КЕЙСЫ:</b></td></tr>`;
        }
        return html;
    };

    TestingResultTable.prototype._getTestCaseHtml = function (testingData) {
        const testCaseData = testingData.testCaseInfo;

        if (!testCaseData) {
            return '';
        }

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
                        let value = (cellParam.isOrderNumber ? rowNum : (rowData[cellParam.code] || '')) + '';
                        if (this.useMarkDown) {
                            value = utils.TextUtils.markdownToHtml(value);
                        } else {
                            value = utils.TextUtils.brakesForExcelFix(value);
                        }
                        if (cellParam.inResult) {
                            rowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width}">${value}</td>`;
                        }
                    }
                    const testingResult = testingData.testingResult[blockParams.code][rowNum - 1];
                    rowContent += `<td>${testingResult.result || ''}</td><td>${testingResult.comment || ''}</td>`;
                    html += `<tr>${rowContent}</tr>`;
                    rowNum++;
                }
            }
        }
        return html;
    };

    TestingResultTable.prototype._getHeaderRowHtml = function (rowParam, value) {
        if (this.useMarkDown) {
            value = utils.TextUtils.markdownToHtml(value);
        } else {
            value = utils.TextUtils.brakesForExcelFix(value);
        }
        return `
            <tr>
                <td width="${rowParam.width}" colspan="${rowParam.colspan}"><b>${rowParam.name}:</b></td>
                <td colspan="${rowParam.valueColspan + 2}">${value}</td>
            </tr>
        `;
    };

    TestingResultTable.prototype._getBlockTitlesHTML = function (blockParams) {
        let titleRowContent = '';
        for (let cellParam of blockParams.cells) {
            titleRowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width || ''}">${cellParam.name}</td>`
        }

        return `
            <tr>
                <td colspan="${blockParams.title.colspan + 2}">
                    <b>${blockParams.title.text}:</b>
                </td>
            </tr>
            <tr>
                ${titleRowContent}
                <td>Результат проверки</td>
                <td>Комментарий</td>
            </tr>
        `;
    };

    TestingResultTable.prototype._getTestCasesSeparatorHtml = function (columnsCount) {
        return `<tr><td colspan="${columnsCount}">${this.brForExcel}${this.brForExcel}${this.brForExcel}</td></tr>`;
    };

    TestingResultTable.prototype._checkCellsHasDataInResult = function (cells, rowData) {
        for (let cellParam of cells) {
            if (!cellParam.isOrderNumber && cellParam.inResult && rowData[cellParam.code]) {
                return true;
            }
        }
        return false;
    };

    TestingResultTable.prototype._calculateColumnsCount = function (tr) {
        let columnsCount = 0;
        for (let td of $(tr).find('td')) {
            columnsCount += parseInt($(td).attr('colspan'));
        }
        return columnsCount;
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);