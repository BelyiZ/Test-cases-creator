/** @namespace window.ru.belyiz.widgets.VerticalMenu */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.VerticalMenu', VerticalMenu);
    Pattern.extend(VerticalMenu);

    /**
     * @constructor
     */
    function VerticalMenu(setup) {
        setup = setup || {};

        this.menuId = setup.menuId;
    }

    VerticalMenu.prototype._cacheElements = function () {
        this.$menu = $(`#${this.menuId}`);
        this.$showMenuBtn = $(`.js-show-vertical-menu[data-menu-id="${this.menuId}"]`);
        this.$hideMenuBtn = $(`.js-hide-vertical-menu[data-menu-id="${this.menuId}"]`);

    };

    VerticalMenu.prototype._bindEvents = function () {
        global.nodes.body.on('click', `.js-show-vertical-menu[data-menu-id="${this.menuId}"]`, this._events.onShowMenuClick.bind(this));
        global.nodes.body.on('click', `.js-hide-vertical-menu[data-menu-id="${this.menuId}"]`, this._events.onHideMenuClick.bind(this));
    };

    VerticalMenu.prototype._events = {
        onShowMenuClick: function () {
            this.show();
        },

        onHideMenuClick: function () {
            this.hide();
        }
    };

    VerticalMenu.prototype.show = function () {
        this.$showMenuBtn.hide();
        this.$menu.show('slide', {direction: 'left'}, 300, () => this.$hideMenuBtn.show());
    };

    VerticalMenu.prototype.hide = function () {
        if (this.$hideMenuBtn.is(':visible')) {
            this.$hideMenuBtn.hide();
            this.$menu.hide('slide', {direction: 'left'}, 200, () => this.$showMenuBtn.show());
        }
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);