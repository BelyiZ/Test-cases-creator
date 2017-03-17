/** @namespace window.ru.belyiz.widgets.Modal */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.Modal', Modal);
    Pattern.extend(Modal);

    /**
     * @constructor
     */
    function Modal(setup) {
        setup = setup || {};

        this.title = setup.title || '';
        this.contentHtml = setup.contentHtml || '';
        this.applyBtnText = setup.applyBtnText || 'Применить';
        this.hideApplyBtn = !!setup.hideApplyBtn;
        this.cancelBtnText = setup.cancelBtnText || 'Отмена';
        this.hideCancelBtn = !!setup.hideCancelBtn;
        this.closable = !!setup.closable;

        this._eventHandlers = {};
        this._eventNames = {
            show: 'show',
            hide: 'hide',
            apply: 'apply',
            cancel: 'cancel',
        };
    }

    Modal.prototype._cacheElements = function () {
        this.$modal = $(this._buildModalHtml());

    };

    Modal.prototype._bindEvents = function () {
        this.$modal.on('show.bs.modal', this._events.onShow.bind(this));
        this.$modal.on('hide.bs.modal', this._events.onHide.bind(this));
        this.$modal.on('click', '.js-apply-btn', this._events.onApplyClick.bind(this));
        this.$modal.on('click', '.js-cancel-btn', this._events.onCancelClick.bind(this));
    };

    Modal.prototype._events = {
        onShow: function () {
            this.trigger(this._eventNames.show);
        },

        onHide: function () {
            this.trigger(this._eventNames.hide);
        },

        onApplyClick: function () {
            this.trigger(this._eventNames.apply);
        },

        onCancelClick: function () {
            this.trigger(this._eventNames.cancel);
        }
    };

    Modal.prototype.show = function () {
        this.$modal.modal('show');
    };

    Modal.prototype.hide = function () {
        this.$modal.modal('hide');
    };

    Modal.prototype.setContentHtml = function (contentHtml) {
        this.contentHtml = contentHtml;
        this.$modal.find('.modal-body').html(contentHtml);
    };

    Modal.prototype._buildModalHtml = function () {
        return `
            <div class="modal fade" ${this.closable ? '' : 'data-backdrop="static"'}>
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${this.title}</h5>
                            <button type="button" class="close" ${this.closable ? '' : 'hidden'} data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">${this.contentHtml}</div>
                        <div class="modal-footer">
                            <button type="button" ${this.hideApplyBtn ? 'hidden' : ''}
                                    class="btn btn-primary js-apply-btn">${this.applyBtnText}</button>
                            <button type="button" ${this.hideCancelBtn ? 'hidden' : ''}
                                    class="btn btn-secondary js-cancel-btn"
                                    data-dismiss="modal">${this.cancelBtnText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };


})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);