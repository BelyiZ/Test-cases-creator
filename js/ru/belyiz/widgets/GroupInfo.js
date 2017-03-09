/** @namespace window.ru.belyiz.widgets.GroupInfo */

(function (global, Pattern, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.GroupInfo', GroupInfo);
    Pattern.extend(GroupInfo);

    /**
     * @constructor
     */
    function GroupInfo(setup) {
        setup = setup || {};

        this.$container = $(setup.container);

        this.settings = {};
        this.groupId = '';
        this.groupRevision = '';

        this.msgNoOneTestSelected = 'В группе нет ни одного тест-кейса';

        this._eventHandlers = {};
        this._eventNames = {
            changed: 'changed',
        };
    }

    GroupInfo.prototype._bindEvents = function () {
    };

    GroupInfo.prototype._events = {};

    GroupInfo.prototype.reDraw = function (settings, groupInfo, serverGroupInfo) {
        this.groupId = groupInfo && groupInfo._id || '';
        this.settings = settings;

        const serverRevision = serverGroupInfo && serverGroupInfo._rev || '';
        const localRevision = groupInfo && groupInfo._rev || '';
        this.groupRevision = serverRevision || localRevision;

        this.$container.html('');
        this.$container.append(this._getGroupInfoRowsHtml(settings.groupParams, groupInfo, serverGroupInfo));
        this.$container.append(this._getTestCasesBlockHtml(settings.groupParams, groupInfo, serverGroupInfo));
    };

    // GroupInfo.prototype.showDifference = function (serverGroupInfo) {
    //     // const localGroupInfo = this.getTestCaseData();
    //     if (serverGroupInfo._rev && serverGroupInfo._rev !== this.testCaseRevision) {
    //         utils.ShowNotification.static(`
    //             ${this._msgChangedOnServer}
    //             <div class="added-row text-left p-1">${this._msgAddedRowHint}</div>
    //             <div class="removed-row text-left p-1">${this._msgRemovedRowHint}</div>
    //         `, 'warning');
    //
    //         this.reDraw(this.settings, this.getTestCaseData(), serverGroupInfo);
    //     }
    // };

    // GroupInfo.prototype.removedOnServer = function () {
    //     utils.ShowNotification.static(this._msgRemovedFromServer, 'danger');
    //     let testCaseData = this.getTestCaseData();
    //     testCaseData._id = '';
    //     testCaseData._rev = '';
    //     this.reDraw(this.settings, testCaseData);
    // };

    GroupInfo.prototype.getData = function () {
        let groupData = {
            _id: this.groupId,
            _rev: this.groupRevision,
            settings: this.settings,
            headerValues: {},
            testCases: []
        };

        for (let rowParam of this.settings.groupParams.rows) {
            groupData.headerValues[rowParam.code] = this._getCellValue(this.$container.find('#groupHeaderRows'), rowParam.code);
        }
        for (let item of this.$container.find('.js-test-case-item')) {
            const $item = $(item);
            groupData.testCases.push($item.data('testCaseId'));
        }

        return groupData;
    };

    /**
     * Генерирует HTML для полей ввода шапки таблицы
     *
     * @param groupParams параметры полей ввода шапки таблицы
     * @param groupInfo данные локально-сохраненного тест-кейса, подставляются в поля ввода
     * @param serverGroupInfo данные серверной версии тест-кейса, используются для отображения разницы, при редактировании не последней версии
     * @returns {string}
     * @private
     */
    GroupInfo.prototype._getGroupInfoRowsHtml = function (groupParams, groupInfo, serverGroupInfo) {
        groupInfo = groupInfo || {};
        serverGroupInfo = serverGroupInfo || {};

        const merge = groupInfo._rev && serverGroupInfo._rev && groupInfo._rev !== this.groupRevision;

        let rowsHtml = '';
        for (let rowParam of groupParams.rows) {
            if (rowParam.inInputs) {
                const localValue = groupInfo.headerValues && groupInfo.headerValues[rowParam.code] || '';
                const serverValue = serverGroupInfo.headerValues && serverGroupInfo.headerValues[rowParam.code] || '';
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
            <div id="groupHeaderRows">${rowsHtml}</div>
        `;
    };

    GroupInfo.prototype._getTestCasesBlockHtml = function (blockSettings, localTestCases, serverTestCases, merge) {
        localTestCases = localTestCases || [];
        serverTestCases = serverTestCases || [];

        const $casesContainer = $('<div></div>');

        const rowsCount = Math.max(localTestCases.length, serverTestCases.length);
        if (rowsCount > 0) {
            for (let i = 0; i < rowsCount; i++) {
                const localTestCase = utils.ArraysUtils.getOfDefault(localTestCases, i, false);
                // const serverTestCase = utils.ArraysUtils.getOfDefault(serverTestCases, i, false);
                let html = '';
                for (let rowParam of localTestCase.settings.headerParams.rows) {
                    html += `
                        <div>
                            <small><b>${rowParam.name}:</b></small>
                            ${testCase.headerValues[rowParam.code]}
                        </div>
                    `;
                }

                $casesContainer.append(`
                    <div class="list-group-item draggable js-test-case-item mt-2" data-test-case-id="${localTestCase._id}">
                         <div class="align-top d-inline-block"><i class="fa fa-arrows-v big-icon mt-2 mr-3"></i></div>
                         <div class="d-inline-block">${html}</div>
                    </div>
                `);
            }

            $casesContainer.sortable({
                items: ">.draggable",
                update: () => this.trigger(this._eventNames.changed, this._getTestsCasesIds())
            });
        } else {
            $casesContainer.html(`<div class="alert alert-info mt-2">${this.msgNoOneTestSelected}</div>`);
        }
        return $casesContainer;
    };

    GroupInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils);