/** @namespace window.ru.belyiz.widgets.SettingsModal */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.SettingsModal', SettingsModal);
    Pattern.extend(SettingsModal);

    /**
     * @constructor
     */
    function SettingsModal() {
        this._eventHandlers = {};
        this._eventNames = {
            save: 'save'
        };
    }

    SettingsModal.prototype._html = `
        <div class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog  modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title">Редактирование параметров таблиц</h4>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning" role="alert">
                            <strong>Внимание!</strong> После сохранения все введенные данные на странице будут удалены.<br>
                            Настройки применяются только для новых тест-кейсов. Все сохраненные в базе данных сохранят свою структуру.
                        </div>
                        <div class="alert alert-info" role="alert">
                            Строки указанные в шапке таблицы отображаются в списке тест-кейсов. Оставляйте хотя бы одно поле.
                        </div>
                        <div class="alert alert-info" role="alert">
                            Проверок правильности JSON'a пока никаких нет. Пишите сразу правильно. 
                        </div>
                        <textarea class="form-control js-settings"></textarea>
                    </div>
                    <div class="modal-footer">
                        <div class="btn btn-outline-danger" data-dismiss="modal">Отмена</div>
                        <div class="btn btn-success js-save-btn">Сохранить</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    SettingsModal.prototype._cacheElements = function () {
        this.$modal = $(this._html);
        this.$settingsArea = this.$modal.find('textarea.js-settings');
    };

    SettingsModal.prototype._bindEvents = function () {
        this.$modal.on('click', '.js-save-btn', this._events.onSaveClick.bind(this));
        this.$modal.on('shown.bs.modal', () => utils.InputsUtils.resizeTextArea(this.$settingsArea.get(0)));
    };

    SettingsModal.prototype._events = {
        onSaveClick: function () {
            let settingsJson = JSON.parse(this.$settingsArea.val());
            settingsJson.rev = this.$settingsArea.data('rev');
            this.trigger(this._eventNames.save, settingsJson);
            this.$modal.modal('hide');
        }
    };

    /**
     * Create and show dialog for editing settings
     * @param settingsJson current settings json
     */
    SettingsModal.prototype.show = function (settingsJson) {
        let json = $.extend(true, {}, settingsJson);
        delete json.id;
        delete json.rev;
        this.$settingsArea.val(JSON.stringify(json, null, 4));
        utils.InputsUtils.selectRange(this.$settingsArea.get(0), 0);

        this.$settingsArea.data('rev', settingsJson.rev);
        this.$modal.modal('show');
    }

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);