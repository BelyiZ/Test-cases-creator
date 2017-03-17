/** @namespace window.ru.belyiz.widgets.ItemsList */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.ItemsList', ItemsList);
    Pattern.extend(ItemsList);

    /**
     * @constructor
     */
    function ItemsList(setup) {
        setup = setup || {};

        this.emptyListMsg = setup.emptyListMsg || 'Список пуст';

        this.$container = $(setup.container);

        this.multipleSelectionMode = false;
        this.selectedIds = [];

        this._eventHandlers = {};
        this._eventNames = {
            selected: 'selected',
            multipleSelectionModeOn: 'multipleSelectionModeOn',
            multipleSelectionModeOff: 'multipleSelectionModeOff',
            multipleSelected: 'multipleSelected'
        };
    }

    ItemsList.prototype._bindEvents = function () {
        this.$container.on('click', '.js-items-list-item', this._events.onListItemClick.bind(this));
    };

    ItemsList.prototype._events = {
        onListItemClick: function (e) {
            const $target = $(e.currentTarget);
            const id = $target.data('itemId');
            const rev = $target.data('itemRev');

            if (this.multipleSelectionMode) {
                $target.toggleClass('active');

                const isActive = $target.hasClass('active');
                $target.find('.js-checkbox').toggleClass('fa-square-o', !isActive).toggleClass('fa-check-square-o', isActive);

                if (isActive) {
                    this.selectedIds.push(id);
                } else {
                    const pos = this.selectedIds.indexOf(id);
                    if (pos !== -1) {
                        this.selectedIds.splice(pos, 1);
                    }
                }
                this.trigger(this._eventNames.multipleSelected, {ids: this.selectedIds});

            } else {
                this.resetSelection();
                $target.addClass('active');

                this.trigger(this._eventNames.selected, {id: id, rev: rev});
            }
        }
    };

    ItemsList.prototype.reDraw = function (items, currentItemId) {
        this.$container.html('');

        const $listGroup = $('<div class="js-items-list list-group"></div>');

        if (items && items.length) {
            for (let item of items) {
                const $itemsContainer = $('<div class="d-inline-block full-width"></div>');
                $.each(item, (key, value) => {
                    if (!key.startsWith('_') && key !== 'id' && key !== 'rev') {
                        $itemsContainer.append(`<div class="text-truncate"><small><b>${key}:</b></small> ${value}</div>`);
                    }
                });

                const isActive = currentItemId && currentItemId === item.id;
                const $listGroupItem = $(`
                    <div class="list-group-item list-group-item-action js-items-list-item ${isActive ? 'active' : ''}" role="button"
                         data-item-id="${item.id}"
                         data-item-rev="${item.rev}">
                         <div class="collapse align-top cases-list-checkbox"><i class="fa fa-square-o align-middle js-checkbox"/></div>
                    </div>
                `);

                $listGroupItem.append($itemsContainer);
                $listGroup.append($listGroupItem);
            }
            this.$container.append($listGroup);
        } else {
            this.$container.html(`<div class="alert alert-info">${this.emptyListMsg}</div>`);
        }
    };

    ItemsList.prototype.resetSelection = function () {
        this.$container.find('.active').removeClass('active');
        this.$container.find('.js-checkbox').addClass('fa-square-o').removeClass('fa-check-square-o');
    };

})(window, window.ru.belyiz.patterns.ReDrawableWidget, window.ru.belyiz.utils, window.ru.belyiz.widgets);