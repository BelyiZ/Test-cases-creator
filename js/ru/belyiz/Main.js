/** @namespace window.ru.belyiz.pages.Common */

(function (global, utils, widgets, services, pages) {
    'use strict';

    /**
     * @constructor
     */
    function Main() {
        this.initPages = {};
        this.defaultPage = 'TestCase';
    }

    Main.prototype.initialize = function () {
        this._cacheElements();
        this._createWidgets();
        this._bindEvents();
        this._ready();
    };

    Main.prototype._cacheElements = function () {
        this.$pagesContainer = $('.js-page-container');
        this.$localDbBadge = $('.js-local-db-badge');
        this.$currentDbNameBadge = $('.js-current-db');
        this.$pagesLinks = $('.js-nav-link');
    };

    Main.prototype._createWidgets = function () {
        this.settingsModalWidget = new widgets.SettingsModal().initialize();
        this.verticalMenu = new widgets.VerticalMenu({menuId: 'itemsVerticalListMenu'}).initialize();
    };

    Main.prototype._bindEvents = function () {
        global.nodes.body.on('click', '.js-settings-button', this._events.onEditSettingsClick.bind(this));
        global.nodes.body.on('click', '.js-change-db-button', this._events.onChangeDbClick.bind(this));
        global.nodes.body.on('click', '.js-nav-link', this._events.onPageLinkClick.bind(this));

        global.nodes.body.on('closeVerticalMenu', () => this.verticalMenu.hide());

        this.settingsModalWidget.on('save', this._events.onSettingsSaved, this);

        services.DatabaseService.on('dbChanged', this._events.onDatabaseChanged, this);
    };

    Main.prototype._ready = function () {
        this._showPage();
    };

    Main.prototype._events = {
        onEditSettingsClick: function () {
            services.DatabaseService.getSettings(settings => {
                this.settingsModalWidget.show(settings);
            });
        },

        onChangeDbClick: function () {
            services.DatabaseService.showDbChoosingDialog();
        },

        onSettingsSaved: function (newSettings) {
            services.DatabaseService.saveSettings(newSettings, (entity) => utils.ShowNotification.success("Настройки сохранены"));
        },

        onDatabaseChanged: function (data) {
            this.$localDbBadge.toggle(!!data.local);
            this.$currentDbNameBadge.text(data.local ? 'Локальная' : data.name);
        },

        onPageLinkClick: function (e) {
            const $target = $(e.currentTarget);
            const hash = $target.attr('href').replace('#', '');
            this._showPage(hash);
        }
    };

    Main.prototype._showPage = function (pageCode) {
        pageCode = pageCode || this._getCurrentUrlHash();

        this.$pagesLinks.removeClass('active');
        this.$pagesLinks.filter(`[href="#${pageCode}"]`).addClass('active');

        $.each(this.initPages, function (pageCode, page) {
            page.disable();
        });

        if (!this.initPages[pageCode]) {
            this.initPages[pageCode] = new pages[pageCode]().initialize();
        }

        this.$pagesContainer.attr('data-page-code', pageCode).show();
        this.initPages[pageCode].enable();
    };

    Main.prototype._getCurrentUrlHash = function () {
        const hash = global.location.hash.replace('#', '');
        return (hash && hash in pages) ? hash : this.defaultPage;
    };

    new Main().initialize();
})(window, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services, window.ru.belyiz.pages);