/** @namespace window.ru.belyiz.patterns.ReDrawableWidget */

/**
 * "Superclass" for all instance of widgets. Must be imported in main template
 */
(function (pattern, utils) {
    'use strict';
    ReDrawableWidget.prototype = Object.create(pattern.proto);

    utils.Package.declare('ru.belyiz.patterns.ReDrawableWidget', {
        extend: function (newWidget) {
            newWidget.prototype = Object.create(ReDrawableWidget.prototype);
        },

        clazz: ReDrawableWidget,
        proto: ReDrawableWidget.prototype,
    });

    /**
     * @constructor
     */
    function ReDrawableWidget() {
    }

    /**
     * Initialize instance of "class"
     * @returns {Widget} this instance
     */
    ReDrawableWidget.prototype.initialize = function () {
        if (typeof this.reDraw !== 'function') {
            throw('Функция reDraw() должна быть переопределена в классе, наследуемом от ReDrawableWidget.');
        }
        return pattern.proto.initialize.call(this);
    };

})(window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils);