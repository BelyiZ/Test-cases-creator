/** @namespace window.ru.belyiz.utils.HtmlGenerator */

(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.HtmlGenerator', new HtmlGenerator());

    /**
     * В этом классе собраны функции генерирующие HTML из конфигурации и данных тест-кейсов, групп и дргуих сущностей.
     * Функции должны быть не спицифичными для конкретных мест в интерфейсе, а максимально общими и переиспользуемыми.
     * Специфичный HTML лучше генерировать там где он и будет применятся.
     * @constructor
     */
    function HtmlGenerator() {
    }

    /**
     * Генерирует HTML для строки с названиями колонок к таблице для блока данных тест-кейса
     * @param blockParams параметры блока данных тест-кейса
     * @param useThTag индикатор использования тега TH вместо TD для определения ячеек
     * @returns {string}
     */
    HtmlGenerator.prototype.generateTableHeader = function (blockParams, useThTag = true) {
        let titleRowContent = '';
        const cellTag = useThTag ? 'th' : 'td';
        for (let columnParam of blockParams.columns) {
            titleRowContent += `<${cellTag} colspan="${columnParam.colspan}" width="${columnParam.width || ''}">${columnParam.name}</${cellTag}>`
        }
        return `<tr>${titleRowContent}</tr>`;
    };

    HtmlGenerator.prototype.generateTableForBlock = function (blockParams, blockValues, markdown = false, useThTag = true) {
        let html = this.generateTableHeader(blockParams, useThTag);
        let rowNum = 1;
        for (let rowData of blockValues) {
            if (this._checkCellsHasDataInResult(blockParams.columns, rowData)) {
                let rowContent = '';
                for (let columnParams of blockParams.columns) {
                    let value = (columnParams.type === 'orderNumber' ? rowNum : (rowData[columnParams.code] || '')) + '';
                    if (markdown) {
                        value = utils.TextUtils.markdownToHtml(value);
                    } else {
                        value = utils.TextUtils.brakesForExcelFix(value);
                    }
                    if (columnParams.inResult) {
                        rowContent += `<td colspan="${columnParams.colspan}" width="${columnParams.width}">${value}</td>`;
                    }
                }
                html += `<tr>${rowContent}</tr>`;
                rowNum++;
            }
        }
        return html;
    };

    HtmlGenerator.prototype._checkCellsHasDataInResult = function (columns, rowData) {
        for (let columnParams of columns) {
            if (columnParams.type !== 'orderNumber' && columnParams.inResult && rowData[columnParams.code]) {
                return true;
            }
        }
        return false;
    };

})(window, window.ru.belyiz.utils);