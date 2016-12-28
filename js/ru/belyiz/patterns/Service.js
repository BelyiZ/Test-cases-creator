/** @namespace window.ru.belyiz.patterns.Service */

/**
 * "Superclass" for all instance of services. Must be imported in main template
 */
(function (utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.patterns.Service', {
        extend: function (newService) {
            newService.prototype = Object.create(Service.prototype);
        },

        parent: Service.prototype
    });

    /**
     * @constructor
     */
    function Service() {
    }

    /**
     * Initialize instance of "class"
     * @returns {Service} this instance
     */
    Service.prototype.initialize = function (callback) {
        if (typeof this._init === 'function') {
            this._init(callback);
        } else {
            typeof callback === 'function' && callback();
        }

        return this;
    };

})(window.ru.belyiz.utils);