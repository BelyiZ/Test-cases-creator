/** @namespace window.ru.belyiz.services.Confirmation */

(function (global, Pattern, widgets, utils) {
    'use strict';
    Pattern.extend(Confirmation);

    /**
     * Сервис для отображения модального окна с просьбой подтвердить действие.
     * Модальное окно используется одно. Внутри заменяются тексты и контент.
     * В DOM-дерево конейнер добавляется только один раз
     * @constructor
     */
    function Confirmation() {
        this.defaultMessages = {
            title: 'Требуется подтверждение',
            text: 'Точно?',
            applyBtn: 'Подтвердить',
            cancelBtn: 'Отменить',
        };
        this.onApplyCallback = null;
    }

    Confirmation.prototype._init = function () {
        this.modal = new widgets.Modal({
            id: this.id,
            title: this.defaultMessages.title,
            contentHtml: `<p class="js-modal-text">${this.defaultMessages.text}</p>`,
            applyBtnText: this.defaultMessages.applyBtnText,
            cancelBtnText: this.defaultMessages.cancelBtnText,
        }).initialize();

        this.modal.on('apply', this._events.onConfirm, this);

    };

    Confirmation.prototype._events = {
        onConfirm: function () {
            if (typeof (this.onApplyCallback) === 'function') {
                this.onApplyCallback();
            }
            this.modal.hide();
        }
    };

    /**
     * Отображение модального окна подверждения
     * @param messages сообщения, которые будут вставлены в модальное окно: {
     *                     title: заголовк окна,
     *                     text:  текст сообщения,
     *                     applyBtn: текст кнопки подверждения,
     *                     cancelBtn: текст кнопки отмены,
     *                 }
     * @param onApplyCallback
     */
    Confirmation.prototype.show = function (messages, onApplyCallback) {
        messages = $.extend({}, this.defaultMessages, messages);
        this.onApplyCallback = onApplyCallback;

        this.modal
            .setTitle(messages.title)
            .setContentText(messages.text)
            .setApplyBtnText(messages.applyBtn)
            .setCancelBtnText(messages.cancelBtn)
            .show();
    };

    utils.Package.declare('ru.belyiz.services.Confirmation', new Confirmation().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.widgets, window.ru.belyiz.utils);