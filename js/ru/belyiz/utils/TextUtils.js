/** @namespace window.ru.belyiz.utils.TextUtils */

(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.TextUtils', new TextUtils());

    /**
     * @constructor
     */
    function TextUtils() {
        this.markdownConverter = new showdown.Converter({
            strikethrough: true
        });
    }

    TextUtils.prototype.markdownToHtml = function (text) {
        return this.markdownConverter.makeHtml(text);
    };

    TextUtils.prototype.brakesForExcelFix = function (text) {
        text = text ? text + '' : '';
        return text.replace(/\n/g, '<br style="mso-data-placement:same-cell;" />');
    };

})(window, window.ru.belyiz.utils);