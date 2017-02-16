/** @namespace window.ru.belyiz.utils.InputsUtils */

(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.InputsUtils', new InputsUtils());

    /**
     * @constructor
     */
    function InputsUtils() {
    }

    /**
     * Calculate textarea height by included content
     * @param textarea textarea DOM-element
     */
    InputsUtils.prototype.resizeTextArea = function (textarea) {
        this._calculateTextAreaHeight(textarea);
        textarea.blur();
        textarea.focus();
    };

    /**
     * Calculate text areas height by included content
     */
    InputsUtils.prototype.resizeTextAreas = function () {
        $('textarea').each((i, textarea) => this._calculateTextAreaHeight(textarea));
    };

    InputsUtils.prototype.selectRange = function (element, start, end) {
        if (end === undefined) {
            end = start;
        }
        if ('selectionStart' in element) {
            element.selectionStart = start;
            element.selectionEnd = end;
        } else if (element.setSelectionRange) {
            element.setSelectionRange(start, end);
        } else if (element.createTextRange) {
            const range = element.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    };

    InputsUtils.prototype._calculateTextAreaHeight = function (textarea) {
        textarea.style.height = '5px';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    };

})(window, window.ru.belyiz.utils);