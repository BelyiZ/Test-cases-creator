/** @namespace window.ru.belyiz.patterns.Page */

/**
 * "Superclass" for all pages "classes"
 */
(function (utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.patterns.Page', {
        extend: function (childClass) {
            childClass.prototype = Object.create(Page.prototype);
        }
    });

    /**
     * @constructor
     */
    function Page() {
    }

    /**
     * Initialize instance of "class"
     * @returns {Page} this instance
     */
    Page.prototype.initialize = function () {
        this._preparePage();

        typeof this._cacheElements === 'function' && this._cacheElements();
        typeof this._createWidgets === 'function' && this._createWidgets();
        typeof this._bindEvents === 'function' && this._bindEvents();
        typeof this._initServices === 'function' && this._initServices();
        typeof this._ready === 'function' && this._ready();
        return this;
    };

    Page.prototype._preparePage = function () {
        $('.js-create-button span').text(this.pageSettings.createBtnText || 'Создать');
        $('.js-save-button span').text(this.pageSettings.saveBtnText || 'Сохранить изменения');
        $('.js-remove-button span').text(this.pageSettings.removeBtnText || 'Удалить');

        $('#content').html('');
        $('#itemsVerticalListContainer').html('');
    };


})(window.ru.belyiz.utils);