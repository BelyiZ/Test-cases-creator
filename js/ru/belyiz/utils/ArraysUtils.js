/** @namespace window.ru.belyiz.utils.ArraysUtils */

(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.ArraysUtils', new ArraysUtils());

    /**
     * @constructor
     */
    function ArraysUtils() {
    }

    /**
     * Возвращает элемент массива по указанному индексу или значение по-умолчанию, если индекс вне границ массива
     * @param array массив для выборки элемента
     * @param index порядковый номер целевого элемента в массиве
     * @param defaultValue значение по-умолчанию
     */
    ArraysUtils.prototype.getOfDefault = function (array, index, defaultValue) {
        return index >= 0 && array && index < array.length ? array[index] : defaultValue;
    };

})(window, window.ru.belyiz.utils);