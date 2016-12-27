/**
 * Created by beliy on 27.12.2016.
 */

const generateResult = (function () {

    const
        getCellValue = function ($container, code) {
            return ($container.find(`[data-cell-code="${code}"]`).val() || '')
                .trim()
                .replace(/\n/g, '<br style="mso-data-placement:same-cell;" />');
        },

        checkRowHasData = function ($row) {
            for (let textarea of $row.find('textarea')) {
                if ($(textarea).val()) {
                    return true;
                }
            }
            return false;
        },

        getHeaderRowHtml = function (rowParam, value) {
            return `
                <tr>
                    <td width="${rowParam.width}" colspan="${rowParam.colspan}"><b>${rowParam.name}:</b></td>
                    <td colspan="${rowParam.valueColspan}">${value}</td>
                </tr>
            `;
        },

        getBlockTitlesHTML = function (blockParams) {
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

    return function (params) {
        let html = '',
            testCase = {headerValues: {}, blocksValues: {}};

        if (params.headerParams.used) {
            for (let rowParam of params.headerParams.rows) {
                if (rowParam.inResult) {
                    const value = getCellValue($('#testHeaderRows'), rowParam.code);
                    testCase.headerValues[rowParam.code] = value;
                    html += getHeaderRowHtml(rowParam, value);
                }
            }
        }

        for (let blockParams of params.blocks) {
            const $itemsTable = $(`#${blockParams.code}`);
            testCase.blocksValues[blockParams.code] = [];

            html += getBlockTitlesHTML(blockParams);

            let rowNum = 1;
            for (let item of $itemsTable.find('.js-item')) {
                const $item = $(item);
                testCase.blocksValues[blockParams.code][rowNum - 1] = {};
                if (checkRowHasData($item)) {
                    let rowContent = '';
                    for (let cellParam of blockParams.cells) {
                        const value = cellParam.isOrderNumber ? rowNum : getCellValue($item, cellParam.code);
                        testCase.blocksValues[blockParams.code][rowNum - 1][cellParam.code] = value;
                        if (cellParam.inResult) {
                            rowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width}">${value}</td>`;
                        }
                    }
                    html += `<tr>${rowContent}</tr>`;
                }
                rowNum++;
            }
        }

        return {html: html, testCase: testCase};
    }
})();
