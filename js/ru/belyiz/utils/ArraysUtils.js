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

    /**
     * Сверяет два массива на идентичность элементов.
     * @param array1 первый массив
     * @param array2 второй массив
     * @param orderDependent (опционально) учитывать порядок элементов или нет
     * @returns {boolean} возвращает false в случае, если хотя бы один из параметров (array1, array2) не массив
     */
    ArraysUtils.prototype.compare = function (array1, array2, orderDependent) {
        if (!Array.isArray(array1) || !Array.isArray(array2) || array1.length !== array2.length) {
            return false;
        }
        return orderDependent ?
            array1.every((element, index) => element === array2[index]) :
            $(array1).not(array2).length === 0 && $(array2).not(array1).length === 0;
    };

})(window, window.ru.belyiz.utils);