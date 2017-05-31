/** @namespace window.ru.belyiz.pages.Testing */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.Testing', Testing);
    Pattern.extend(Testing);

    /**
     * @constructor
     */
    function Testing(setup) {
        setup = setup || {};
        //todo получение id сущности и ее типа

        this.defaultEntityType = setup.defaultEntityType || 'tests';
        this.currentEntityType = this.defaultEntityType;

        this._msgTestCasesListEmpty = 'Нет сохраненных тест кейсов';
        this._msgGroupsListEmpty = 'Нет сохраненных групп';
    }

    Testing.prototype._cacheElements = function () {
        this.$content = $('#content');
        this.$resultTable = $('#resultTable');
        this.$itemsListContainer = $('#itemsVerticalListContainer');
        this._cacheSidebarElements();
    };

    /**
     * Обнуление HTML боковой панели до базового и кеширование элементов
     * @private
     */
    Testing.prototype._cacheSidebarElements = function () {
        this.setSidebarBasicHTML();
        this.$sidebarPanes = this.$itemsListContainer.find('.js-testing-sidebar-pane');
        this.$testsContainer = this.$sidebarPanes.filter('[data-entity-type="tests"]');
        this.$grouspContainer = this.$sidebarPanes.filter('[data-entity-type="groups"]');
    };

    Testing.prototype._createWidgets = function () {
        this.testingStepsWidget = new widgets.TestingSteps({
            container: this.$content,
            entityService: services.TestCasesService
        }).initialize();

        this.testingResultTableWidget = new widgets.TestingResultTable({container: this.$resultTable}).initialize();

        this._createEntitiesListsWidgets();
    };

    /**
     * Создание виджетов для список сущностей на боковой панели
     * @private
     */
    Testing.prototype._createEntitiesListsWidgets = function () {
        this.testsListWidget = new widgets.ItemsList({
            emptyListMsg: this._msgTestCasesListEmpty,
            container: this.$testsContainer
        }).initialize();

        this.groupsListWidget = new widgets.ItemsList({
            emptyListMsg: this._msgGroupsListEmpty,
            container: this.$grouspContainer
        }).initialize();
    };

    Testing.prototype._bindWidgetsEvents = function () {
        this._unbindWidgetsEvents();
        this.testingStepsWidget.on('changed', this._events.onTestingResultChanged, this);
        services.DatabaseService.on('dbChanged', this._events.onDatabaseChanged, this);

        this.testsListWidget && this.testsListWidget.on('selected', this._events.onItemSelected, this);
        this.groupsListWidget && this.groupsListWidget.on('selected', this._events.onItemSelected, this);
    };

    Testing.prototype._unbindWidgetsEvents = function () {
        this.testingStepsWidget.off('changed', this._events.onTestingResultChanged);
        services.DatabaseService.off('dbChanged', this._events.onDatabaseChanged);

        this.testsListWidget && this.testsListWidget.off('selected', this._events.onItemSelected);
        this.groupsListWidget && this.groupsListWidget.off('selected', this._events.onItemSelected);
    };

    Testing.prototype._bindEvents = function () {
        this._bindWidgetsEvents();

        global.nodes.body.on('keyup', '[data-page-code="Testing"] textarea', this._events.onTextAreaKeyup.bind(this));
        global.nodes.body.on('click', '[data-page-code="Testing"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
        global.nodes.body.on('show.bs.tab', '.js-testing-sidebar-tab', this._events.onSidebarTabChanged.bind(this));
    };


    Testing.prototype._events = {
        // Когда изменились данные результата тестирования
        onTestingResultChanged: function () {
            this.testingResultTableWidget.reDraw(this.testingStepsWidget.getData());
        },

        // Когда нажади на кнопку скачивания отчета о тестировании
        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, 'testingResult', $target.data('fileType'));
        },

        onTextAreaKeyup: function (e) {
            utils.InputsUtils.resizeTextArea(e.currentTarget);
        },

        // Когда нажади на кнопку сохранения отчета о тестировании
        onSaveButtonClick: function () {
            // todo сохранить в базе
        },

        // Когда произошла смена используемой БД
        onDatabaseChanged: function () {
            this.showEntitiesList();
            this.showEntityInfo();
        },

        // Когда выбран элемент в списке сущностей
        onItemSelected: function (data) {
            global.nodes.body.trigger('closeVerticalMenu');

            if (data.id) {
                this._getEntityService().getEntity(data.id, entity => this.showEntityInfo.call(this, entity));
            } else {
                this.showEntityInfo();
            }
        },

        // Когда изменился тип используемых сущностей
        onSidebarTabChanged: function (e) {
            const $target = $(e.currentTarget);
            this.currentEntityType = $target.data('entityType') || this.defaultEntityType;
            this.showEntitiesList();
            this.showEntityInfo();
        }
    };

    Testing.prototype._prepareTestCasesForList = function (docs) {
        let testCases = [];
        for (let doc of docs) {
            let testCase = {id: doc.id, rev: doc.rev};
            for (let rowParams of doc.settings.tests.header.rows) {
                testCase[rowParams.name] = doc.headerValues[rowParams.code];
            }

            testCases.push(testCase);
        }
        return testCases;
    };

    Testing.prototype.enable = function () {
        this.$content.html('');
        this.$resultTable.html('');
        $('.js-manage-item-buttons').hide();
        this.currentEntityType = this.defaultEntityType;

        this._cacheSidebarElements();
        this._createEntitiesListsWidgets();
        this._bindWidgetsEvents();

        if (services.DatabaseService.isInitialized()) {
            this.showEntitiesList();
            this.showEntityInfo();
        }
    };

    Testing.prototype.disable = function () {
        delete this.testsListWidget;
        delete this.groupsListWidget;
        this._unbindWidgetsEvents();
    };

    /**
     * Устанавливает начальное состояние HTML боковой панели
     */
    Testing.prototype.setSidebarBasicHTML = function () {
        this.$itemsListContainer.html(`
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item">
                    <a class="nav-link js-testing-sidebar-tab ${this.defaultEntityType === 'tests' ? 'active' : ''}" href="javascript:;"
                       data-target=".js-testing-sidebar-pane[data-entity-type='tests']" data-toggle="tab" role="tab" 
                       data-entity-type="tests">Тест-кейсы</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link js-testing-sidebar-tab ${this.defaultEntityType === 'groups' ? 'active' : ''}" href="javascript:;"
                       data-target=".js-testing-sidebar-pane[data-entity-type='groups']" data-toggle="tab" role="tab" 
                       data-entity-type="groups">Группы</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane js-testing-sidebar-pane fade ${this.defaultEntityType === 'tests' ? 'show active' : ''}" 
                    id="testing--type-tests" role="tabpanel" data-entity-type="tests"></div>
                <div class="tab-pane js-testing-sidebar-pane fade ${this.defaultEntityType === 'groups' ? 'show active' : ''}"
                    id="testing--type-groups" role="tabpanel" data-entity-type="groups"></div>
            </div>
        `);
    };

    /**
     * Показывает данные сущности для начала тестирования
     * @param entity данные сущности
     */
    Testing.prototype.showEntityInfo = function (entity) {
        this.testingStepsWidget.reDraw(entity);
    };


    /**
     * Показывает данные список сущностей в боковой панели
     * @param activeId идентификатор выбранной сущности
     */
    Testing.prototype.showEntitiesList = function (activeId = -1) {
        this._getEntityService().all([], docs => {
            const entities = this.prepareItemsForList(docs, this.currentEntityType);
            this._getEntitiesListWidget().reDraw(entities, activeId);
        });
    };

    Testing.prototype._getEntityService = function () {
        if (this.currentEntityType === 'tests') {
            return services.TestCasesService;
        } else if (this.currentEntityType === 'groups') {
            return services.GroupsService;
        }
        return null;
    };

    Testing.prototype._getEntitiesListWidget = function () {
        if (this.currentEntityType === 'tests') {
            return this.testsListWidget;
        } else if (this.currentEntityType === 'groups') {
            return this.groupsListWidget;
        }
        return null;
    };

    Testing.prototype.prepareItemsForList = function (docs = []) {
        let testCases = [];
        for (let doc of docs) {
            let testCase = {id: doc.id, rev: doc.rev};
            for (let rowParams of doc.settings[this.currentEntityType].header.rows) {
                testCase[rowParams.name] = doc.headerValues[rowParams.code];
            }
            testCases.push(testCase);
        }
        return testCases;
    };

})(window, window.ru.belyiz.patterns.Page, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);