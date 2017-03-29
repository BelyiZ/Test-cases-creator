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

        proto: Service.prototype
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
    Service.prototype.initialize = function () {
        if (typeof this._init === 'function') {
            this._init();
        }

        return this;
    };

    /**
     * Subscription to event
     * Usage:
     *  service.on('eventName', function (data) {}, context)
     */
    Service.prototype.on = function (eventName, handler, context) {
        if (!this._eventHandlers[eventName]) {
            this._eventHandlers[eventName] = [];
        }
        if (typeof handler === 'function') {
            this._eventHandlers[eventName].push({handler: handler, context: context});
        } else {
            console.error("Некорректный параметр handler - не функция");
        }
    };

    /**
     * Unsubscribe from event
     * Usage:
     *  service.off('eventName', function)
     */
    Service.prototype.off = function (eventName, handler) {
        let handlers = this._eventHandlers[eventName];
        if (!handlers) {
            return;
        }

        if (typeof handler !== 'function') {
            this._eventHandlers[eventName] = [];
            return;
        }

        for (let i = 0; i < handlers.length; i++) {
            if (handlers[i].handler === handler) {
                handlers.splice(i, 1);
            }
        }
    };

    /**
     * Event generation with data transfer
     *  this.trigger('eventName', data);
     */
    Service.prototype.trigger = function (eventName) {
        let handlers = this._eventHandlers[eventName];
        if (!handlers) {
            return;
        }

        for (let i = 0, len = handlers.length; i < len; i++) {
            handlers[i].handler.apply(handlers[i].context, [].slice.call(arguments, 1));
        }
    };

})(window.ru.belyiz.utils);