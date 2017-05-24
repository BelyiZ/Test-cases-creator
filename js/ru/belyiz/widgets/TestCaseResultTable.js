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

    TestCaseResultTable.prototype.reDraw = function (testCases, group) {
        let html = '';

        if (group) {
            html += this._getGroupHtml(group);
        }

        if (testCases) {
            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];

                html += this._getTestCaseHtml(testCase.settings, testCase.headerValues, testCase.blocksValues);
                if (i < testCases.length - 1) {
                    html += this._getTestCasesSeparatorHtml(testCase.settings.totalColumnsInRow);
                }
            }
        }

        this.$container.html(html);
    };

    TestCaseResultTable.prototype._getGroupHtml = function (group) {
        let html = '';
        const rows = group.settings.groups.header.rows;
        if (rows && rows.length) {
            html += `<tr><td width="100%" colspan="${group.settings.totalColumnsInRow}" style="text-align: center;"><b>ГРУППА:</b></td></tr>`;
            html += this._getHeaderRowHtml(group.settings, 'groups', group.headerValues);
            html += this._getTestCasesSeparatorHtml(group.settings.totalColumnsInRow);
            html += `<tr><td width="100%" colspan="${group.settings.totalColumnsInRow}" style="text-align: center;"><b>ТЕСТ-КЕЙСЫ:</b></td></tr>`;
        }
        return html;
    };

    TestCaseResultTable.prototype._getTestCaseHtml = function (settings, headerValues, blocksValues) {
        let html = this._getHeaderRowHtml(settings, 'tests', headerValues);

        for (let blockParams of settings.tests.blocks) {
            html += `<tr><td width="100%" colspan="${settings.totalColumnsInRow}"><b>${blockParams.title}:</b></td></tr>`;
            html += utils.HtmlGenerator.generateTableForBlock(blockParams, blocksValues[blockParams.code], settings.markdown, false);
        }
        return html;
    };

    TestCaseResultTable.prototype._getHeaderRowHtml = function (settings, entityType, headerValues) {
        let html = '';
        let headerParams = settings[entityType].header;
        for (let rowParam of headerParams.rows) {
            if (rowParam.inResult) {
                let value = headerValues[rowParam.code];
                if (settings.markdown) {
                    value = utils.TextUtils.markdownToHtml(value);
                } else {
                    value = utils.TextUtils.brakesForExcelFix(value);
                }
                html += `
                    <tr>
                        <td width="${headerParams.nameWidth}" colspan="${headerParams.nameColspan}"><b>${rowParam.name}:</b></td>
                        <td colspan="${settings.totalColumnsInRow - headerParams.nameColspan}">${value}</td>
                    </tr>
                `;
            }
        }
        return html;
    };

    TestCaseResultTable.prototype._getTestCasesSeparatorHtml = function (columnsCount) {
        const brForExcel = '<br style="mso-data-placement:same-cell;" />';
        return `<tr><td colspan="${columnsCount}">${brForExcel}${brForExcel}${brForExcel}</td></tr>`;
    };


})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);