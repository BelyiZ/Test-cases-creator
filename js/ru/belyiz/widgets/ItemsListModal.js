/** @namespace window.ru.belyiz.widgets.ItemsListModal */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.ItemsListModal', ItemsListModal);
    Pattern.extend(ItemsListModal);

    /**
     * @constructor
     *
     * Модальное окно с возможностью выбора из списка элементов.
     *
     * Список элементов может быть передан в конструкторе в параметре items или после инициализации вызовом метода setItems(array).
     * В качестве элементов могут быть строки или объекты:
     *  {
     *      name - строка, отображаемый текст для пользователя,
     *      code - код, который будет храниться в атрибуте data-item-code
     *  }
     *
     */
    function ItemsListModal(setup) {
        setup = setup || {};

        this.modalId = $.now() + '';

        this.items = setup.items || [];
        this.emptyMsg = setup.emptyMsg || 'Нет ни одного доступного элемента';

        this.modalSetup = setup;

        this._eventHandlers = {};
        this._eventNames = {
            selected: 'selected',
        };
    }

    ItemsListModal.prototype._cacheElements = function () {

    };

    ItemsListModal.prototype._createWidgets = function () {
        this.modal = new widgets.Modal(this.modalSetup).initialize();
    };

    ItemsListModal.prototype._bindEvents = function () {
        global.nodes.body.on('click', `[data-modal-id="${this.modalId}"] .list-group-item`, this._events.onItemClick.bind(this));

    };

    ItemsListModal.prototype._ready = function () {
        this.setItems(this.items);
    };

    ItemsListModal.prototype._events = {
        onItemClick: function (e) {
            const $target = $(e.currentTarget);
            this.trigger(this._eventNames.selected, {name: $target.text(), code: $target.data('itemCode')});
            this.hide();
        }
    };

    /**
     * С помощью этой функции можно задать отображаемый список элементов.
     * В качестве элементов могут быть строки или объекты:
     *  {
     *      name - строка, отображаемый текст для пользователя,
     *      code - код, который будет храниться в атрибуте data-item-code
     *  }
     *
     * @param items (array)
     * @param showOnFinish (boolean) показывать или нет диалог после вставки значений в список
     */
    ItemsListModal.prototype.setItems = function (items, showOnFinish) {
        let itemsHtml = '';

        for (let item of items) {
            itemsHtml += `
                <div class="list-group-item list-group-item-action" 
                      role="button" data-item-code="${item.code || ''}">${item.name || ($.type(item) === 'string' ? item : '<i>Без названия</i>')}</div>
            `;
        }
        this.modal.setContentHtml(`<div class="list-group" data-modal-id="${this.modalId}">${itemsHtml || this.emptyMsg}</div>`);

        if (showOnFinish) {
            this.show();
        }
    };

    ItemsListModal.prototype.show = function () {
        this.modal.show();
    };

    ItemsListModal.prototype.hide = function () {
        this.modal.hide();
    };


})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);