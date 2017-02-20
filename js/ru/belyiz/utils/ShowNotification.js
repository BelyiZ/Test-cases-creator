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
            z_index: 1050,
            template: '\
                <div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert">\
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                        <span aria-hidden="true">&times;</span>\
                    </button>\
                    <span data-notify="icon"></span>\
                    <span data-notify="title">{1}</span>\
                    <span data-notify="message" class="d-block pr-4">{2}</span>\
                    <div class="progress" data-notify="progressbar">\
                        <div class="progress-bar progress-bar-{0}" role="progressbar" \
                             aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0;"></div>\
                    </div>\
                    <a href="{3}" target="{4}" data-notify="url"></a>\
                </div>',
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
