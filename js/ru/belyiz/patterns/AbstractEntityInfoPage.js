/** @namespace window.ru.belyiz.patterns.AbstractEntityInfoPage */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    AbstractEntityInfoPage.prototype = Object.create(Pattern.proto);

    utils.Package.declare('ru.belyiz.patterns.AbstractEntityInfoPage', {
        extend: function (newWidget) {
            newWidget.prototype = Object.create(AbstractEntityInfoPage.prototype);
        },

        clazz: AbstractEntityInfoPage,
        proto: AbstractEntityInfoPage.prototype
    });

    Pattern.extend(AbstractEntityInfoPage);

    /**
     * @constructor
     *
     * Абстрактный класс-родитель для страниц со стандартной разметкой: информация о сущности справа и колонка со вписком всех сущностей слева.
     *
     * В дочернем классе должна быть переменная:
     * this.pageSettings = {
     *     pageCode: код страницы,
     *     createBtnText: текст на кнопке создания новой сущности,
     *     saveBtnText: текст на кнопке сохранения изменений,
     *     removeBtnText: текст на кнопке удаления сущности,
     *     entityInfoWidget: ссылка на виджет, наследник от AbstractEntityInfoWidget,
     *     entitiesListWidget: ссылка на виджет, наследник от ReDrawableWidget,
     *     entitiesListWidgetSetup: опции виджета со списком сущностей
     *     entitiesListPrepareDataFunction: функция преобразующая документы из базы в данные для отображения списка элементов
     *     entityService: ссылка на сервис для работы с сущностью в базе данных,
     *     downloadFileName: название скачиваемого файла,
     *     activeEntityId: идентификатор сущности, которая будет выбрана по умолчанию при загрузке страницы
     * }
     */
    function AbstractEntityInfoPage() {
    }

    AbstractEntityInfoPage.prototype._cacheElements = function () {
        this.$content = $('#content');
        this.$resultTable = $('#resultTable');
        this.$itemsListContainer = $('#itemsVerticalListContainer');

        this.$manageItemBtnsContainer = $('.js-manage-item-buttons');
        this.$removeItemBtn = this.$manageItemBtnsContainer.find('.js-remove-button');
        this.$saveItemBtn = $('.js-save-button');
    };

    AbstractEntityInfoPage.prototype._createWidgets = function () {
        this.entityInfoWidget = new this.pageSettings.entityInfoWidget({
            container: this.$content,
            entityService: this.pageSettings.entityService
        }).initialize();
        if (!(this.entityInfoWidget instanceof global.ru.belyiz.patterns.AbstractEntityInfoWidget.clazz)) {
            throw ('Параметр entityInfoWidget должен быть типа AbstractEntityInfoWidget');
        }

        this.entitiesListWidget = new this.pageSettings.entitiesListWidget($.extend({}, this.pageSettings.entitiesListWidgetSetup, {
            container: this.$itemsListContainer
        })).initialize();
        if (!(this.entitiesListWidget instanceof global.ru.belyiz.patterns.ReDrawableWidget.clazz)) {
            throw ('Параметр entityInfoWidget должен быть типа AbstractEntityInfoWidget');
        }
    };

    AbstractEntityInfoPage.prototype._bindEvents = function () {
        global.nodes.body.on('click', `[data-page-code="${this.pageSettings.pageCode}"] .js-create-button`, this._events.onCreateButtonClick.bind(this));
        global.nodes.body.on('click', `[data-page-code="${this.pageSettings.pageCode}"] .js-save-button`, this._events.onSaveButtonClick.bind(this));
        global.nodes.body.on('click', `[data-page-code="${this.pageSettings.pageCode}"] .js-remove-button`, this._events.onRemoveButtonClick.bind(this));

        this._bindWidgetsEvents();
    };

    AbstractEntityInfoPage.prototype._bindWidgetsEvents = function () {
        this._unbindWidgetsEvents();

        this.entitiesListWidget.on('selected', this._events.onItemSelected, this);
        services.DatabaseService.on('dbChanged', this._events.onDatabaseChanged, this);
        services.DatabaseService.on('dbSynchronized', this._events.onDatabaseSynchronized, this);
    };

    AbstractEntityInfoPage.prototype._unbindWidgetsEvents = function () {
        this.entitiesListWidget.off('selected', this._events.onItemSelected);
        services.DatabaseService.off('dbChanged', this._events.onDatabaseChanged);
        services.DatabaseService.off('dbSynchronized', this._events.onDatabaseSynchronized);
    };

    AbstractEntityInfoPage.prototype._ready = function () {
        $('.js-create-button span').text(this.pageSettings.createBtnText || 'Создать');
        $('.js-save-button span').text(this.pageSettings.saveBtnText || 'Сохранить изменения');
        $('.js-remove-button span').text(this.pageSettings.removeBtnText || 'Удалить');

        this.$content.html('');
        this.$itemsListContainer.html('');
        this.$resultTable.html('');

        if (services.DatabaseService.isInitialized()) {
            this.showEntitiesList();
            this.showEntityInfo();
        }
    };

    AbstractEntityInfoPage.prototype.enable = function () {
        this._bindWidgetsEvents();
        this._ready();
    };

    AbstractEntityInfoPage.prototype.disable = function () {
        this._unbindWidgetsEvents();
    };

    AbstractEntityInfoPage.prototype._events = {

        onCreateButtonClick: function () {
            this.showEntityInfo();
            this.entitiesListWidget.resetSelection();
        },

        onRemoveButtonClick: function () {
            const entityData = this.entityInfoWidget.getData();
            this.pageSettings.entityService.removeEntity(
                entityData,
                () => {
                    this.showEntityInfo();
                    this.showEntitiesList();
                }
            );
        },

        onSaveButtonClick: function () {
            const data = this.entityInfoWidget.getData();
            this.pageSettings.entityService.saveEntity(data, response => {
                this.showEntityInfo(response.id);
                this.showEntitiesList(response.id);
            });
        },

        onDatabaseChanged: function () {
            // services.DatabaseService.getSettings(settings => {
            //     this.resultTableWidget.useMarkDown = !!settings.markdown
            // });
            this.showEntitiesList();
            this.showEntityInfo();
        },

        onDatabaseSynchronized: function () {
            this.showEntitiesList(this.pageSettings.activeEntityId);
            if (this.pageSettings.activeEntityId) {
                this.pageSettings.entityService.getEntity(
                    this.pageSettings.activeEntityId,
                    entity => this.entityInfoWidget.showDifference(entity),
                    err => {
                        if (err.status === 404 && err.reason === 'deleted') {
                            this.entityInfoWidget.removedOnServer();
                            this.$removeItemBtn.hide();
                        } else {
                            services.DatabaseService.processError.call(this.pageSettings.entityService, err)
                        }
                    }
                );
            }
        },

        onItemSelected: function (data) {
            global.nodes.body.trigger('closeVerticalMenu');
            this.showEntityInfo(data.id);
        },
    };

    AbstractEntityInfoPage.prototype.showEntityInfo = function (id) {
        function onSuccess(settings, values) {
            this.entityInfoWidget.reDraw(settings, values);
            // this.resultTableWidget.reDraw([this.groupInfoWidget.getGroupData()]);
        }

        this.activeEntityId = id || '';

        if (id) {
            this.pageSettings.entityService.getEntity(id, entity => onSuccess.call(this, entity.settings, entity));
            this.$removeItemBtn.show();
        } else {
            services.DatabaseService.getSettings(settings => onSuccess.call(this, settings));
            this.$removeItemBtn.hide();
        }
        this.$manageItemBtnsContainer.show();
    };

    AbstractEntityInfoPage.prototype.showEntitiesList = function (activeId) {
        this.pageSettings.entityService.all([], docs => {
            const entities = this.pageSettings.entitiesListPrepareDataFunction(docs);
            this.entitiesListWidget.reDraw(entities, activeId);
        });
    };

})(window, window.ru.belyiz.patterns.Page, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);