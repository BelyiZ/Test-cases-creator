/** @namespace window.ru.belyiz.widgets.TestCaseInfo */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestCaseInfo', TestCaseInfo);
    Pattern.extend(TestCaseInfo);

    /**
     * @constructor
     */
    function TestCaseInfo(setup) {
        setup = setup || {};

        this.$container = $(setup.container);

        this.settings = {};
    }

    TestCaseInfo.prototype._bindEvents = function () {
        global.nodes.body.on('click', '.js-add-item', this._events.onAddRowClick.bind(this));
        global.nodes.body.on('click', '.js-remove-item', this._events.onRemoveRowClick.bind(this));

    };

    TestCaseInfo.prototype._events = {
        onAddRowClick: function (e) {
            const blockCode = $(e.currentTarget).data('blockCode');
            for (let blockParams of this.settings.blocks) {
                if (blockParams.code === blockCode) {
                    this.$container.find(`#${blockCode}`).append(this._getBlockRowHtml(blockParams));
                }
            }
        },

        onRemoveRowClick: function (e) {
            $(e.currentTarget).closest('tr').remove();
        }
    };

    TestCaseInfo.prototype.reDraw = function (settings, testCaseInfo) {
        this.settings = settings;

        let html = '';
        if (settings.headerParams.used) {
            html += this._getHeaderRowsHtml(settings.headerParams, testCaseInfo);
        }
        for (let blockSettings of settings.blocks) {
            const blockValues = testCaseInfo && testCaseInfo.blocksValues && testCaseInfo.blocksValues[blockSettings.code];
            html += this._getBlocksHtml(blockSettings, blockValues);
        }

        this.$container.html(html);

        $('.js-input-data-table').sortable({
            items: ">.draggable"
        });
    };

    TestCaseInfo.prototype.getTestCaseData = function () {
        let testCaseData = {headerValues: {}, blocksValues: {}};

        if (this.settings.headerParams.used) {
            for (let rowParam of this.settings.headerParams.rows) {
                testCaseData.headerValues[rowParam.code] = this._getCellValue(this.$container.find('#testHeaderRows'), rowParam.code);
            }
        }

        for (let blockSettings of this.settings.blocks) {
            const $itemsTable = this.$container.find(`#${blockSettings.code}`);
            testCaseData.blocksValues[blockSettings.code] = [];

            let rowNum = 1;
            for (let item of $itemsTable.find('.js-item')) {
                const $item = $(item);
                testCaseData.blocksValues[blockSettings.code][rowNum - 1] = {};
                if (this._checkRowHasData($item)) {
                    for (let cellParam of blockSettings.cells) {
                        if (cellParam.inInputs && !cellParam.isOrderNumber && this._checkRowHasData($item)) {
                            testCaseData.blocksValues[blockSettings.code][rowNum - 1][cellParam.code] = this._getCellValue($item, cellParam.code);
                        }
                    }
                }
                rowNum++;
            }
        }

        return testCaseData;
    };

    TestCaseInfo.prototype._getHeaderRowsHtml = function (headerParams, testCaseInfo) {
        let rowsHtml = '';
        for (let rowParam of headerParams.rows) {
            if (rowParam.inInputs) {
                rowsHtml += `
                    <div class="form-group row">
                        <label class="col-sm-2 col-form-label text-sm-right">${rowParam.name}:</label>
                        <di class="col-sm-10">
                            <input type="text" class="form-control" data-cell-code="${rowParam.code}"
                                   value="${testCaseInfo && testCaseInfo.headerValues[rowParam.code] || ''}"/>
                        </di>
                    </div>
                `;
            }
        }

        return `
            <div>
                <b>ШАПКА ТАБЛИЦЫ</b>
            </div>
            <br>
            <div id="testHeaderRows">${rowsHtml}</div>
        `;
    };

    TestCaseInfo.prototype._getBlocksHtml = function (blockSettings, blockValues) {
        let rowsHtml = '';
        for (let rowValues of blockValues || []) {
            rowsHtml += this._getBlockRowHtml(blockSettings, rowValues);
        }

        return `
            <table class="table">
                <tbody id="${blockSettings.code}" class="js-input-data-table">
                    <tr>
                        <th colspan="100%" class="text-sm-center">${blockSettings.title.text.toUpperCase()}</th>
                    </tr>
                    ${rowsHtml}
                </tbody>
            </table>
            <div class="text-sm-right">
                <button type="button" class="btn btn-secondary margin-bottom-25 js-add-item" 
                        data-block-code="${blockSettings.code}">
                            <i class="fa fa-plus"></i>
                            Добавить элемент
                </button>
            </div>  
        `;
    };

    TestCaseInfo.prototype._getBlockRowHtml = function (blockSettings, rowValues) {
        let rowContent = '';
        for (let cellParam of blockSettings.cells) {
            if (cellParam.inInputs) {
                rowContent += `
                        <td width="${cellParam.width || ''}">
                            <textarea data-cell-code="${cellParam.code || ''}" class="form-control" 
                                      placeholder="${cellParam.name || ''}">${rowValues && rowValues[cellParam.code] || ''}</textarea>
                        </td>
                    `;
            }
        }
        return `
            <tr class="js-item draggable">
                <td width="1%"><i class="fa fa-arrows-v big-icon margin-top-10"></i></td>
                ${rowContent}
                <td width="1%"><i class="fa fa-remove clickable big-icon margin-top-10 js-remove-item"></i></td>
            </tr>
        `;
    };

    TestCaseInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '')
            .trim()
            .replace(/\n/g, '<br style="mso-data-placement:same-cell;" />');
    };


    TestCaseInfo.prototype._checkRowHasData = function ($row) {
        for (let textarea of $row.find('textarea')) {
            if ($(textarea).val()) {
                return true;
            }
        }
        return false;
    };


})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);