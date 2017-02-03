/** @namespace window.ru.belyiz.utils.ShowNotification */

(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.ShowNotification', new ShowNotification());

    /**
     * @constructor
     */
    function ShowNotification() {
    }


    ShowNotification.prototype.show = function (message, type, autoclosable) {
        type = type || 'info';
        autoclosable = !!autoclosable;

        $.notify({
            message: message,
            icon: false
        }, {
            type: type + ' alert-dismissible',
            delay: autoclosable ? 5000 : 0,
        });
    };

    ShowNotification.prototype.success = function (message) {
        this.show(message, 'success', true);
    };

    ShowNotification.prototype.warning = function (message) {
        this.show(message, 'warning', true);
    };

    ShowNotification.prototype.error = function (message) {
        this.show(message, 'danger', false);
    };

    ShowNotification.prototype.info = function (message) {
        this.show(message, 'info', true);
    };

    ShowNotification.prototype.static = function (message, type) {
        this.show(message, type, false);
    };


})(window, window.ru.belyiz.utils);
