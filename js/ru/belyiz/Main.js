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
        this.$pagesContainers = $('.js-page-container');
    };

    Main.prototype._createWidgets = function () {
        this.settingsModalWidget = new widgets.SettingsModal().initialize();
    };

    Main.prototype._bindEvents = function () {
        global.nodes.body.on('click', '.js-settings-button', this._events.onEditSettingsClick.bind(this));
        global.nodes.body.on('click', '.js-change-db-button', this._events.onChangeDbClick.bind(this));
        global.nodes.body.on('click', '.js-nav-link', this._showPage.bind(this));

        this.settingsModalWidget.on('save', this._events.onSettingsSaved, this);
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
    };

    Main.prototype._showPage = function () {
        const pageCode = this._getCurrentUrlHash();
        
        if (!this.initPages[pageCode]) {
            this.initPages[pageCode] = new pages[pageCode]().initialize();
        }
        
        this.$pagesContainers.hide();
        this.$pagesContainers.filter(`[data-page-code="${pageCode}"]`).show();
    };

    Main.prototype._getCurrentUrlHash = function () {
        const hash = global.location.hash.replace('#', '');
        return (hash && hash in pages) ? hash : this.defaultPage;
    };

    new Main().initialize();
})(window, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services, window.ru.belyiz.pages);