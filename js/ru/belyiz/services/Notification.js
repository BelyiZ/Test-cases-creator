/** @namespace window.ru.belyiz.services.Notification */

(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(Notification);

    /**
     * @constructor
     */
    function Notification() {
        this.defaultDelay = 500;
    }


    Notification.prototype.show = function (message, type, delay) {
        type = type || 'info';

        $.notify({
            message: message,
            icon: false
        }, {
            type: type,
            delay: delay || 0,
            z_index: 1050,
            template: '\
                <div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert">\
                    <button type="button" class="close p-0 " data-dismiss="alert" aria-label="Close">\
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

    Notification.prototype.success = function (message) {
        this.show(message, 'success', this.defaultDelay);
    };

    Notification.prototype.warning = function (message) {
        this.show(message, 'warning', this.defaultDelay);
    };

    Notification.prototype.error = function (message) {
        this.show(message, 'danger', 0);
    };

    Notification.prototype.info = function (message) {
        this.show(message, 'info', this.defaultDelay);
    };

    Notification.prototype.static = function (message, type) {
        this.show(message, type, 0);
    };

    utils.Package.declare('ru.belyiz.services.Notification', new Notification().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.services, window.ru.belyiz.utils);