/** @namespace window.ru.belyiz.widgets.TestingSteps */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestingSteps', TestingSteps);
    Pattern.extend(TestingSteps);

    /**
     * Виджет для блока прохождения по тест-кейсу или группе
     * @constructor
     */
    function TestingSteps(setup) {
        setup = setup || {};

        this.$container = $(setup.container);
        this.testCasesService = setup.entityService;

        this.testCases = [];
        this.group = null;

        this._msgMergeConflict = 'Данные на сервере изменились. ';
        this._msgTestCaseNotSelected = 'Выберите тест кейс или группу в списке слева';
        this._msgNoneSteps = 'Не создано ни одного шага';
        this._textComment = 'Комментарий';
        this._textSuccess = 'Выполнен';
        this._textFail = 'Провален';
        this._textBlocked = 'Блокирован';
        this._textStepBlocked = 'Тест провален - шаг заблокирован';
        this._textPreviousStep = 'Предыдущий шаг';
        this._textNextStep = 'Следующий шаг';
        this._textStep = 'Шаг';
        this._textStepFrom = 'из';

        this._eventHandlers = {};
        this._eventNames = {
            changed: 'changed',
        };
    }

    TestingSteps.prototype._bindEvents = function () {
        this.$container.on('click', '.js-carousel-control', this._events.onCarouselControlClick.bind(this));
        this.$container.on('click', '.js-step-result', this._events.onStepResultClick.bind(this));
        this.$container.on('change', '.js-step-result-comment', this._events.onStepResultCommentChanged.bind(this));
    };

    TestingSteps.prototype._events = {
        onCarouselControlClick: function (e) {
            const $target = $(e.currentTarget);
            const $carousel = $target.closest('.js-test-case-steps-carousel');
            const action = $target.data('action');
            const $activeSlide = $carousel.find('.js-testing-step.active');
            if (action === 'prev' && $activeSlide.is(':first-child') ||
                action === 'next' && $activeSlide.is(':last-child')) {
                return;
            }

            $carousel.carousel(action);
        },

        onStepResultClick: function (e) {
            const $target = $(e.currentTarget);
            const success = $target.data('success');

            $target
                .addClass(success ? 'btn-success' : 'btn-danger')
                .closest('.js-testing-step').data('status', success ? this._textSuccess : this._textFail).end()
                .siblings('.js-step-result').removeClass('btn-success btn-danger').addClass('btn-secondary');

            const $stepsCarousel = $target.closest('.js-test-case-steps-carousel');
            this._markStepsAsBlocked($stepsCarousel);
            this._showTestCaseStatus($stepsCarousel);

            this.trigger(this._eventNames.changed);
        },

        onStepResultCommentChanged: function () {
            this.trigger(this._eventNames.changed);
        }
    };

    /**
     * Проставляет доступность шагов тест-кейса в зависимости от результата предыдущих.
     * После проваленного шага все остальные блокируются и тест помечается как проваленный.
     * @param stepsCarousel карусель с шагами тест-кейса
     * @private
     */
    TestingSteps.prototype._markStepsAsBlocked = function (stepsCarousel) {
        let afterFailedStep = false;
        stepsCarousel.find('.js-testing-step').each((i, obj) => {
            const $step = $(obj);
            if (afterFailedStep) {
                $step.data('status', this._textBlocked)
                    .find('textarea').prop('disabled', true).val('').end()
                    .find('.js-step-result').hide().end()
                    .find('.js-step-blocked-text').show();
            } else if ($step.data('status') === this._textFail) {
                afterFailedStep = true;
            } else if ($step.data('status') === this._textBlocked) {
                $step.data('status', '')
                    .find('textarea').prop('disabled', false).end()
                    .find('.js-step-result').removeClass('btn-success btn-danger').show().end()
                    .find('.js-step-blocked-text').hide();
            }
        });
    };

    /**
     * Вычисляет и показывает статус всего тест-кейса. Статусы могут быть:
     * провален - если хотя бы один из шагов провален,
     * тестируется - если есть незавершенные шаги,
     * выполнен - если все шаги выполнены
     * @param stepsCarousel карусель с шагами тест-кейса
     * @private
     */
    TestingSteps.prototype._showTestCaseStatus = function (stepsCarousel) {

        const $steps = stepsCarousel.find('.js-testing-step');
        const $statusField = stepsCarousel.closest('.card').find('.js-test-case-result');
        const $statusIcon = $statusField.find('.fa');

        $statusField.removeClass('bg-success bg-info bg-danger');
        $statusIcon.removeClass('fa-hourglass-half fa-thumbs-up fa-thumbs-down');

        if ($steps.filter((i, obj) => $(obj).data('status') === this._textFail).length) {
            $statusField.addClass('bg-danger');
            $statusIcon.addClass('fa-thumbs-down');
            this._showNextTestCase(stepsCarousel.closest('.card'));
        } else if ($steps.filter((i, obj) => $(obj).data('status') === this._textSuccess).length === $steps.length) {
            $statusField.addClass('bg-success');
            $statusIcon.addClass('fa-thumbs-up');
            this._showNextTestCase(stepsCarousel.closest('.card'));
        } else {
            $statusField.addClass('bg-info');
            $statusIcon.addClass('fa-hourglass-half');
        }
    };

    /**
     * Скрывает текущий тест-кейс и открывает следующий
     * @param testCaseCard карточка текущего тест-кейса
     * @private
     */
    TestingSteps.prototype._showNextTestCase = function (testCaseCard) {
        testCaseCard
            .find('.collapse').collapse('hide').end()
            .next('.card')
            .find('.collapse').collapse('show');
    };

    TestingSteps.prototype.reDraw = function (entity = null) {
        this.$container.html('');

        this.group = entity && entity.group ? entity.group : null;
        this.testCases = entity ? (entity.group ? entity.sortedTestCases : [entity]) : [];

        if (this.testCases.length) {
            let $accordion = $('<div id="testingStepsAccordion" role="tablist" aria-multiselectable="false"></div>');
            for (let testCase of this.testCases) {
                $accordion.append(this._getTestCaseHTML(testCase, !$accordion.children().length));
            }
            this.$container.append($accordion);

            $('.js-test-case-steps-carousel').carousel({
                ride: false,
                keyboard: true,
                interval: false,
            });
        } else {
            this.$container.append(`<div class="alert alert-info"><i class="fa fa-arrow-left"></i> ${this._msgTestCaseNotSelected}</div>`);
        }

        this.trigger(this._eventNames.changed);
    };

    /**
     * Собирает актуальные данные тестирования по всему тест-кейсу/группе
     * @returns {{testCases: *, group: *, testingResult: {}}}
     */
    TestingSteps.prototype.getData = function () {
        const entireTestingResult = {
            testCases: this.testCases,
            group: this.group,
            testingResult: {}
        };

        $('.js-test-case-steps-carousel').each((i, obj) => {
            let testingResult = {};
            const $carousel = $(obj);
            $carousel.find('.js-testing-step').each((j, obj) => {
                const $step = $(obj);
                testingResult[$step.data('blockCode')] = testingResult[$step.data('blockCode')] || {};
                testingResult[$step.data('blockCode')][$step.data('blockItemPosition')] = {
                    result: $step.data('status'),
                    comment: $step.find('.js-step-result-comment').val()
                }
            });
            entireTestingResult.testingResult[$carousel.data('testCaseId')] = testingResult;
        });

        return entireTestingResult;
    };

    /**
     * Формирует HTML для прохождения по тест-кейсу
     * @param testCase данные тест-кейса
     * @param expanded индикатор указывающий на необходимость отображать блок открытым сразу после инициализации
     * @returns {string}
     * @private
     */
    TestingSteps.prototype._getTestCaseHTML = function (testCase, expanded = false) {
        let stepsHtml = '';
        const steps = this._getAllSteps(testCase);
        const stepsEmptyHtml = `<div class="alert alert-info">${this._msgNoneSteps}</div>`;
        for (let i = 0; i < steps.length; i++) {
            stepsHtml += this._getStepHtml(steps[i], i + 1, steps.length);
        }

        return `
            <div class="card">
                <div class="card-header" role="tab" id="heading${testCase.id}">
                    <div class="clickable row" data-toggle="collapse" data-parent="#testingStepsAccordion" data-target="#collapse${testCase.id}" 
                         aria-expanded="${expanded}" aria-controls="collapse${testCase.id}">
                        <div class="col-sm-9 col-md-10 col-lg-11">${this._getHeaderRowsHtml(testCase)}</div>
                        <div class="col-sm-3 col-md-2 col-lg-1">
                            <div class="js-test-case-result rounded-circle">
                                <i class="fa fa-2x p-3"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="collapse${testCase.id}" class="collapse ${expanded ? 'show' : ''}" role="tabpanel" aria-labelledby="heading${testCase.id}">
                    <div class="card-block">
                        ${this._getNotExecutableBlocksHtml(testCase)}
                        <div class="carousel slide over mt-4 js-test-case-steps-carousel" data-test-case-id="${testCase.id}">
                            <div class="carousel-inner" role="listbox">${stepsHtml || stepsEmptyHtml}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Выделяет из данных тест кейса шаги тестирования, т.е. используются только блоки данных, помеченные как исполняемые (executable
     * @param testCase данные тест-кейса
     * @returns {Array}
     * @private
     */
    TestingSteps.prototype._getAllSteps = function (testCase) {
        let steps = [];

        const blocks = testCase.settings.tests.blocks;
        for (let i = 0; i < blocks.length; i++) {
            const blockParams = blocks[i];
            if (blockParams.executable) {
                const blockValues = testCase.blocksValues[blocks[i].code];
                for (let j = 0; j < blockValues.length; j++) {
                    const rowValues = blockValues[j];
                    steps.push({
                        block: blockParams,
                        values: rowValues,
                        rowInBlockNumber: j,
                        rowsInBlockCount: blockValues.length,
                    });
                }
            }
        }

        return steps;
    };

    /**
     * Генерирует HTML для полей ввода шапки таблицы
     *
     * @param testCaseInfo данные локально-сохраненного тест-кейса, подставляются в поля ввода
     * @returns {string}
     * @private
     */
    TestingSteps.prototype._getHeaderRowsHtml = function (testCaseInfo) {
        const headerParams = testCaseInfo.settings.tests.header;
        let rowsHtml = '';
        for (let rowParam of headerParams.rows) {
            if (rowParam.inInputs) {
                rowsHtml += `
                    <div>
                        <b>${rowParam.name}:</b>
                        ${(testCaseInfo.headerValues && testCaseInfo.headerValues[rowParam.code]) || ''}
                    </div>
                `;
            }
        }

        return `
            <div id="testHeaderRows">${rowsHtml}</div>
        `;
    };

    /**
     * Генерирует HTML для полей ввода шапки таблицы
     *
     * @param testCaseInfo данные локально-сохраненного тест-кейса, подставляются в поля ввода
     * @returns {string}
     * @private
     */
    TestingSteps.prototype._getNotExecutableBlocksHtml = function (testCaseInfo) {
        let html = '';
        for (let blockParams of testCaseInfo.settings.tests.blocks) {
            const values = testCaseInfo.blocksValues[blockParams.code];
            if (!blockParams.executable) {
                html += `
                    <h5 class="text-center">${blockParams.title}</h5>
                    <table class="table table-hover table-sm">
                        ${utils.HtmlGenerator.generateTableForBlock(blockParams, values, testCaseInfo.settings.markdown)}
                    </table>
                `;
            }
        }
        return html;
    };

    /**
     * Генерирует HTML одного шага тестирования
     * @param stepData данные шага тестирования
     * @param stepNumber номер шага
     * @param stepsCount общее количество шагов в тест-кейсе
     * @returns {string}
     * @private
     */
    TestingSteps.prototype._getStepHtml = function (stepData, stepNumber, stepsCount) {
        let blockContent = '';
        for (let columnsParam of stepData.block.columns) {
            if (columnsParam.inInputs) {
                blockContent += `
                    <div>
                         <small><b>${columnsParam.name}:</b></small>
                         ${stepData.values[columnsParam.code]}
                    </div>
                `;
            }
        }

        return `
            <div class="card carousel-item js-testing-step ${stepNumber === 1 ? 'active' : ''}" data-step-number="${stepNumber}"
                 data-block-code="${stepData.block.code}" data-block-item-position="${stepData.rowInBlockNumber}">
                <div class="card-header text-center">
                    <div class="pt-2 d-inline-block"> 
                        ${stepData.block.title} (${stepData.rowInBlockNumber + 1} ${this._textStepFrom} ${stepData.rowsInBlockCount})
                    </div>
                    <div class="btn-group ml-2 float-right" role="group">
                        <div class="btn btn-secondary js-step-result" role="button" data-success="false">
                            <i class="fa fa-thumbs-down"></i> ${this._textFail}
                        </div>
                        <div class="btn btn-secondary js-step-result js-carousel-control" role="button" data-success="true" data-action="next">
                            <i class="fa fa-thumbs-up"></i> ${this._textSuccess}
                        </div>
                        <div class="pt-2 js-step-blocked-text hidden">${this._textStepBlocked}</div>
                    </div>
                </div>
                <div class="card-block">
                    ${blockContent}
                    <textarea class="form-control mt-3 mb-3 js-step-result-comment" placeholder="${this._textComment}"></textarea>
                    
                    <div class="text-center" role="toolbar">
                        <div class="btn btn-secondary js-carousel-control float-left" ${stepNumber === 1 ? 'hidden' : ''}
                             role="button" data-action="prev">
                            <i class="fa fa-arrow-left"></i> ${this._textPreviousStep}
                        </div>
                        <div class="js-step-number p-2 d-inline-block">${this._textStep} ${stepNumber} ${this._textStepFrom} ${stepsCount}</div>
                        <div class="btn btn-secondary js-carousel-control float-right" ${stepNumber === stepsCount ? 'hidden' : ''}
                             role="button" data-action="next">
                            ${this._textNextStep} <i class="fa fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);