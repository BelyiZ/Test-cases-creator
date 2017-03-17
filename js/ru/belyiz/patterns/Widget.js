/** @namespace window.ru.belyiz.patterns.Widget */

/**
 * "Superclass" for all instance of widgets. Must be imported in main template
 */
(function (utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.patterns.Widget', {
        extend: function (newWidget) {
            newWidget.prototype = Object.create(Widget.prototype);
        },

        proto: Widget.prototype
    });

    /**
     * @constructor
     */
    function Widget() {
    }

    /**
     * Initialize instance of "class"
     * @returns {Widget} this instance
     */
    Widget.prototype.initialize = function () {
        typeof this._cacheElements === 'function' && this._cacheElements();
        typeof this._createWidgets === 'function' && this._createWidgets();
        typeof this._bindEvents === 'function' && this._bindEvents();
        typeof this._ready === 'function' && this._ready();
        return this;
    };

    /**
     * Subscription to event
     * Usage:
     *  widget.on('eventName', function (data) {}, context)
     */
    Widget.prototype.on = function (eventName, handler, context) {
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
     *  widget.off('eventName', function)
     */
    Widget.prototype.off = function (eventName, handler) {
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
    Widget.prototype.trigger = function (eventName) {
        let handlers = this._eventHandlers[eventName];
        if (!handlers) {
            return;
        }

        for (let i = 0, len = handlers.length; i < len; i++) {
            handlers[i].handler.apply(handlers[i].context, [].slice.call(arguments, 1));
        }
    };

})(window.ru.belyiz.utils);