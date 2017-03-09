/** @namespace window.ru.belyiz.patterns.AbstractEntityInfoWidget */

/**
 * "Superclass" for all instance of widgets. Must be imported in main template
 */
(function (pattern, utils) {
    'use strict';
    AbstractEntityInfoWidget.prototype = Object.create(pattern.proto);

    utils.Package.declare('ru.belyiz.patterns.AbstractEntityInfoWidget', {
        extend: function (newWidget) {
            newWidget.prototype = Object.create(AbstractEntityInfoWidget.prototype);
        },

        clazz: AbstractEntityInfoWidget,
        proto: AbstractEntityInfoWidget.prototype
    });

    /**
     * @constructor
     *
     * Абстрактный класс-родитель для виджетов с информацией о сущности
     */
    function AbstractEntityInfoWidget() {
    }

    /**
     * Initialize instance of "class"
     * @returns {Widget} this instance
     */
    AbstractEntityInfoWidget.prototype.initialize = function () {
        if (typeof this.getData !== 'function') {
            throw('Функция getData() должна быть переопределена в классе, наследуемом от AbstractEntityInfoWidget.');
        }
        return pattern.proto.initialize.call(this);
    };

})(window.ru.belyiz.patterns.ReDrawableWidget, window.ru.belyiz.utils);