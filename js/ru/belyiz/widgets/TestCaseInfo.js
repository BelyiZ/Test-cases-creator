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
        this.testCasesService = setup.entityService;

        this.settings = {};
        this.testCaseId = '';
        this.testCaseRevision = '';

        this._msgMergeConflict = 'Данные на сервере изменились. ';
        this._msgServerFieldEmpty = 'Значение этого поля было удалено.';
        this._msgActualFieldValue = 'Актуальный текст:\n';
        this._msgAddedRowHint = 'Так выделяются строки, которые были добавлены в серверной версии';
        this._msgRemovedRowHint = 'Так выделяются строки, которых нет в серверной версии';
        this._msgRemovedFromServer = 'Редактируемый тест-кейс был удален с сервера. Если сохранить изменения - это будет эквивалентно созданию нового.';
        this._msgChangedOnServer = 'Редактируемый тест кейс был отредактирован. Все различия между реактируемой версией и актуальной указаны в интерфейсе.';

        this._eventHandlers = {};
        this._eventNames = {
            changed: 'changed',
        };
    }

    TestCaseInfo.prototype._createWidgets = function () {
        this.testCaseGroupsWidget = new widgets.TestCaseGroups({containerId: 'testCaseGroupsContainer'}).initialize();
    };

    TestCaseInfo.prototype._bindEvents = function () {
        this.$container.on('click', '.js-add-item', this._events.onAddRowClick.bind(this));
        this.$container.on('click', '.js-remove-item', this._events.onRemoveRowClick.bind(this));
        this.$container.on('keyup paste change', 'textarea, input', this._events.onTextareaChanged.bind(this));
    };

    TestCaseInfo.prototype._events = {
        onAddRowClick: function (e) {
            const blockCode = $(e.currentTarget).data('blockCode');
            for (let blockParams of this.settings.blocks) {
                if (blockParams.code === blockCode) {
                    this.$container.find(`#${blockCode}`).append(this._getBlockRowHtml(blockParams));
                }
            }
            this.trigger(this._eventNames.changed);
        },

        onRemoveRowClick: function (e) {
            $(e.currentTarget).closest('tr').remove();
            this.trigger(this._eventNames.changed);

        },

        onTextareaChanged: function () {
            this.trigger(this._eventNames.changed);
        },
    };

    TestCaseInfo.prototype.reDraw = function (settings, testCaseInfo, serverTestCaseInfo) {
        this.testCaseId = testCaseInfo && testCaseInfo.id || '';
        this.settings = settings;

        const serverRevision = serverTestCaseInfo && serverTestCaseInfo.rev || '';
        const localRevision = testCaseInfo && testCaseInfo.rev || '';
        this.testCaseRevision = serverRevision || localRevision;

        this.$container.html('');
        if (this.testCaseId) {
            this._initGroupsBlock();
        }
        this.$container.append(this._getHeaderRowsHtml(settings.headerParams, testCaseInfo, serverTestCaseInfo));
        for (let blockSettings of settings.blocks) {
            const localBlockValues = testCaseInfo && testCaseInfo.blocksValues && testCaseInfo.blocksValues[blockSettings.code] || false;
            const serverBlockValues = serverTestCaseInfo && serverTestCaseInfo.blocksValues && serverTestCaseInfo.blocksValues[blockSettings.code] || false;
            this.$container.append(this._getBlocksHtml(blockSettings, localBlockValues, serverBlockValues));
        }
        $('.js-input-data-table').sortable({
            items: ">.draggable"
        });

        utils.InputsUtils.resizeTextAreas();

        this.trigger(this._eventNames.changed);
    };

    TestCaseInfo.prototype.showDifference = function (serverTestCaseInfo) {
        if (serverTestCaseInfo.rev && serverTestCaseInfo.rev !== this.testCaseRevision) {
            utils.ShowNotification.static(`
                ${this._msgChangedOnServer}
                <div class="added-row text-left p-1">${this._msgAddedRowHint}</div>
                <div class="removed-row text-left p-1">${this._msgRemovedRowHint}</div>
            `, 'warning');

            this.reDraw(this.settings, this.getTestCaseData(), serverTestCaseInfo);
        }
    };

    TestCaseInfo.prototype.removedOnServer = function () {
        utils.ShowNotification.static(this._msgRemovedFromServer, 'danger');
        let testCaseData = this.getTestCaseData();
        testCaseData.id = '';
        testCaseData.rev = '';
        this.reDraw(this.settings, testCaseData);
    };

    TestCaseInfo.prototype.getData = function () {
        let testCaseData = {
            id: this.testCaseId,
            rev: this.testCaseRevision,
            settings: this.settings,
            headerValues: {},
            blocksValues: {}
        };

        for (let rowParam of this.settings.headerParams.rows) {
            testCaseData.headerValues[rowParam.code] = this._getCellValue(this.$container.find('#testHeaderRows'), rowParam.code);
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
                        if (cellParam.inInputs && !cellParam.isOrderNumber) {
                            testCaseData.blocksValues[blockSettings.code][rowNum - 1][cellParam.code] = this._getCellValue($item, cellParam.code);
                        }
                    }
                }
                rowNum++;
            }
        }

        return testCaseData;
    };

    TestCaseInfo.prototype._initGroupsBlock = function () {
        this.$container.html(`      
            <div id="testCaseGroupsContainer">
                <div class="d-inline-block js-test-case-groups"></div>
                <div class="btn btn-outline-primary btn-sm js-add-into-group" role="button">
                    <i class="fa fa-plus"></i> Добавить в группу
                </div>
            </div>
        `);
        this.testCaseGroupsWidget.setTestCaseId(this.testCaseId);
        this.testCasesService.findGroups(this.testCaseId, groups => {
            this.testCaseGroupsWidget.reDraw(groups);
        });
    };

    /**
     * Генерирует HTML для полей ввода шапки таблицы
     *
     * @param headerParams параметры полей ввода шапки таблицы
     * @param testCaseInfo данные локально-сохраненного тест-кейса, подставляются в поля ввода
     * @param serverTestCaseInfo данные серверной версии тест-кейса, используются для отображения разницы, при редактировании не последней версии
     * @returns {string}
     * @private
     */
    TestCaseInfo.prototype._getHeaderRowsHtml = function (headerParams, testCaseInfo, serverTestCaseInfo) {
        testCaseInfo = testCaseInfo || {};
        serverTestCaseInfo = serverTestCaseInfo || {};

        const merge = testCaseInfo.rev && serverTestCaseInfo.rev && testCaseInfo.rev !== this.testCaseRevision;

        let rowsHtml = '';
        for (let rowParam of headerParams.rows) {
            if (rowParam.inInputs) {
                const localValue = testCaseInfo.headerValues && testCaseInfo.headerValues[rowParam.code] || '';
                const serverValue = serverTestCaseInfo.headerValues && serverTestCaseInfo.headerValues[rowParam.code] || '';
                const mergeConflict = merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);

                rowsHtml += `
                    <div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
                        <label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">${rowParam.name}:</label>
                        <div class="col-sm-10">
                            <input type="text" id="headerRow-${rowParam.code}" data-cell-code="${rowParam.code}"
                                   class="form-control ${mergeConflict ? 'form-control-warning' : ''}" 
                                   value="${localValue}"/>
                            <div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </div>
                `;
            }
        }

        return `
            <div class="text-center">
                <b>ШАПКА ТАБЛИЦЫ</b>
            </div>
            <br>
            <div id="testHeaderRows">${rowsHtml}</div>
        `;
    };

    TestCaseInfo.prototype._getBlocksHtml = function (blockSettings, localBlockValues, serverBlockValues) {
        localBlockValues = localBlockValues || [];
        serverBlockValues = serverBlockValues || [];

        let rowsHtml = '';
        const rowsCount = Math.max(localBlockValues.length, serverBlockValues.length);
        for (let i = 0; i < rowsCount; i++) {
            const localRowValues = utils.ArraysUtils.getOfDefault(localBlockValues, i, false);
            const serverRowValues = utils.ArraysUtils.getOfDefault(serverBlockValues, i, false);
            rowsHtml += this._getBlockRowHtml(blockSettings, localRowValues, serverRowValues, serverBlockValues.length);
        }

        return `
            <table class="table">
                <tbody id="${blockSettings.code}" class="js-input-data-table">
                    <tr>
                        <th colspan="100%" class="text-center">${blockSettings.title.text.toUpperCase()}</th>
                    </tr>
                    ${rowsHtml}
                </tbody>
            </table>
            <div class="text-right">
                <button type="button" class="btn btn-secondary mb-4 js-add-item" 
                        data-block-code="${blockSettings.code}">
                            <i class="fa fa-plus"></i>
                            Добавить элемент
                </button>
            </div>  
        `;
    };

    TestCaseInfo.prototype._getBlockRowHtml = function (blockSettings, localRowValues, serverRowValues, merge) {
        const addedRow = merge && serverRowValues && !localRowValues;
        const removedRow = merge && !serverRowValues && localRowValues;

        let rowContent = '';
        for (let cellParam of blockSettings.cells) {
            if (cellParam.inInputs) {
                const localValue = localRowValues && localRowValues[cellParam.code] || '';
                const serverValue = serverRowValues && serverRowValues[cellParam.code] || '';
                const mergeConflict = !removedRow && !addedRow && merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);

                rowContent += `
                    <td width="${cellParam.width || ''}">
                        <div class="form-group ${mergeConflict ? 'has-warning' : ''}">
                            <textarea data-cell-code="${cellParam.code || ''}" class="form-control ${mergeConflict ? 'form-control-warning' : ''}" 
                                      placeholder="${cellParam.name || ''}">${addedRow ? serverValue : localValue}</textarea>
                            <div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </td>
                `;
            }
        }

        return `
            <tr class="js-item draggable ${addedRow ? 'added-row' : ''} ${removedRow ? 'removed-row' : ''}">
                <td width="1%"><i class="fa fa-arrows-v big-icon mt-2"></i></td>
                ${rowContent}
                <td width="1%"><i class="fa fa-remove big-icon mt-2 js-remove-item" role="button"></i></td>
            </tr>
        `;
    };

    TestCaseInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };


    TestCaseInfo.prototype._checkRowHasData = function ($row) {
        for (let textarea of $row.find('textarea')) {
            if ($(textarea).val()) {
                return true;
            }
        }
        return false;
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils, window.ru.belyiz.widgets);