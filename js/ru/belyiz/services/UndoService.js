/** @namespace window.ru.belyiz.services.UndoService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(UndoService);

    /**
     * Сервис для отображения сообщений о возможности отменить только что сделанное действие.
     * @constructor
     */
    function UndoService() {
        this._undoLinkMsg = 'Вернуть как было';
        this._undoFailed409Msg = 'Действие не может быть отмененно, т.к. кто-то уже успел изменить сущность.';
        this._undoFailedMsg = 'Действие не может быть отмененно, т.к. произошла какая-то ошибка.';

        this._eventHandlers = {};
        this._eventNames = {
            undo: 'undo',
        };
    }

    UndoService.prototype._init = function () {
        global.nodes.body.on('click', '.js-undo-alert', this._events.onUndoClick.bind(this));
    };

    UndoService.prototype._events = {
        onUndoClick: function (e) {
            const $target = $(e.currentTarget);
            const id = $target.data('id');
            const rev = $target.data('rev');

            let lastRev = '';
            services.DatabaseService.localDB
                .get(id, {revs: true, revs_info: true, open_revs: 'all'})
                .then(result => {
                    if (rev.indexOf(result[0].ok._revisions.ids[1]) === -1) {
                        // отменить можно только последнюю операцию над сущностью
                        throw Error({status: 409});
                    }
                    lastRev = result[0].ok._rev;
                    return services.DatabaseService.localDB.get(id, {rev: rev});
                })
                .then(doc => {
                    doc._rev = lastRev;
                    return services.DatabaseService.localDB.put(doc);
                })
                .then(doc => {
                    const id = services.DatabaseService.parseId(doc.id);
                    const type = services.DatabaseService.parseType(doc.id);
                    this.trigger(this._eventNames.undo, {id: id, type: type});

                    $target.closest('.alert').remove();
                })
                .catch(err => {
                    if (err.status === 409) {
                        services.Notification.warning(this._undoFailed409Msg);
                    } else {
                        console.error(err);
                        services.Notification.warning(this._undoFailedMsg);
                    }
                });
        }
    };

    UndoService.prototype.show = function (text, id, rev) {
        const undoLink = `&ensp;<nobr><a href="javascript:;" class="js-undo-alert" data-id="${id}" data-rev="${rev}">${this._undoLinkMsg}</a></nobr>`;
        services.Notification.show(text + undoLink, 'success', 10000);
    };

    utils.Package.declare('ru.belyiz.services.UndoService', new UndoService().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.services, window.ru.belyiz.utils);