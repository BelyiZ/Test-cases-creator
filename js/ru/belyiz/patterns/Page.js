/** @namespace window.ru.belyiz.patterns.Page */

/**
 * "Superclass" for all pages "classes"
 */
(function (utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.patterns.Page', {
        extend: function (childClass) {
            childClass.prototype = Object.create(Page.prototype);
        },

        proto: Page.prototype
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
        typeof this._cacheElements === 'function' && this._cacheElements();
        typeof this._createWidgets === 'function' && this._createWidgets();
        typeof this._bindEvents === 'function' && this._bindEvents();
        typeof this._ready === 'function' && this._ready();
        return this;
    };

})(window.ru.belyiz.utils);