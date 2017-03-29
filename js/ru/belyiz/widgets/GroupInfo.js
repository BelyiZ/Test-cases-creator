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
        this._msgMergeConflict = 'Данные на сервере изменились. ';
        this._msgServerFieldEmpty = 'Значение этого поля было удалено.';
        this._msgActualFieldValue = 'Актуальный текст:\n';
        this._msgRemovedFromServer = 'Редактируемая группа была удалена с сервера. Если сохранить изменения - это будет эквивалентно созданию новой.';
        this._msgTestCasesTooltip = 'Изменение порядка тест-кейсов сохраняется сразу автоматически, нажимать кнопку "Сохранить изменения" не нужно.';

        this._eventHandlers = {};
        this._eventNames = {
            testCasesReordered: 'testCasesReordered',
            changed: 'changed',
        };
    }

    GroupInfo.prototype._bindEvents = function () {
        this.$container.on('keyup paste change', 'textarea, input', this._events.onFieldChanged.bind(this));
    };

    GroupInfo.prototype._events = {
        onFieldChanged: function () {
            this.trigger(this._eventNames.changed);
        }
    };

    GroupInfo.prototype.reDraw = function (settings, localData, serverData) {
        const groupInfo = localData && localData.group;
        const localRevision = (groupInfo && groupInfo.rev) || '';
        const serverGroupInfo = serverData && serverData.group;
        const serverRevision = (serverGroupInfo && serverGroupInfo.rev) || '';

        this.groupId = (groupInfo && groupInfo.id) || '';
        this.settings = settings;
        this.groupRevision = serverRevision || localRevision;

        this.$container.html('');
        this.$container.append(this._getGroupInfoRowsHtml(settings.groupParams, groupInfo, serverGroupInfo));
        this.$container.append(this._getTestCasesBlockHtml(serverData || localData));

        this.$container.find('[data-toggle="tooltip"]').tooltip();

        this.trigger(this._eventNames.changed);
    };

    GroupInfo.prototype.showDifference = function (serverData) {
        if (serverData.group && serverData.group.rev && serverData.group.rev !== this.groupRevision) {
            const localData = {group: this.getData()};
            this.reDraw(this.settings, localData, serverData, true);
        }
    };

    GroupInfo.prototype.removedOnServer = function () {
        services.Notification.static(this._msgRemovedFromServer, 'danger');
        this.groupId = '';
        this.groupRevision = '';
    };

    GroupInfo.prototype.getData = function () {
        let groupData = {
            id: this.groupId,
            rev: this.groupRevision,
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
     * Генерирует HTML для полей ввода инфорации о группе
     *
     * @param groupParams параметры полей ввода инфорации о группе
     * @param groupInfo данные локально-сохраненной группы, подставляются в поля ввода
     * @param serverGroupInfo данные серверной версии группы, используются для отображения разницы, при редактировании не последней версии
     * @returns {string}
     * @private
     */
    GroupInfo.prototype._getGroupInfoRowsHtml = function (groupParams, groupInfo, serverGroupInfo) {
        groupInfo = groupInfo || {};
        serverGroupInfo = serverGroupInfo || {};

        const merge = groupInfo.rev && serverGroupInfo.rev && groupInfo.rev !== this.groupRevision;

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

    /**
     * Генерирует HTML блока со списком тест-кейсов, входящих в группу
     *
     * @param groupData данные группы и всех ее тест-кейсов
     * @returns {string} сформированный HTML блока
     * @private
     */
    GroupInfo.prototype._getTestCasesBlockHtml = function (groupData) {
        const groupInfo = (groupData && groupData.group) || {};
        const testCases = (groupData && groupData.testCases) || {};

        if (!testCases || !groupInfo.testCases || groupInfo.testCases.length <= 0) {
            return `<div class="alert alert-info mt-2">${this.msgNoOneTestSelected}</div>`;
        }

        const $casesContainer = $('<div></div>');

        for (let testCaseId of groupInfo.testCases) {
            const testCase = testCases[testCaseId];
            if (testCase) {
                let html = '';
                for (let rowParam of testCase.settings.headerParams.rows) {
                    html += `
                        <div>
                            <small><b>${rowParam.name}:</b></small>
                            ${testCase.headerValues[rowParam.code]}
                        </div>
                    `;
                }

                $casesContainer.append(`
                    <div class="list-group-item draggable js-test-case-item mt-2" data-test-case-id="${testCase.id}">
                         <div class="align-top d-inline-block"><i class="fa fa-arrows-v big-icon mt-2 mr-3"></i></div>
                         <div class="d-inline-block">${html}</div>
                    </div>
                `);
            }
        }
        $casesContainer.sortable({
            items: ">.draggable",
            update: () => {
                this.trigger(this._eventNames.testCasesReordered, {
                    testCases: $.map(this.$container.find('.js-test-case-item'), (obj) => $(obj).data('testCaseId')),
                    id: this.groupId,
                    rev: this.groupRevision
                });
                this.trigger(this._eventNames.changed);
            }
        });

        const $casesBlockContainer = $(`
            <div>       
                 <h6>Тест-кейсы группы: 
                    <span class="fa fa-info-circle" role="tooltip" data-toggle="tooltip" data-placement="right" 
                          title='${this._msgTestCasesTooltip}'></span> 
                 </h6>
            </div>
        `);
        $casesBlockContainer.append($casesContainer);
        return $casesBlockContainer;
    };

    GroupInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils);