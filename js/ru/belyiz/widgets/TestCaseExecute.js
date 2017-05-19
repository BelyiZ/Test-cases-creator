/** @namespace window.ru.belyiz.widgets.TestCaseExecute */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestCaseExecute', TestCaseExecute);
    Pattern.extend(TestCaseExecute);

    /**
     * @constructor
     */
    function TestCaseExecute(setup) {
        setup = setup || {};

        this.$container = $(setup.container);
        this.testCasesService = setup.entityService;

        this.$carousel = null;

        this.testCaseInfo = '';

        this._msgMergeConflict = 'Данные на сервере изменились. ';
        this._msgTestCaseNotSelected = 'Выберите тест кейс или группу в списке слева';
        this._msgNoneSteps = 'Не создано ни одного шага';
        this._textComment = 'Комментарий';
        this._textSuccess = 'Выполнен';
        this._textFail = 'Провален';
        this._textPreviousStep = 'Предыдущий шаг';
        this._textNextStep = 'Следующий шаг';
        this._textStep = 'Шаг';
        this._textStepFrom = 'из';


        this._eventHandlers = {};
        this._eventNames = {
            changed: 'changed',
        };
    }

    TestCaseExecute.prototype._createWidgets = function () {
        this.testCaseGroupsWidget = new widgets.TestCaseGroups({containerId: 'testCaseGroupsContainer'}).initialize();
    };

    TestCaseExecute.prototype._bindEvents = function () {
        this.$container.on('click', '.js-carousel-control', this._events.onCarouselControlClick.bind(this));
        this.$container.on('click', '.js-step-result', this._events.onStepResultClick.bind(this));
        this.$container.on('change', '.js-step-result-comment', this._events.onStepResultCommentChanged.bind(this));
    };

    TestCaseExecute.prototype._events = {
        onCarouselControlClick: function (e) {
            if (!this.$carousel) {
                return;
            }
            const $target = $(e.currentTarget);
            const action = $target.data('action');
            const $activeSlide = this.$carousel.find('.js-testing-step.active');
            if (action === 'prev' && $activeSlide.is(':first-child') ||
                action === 'next' && $activeSlide.is(':last-child')) {
                return;
            }

            this.$carousel && this.$carousel.carousel(action);
        },

        onStepResultClick: function (e) {
            const $target = $(e.currentTarget);
            const success = $target.data('success');

            $target.closest('.js-testing-step').data('success', success ? this._textSuccess : this._textFail);

            $target
                .addClass(success ? 'btn-success' : 'btn-danger')
                .siblings('.js-step-result')
                .removeClass('btn-success btn-danger')
                .addClass('btn-secondary');

            this.trigger(this._eventNames.changed);
        },

        onStepResultCommentChanged: function () {
            this.trigger(this._eventNames.changed);
        }
    };

    TestCaseExecute.prototype.reDraw = function (testCaseInfo) {
        this.$container.html('');

        if (testCaseInfo && testCaseInfo.id) {
            this.testCaseInfo = testCaseInfo;

            this.$container.append(this._getHeaderRowsHtml(testCaseInfo.settings.headerParams, testCaseInfo));

            const steps = this._getAllSteps(testCaseInfo);

            let stepsHtml = '';
            const noneStepsHtml = `<div class="alert alert-info">${this._msgNoneSteps}</div>`;
            for (let i = 0; i < steps.length; i++) {
                stepsHtml += this._getStepHtml(steps[i], i + 1, steps.length);
            }

            this.$container.append(`
                <div id="testExecutingStepsCarousel" class="carousel slide over mt-4 mb-5">
                    <div class="carousel-inner" role="listbox">${stepsHtml || noneStepsHtml}</div>
                </div>
            `);

            this.$carousel = $('#testExecutingStepsCarousel').carousel({
                ride: false,
                keyboard: true,
                interval: false,
            });

            this.trigger(this._eventNames.changed);
        } else {
            this.$container.append(`<div class="alert alert-info"><i class="fa fa-arrow-left"></i> ${this._msgTestCaseNotSelected}</div>`);
        }
    };

    TestCaseExecute.prototype.getData = function () {
        let testingResult = {};

        $('.js-testing-step').each((i, obj) => {
            const $step = $(obj);
            testingResult[$step.data('blockCode')] = testingResult[$step.data('blockCode')] || {};
            testingResult[$step.data('blockCode')][$step.data('blockItemPosition')] = {
                result: $step.data('success'),
                comment: $step.find('.js-step-result-comment').val()
            }
        });

        return {
            testCaseInfo: this.testCaseInfo,
            testingResult: testingResult
        }
    };


    TestCaseExecute.prototype._getAllSteps = function (testCaseInfo) {
        let steps = [];

        const blocks = testCaseInfo.settings.blocks;
        for (let i = 0; i < blocks.length; i++) {
            const blockValues = testCaseInfo.blocksValues[blocks[i].code];
            for (let j = 0; j < blockValues.length; j++) {
                const rowValues = blockValues[j];
                steps.push({
                    block: blocks[i],
                    values: rowValues,
                    rowInBlockNumber: j,
                    rowsInBlockCount: blockValues.length,
                });
            }
        }

        return steps;
    };

    /**
     * Генерирует HTML для полей ввода шапки таблицы
     *
     * @param headerParams параметры полей ввода шапки таблицы
     * @param testCaseInfo данные локально-сохраненного тест-кейса, подставляются в поля ввода
     * @returns {string}
     * @private
     */
    TestCaseExecute.prototype._getHeaderRowsHtml = function (headerParams, testCaseInfo) {
        testCaseInfo = testCaseInfo || {};
        let rowsHtml = '';
        for (let rowParam of headerParams.rows) {
            if (rowParam.inInputs) {
                rowsHtml += `
                    <div class="mb-2">
                        <small><b>${rowParam.name}:</b></small>
                        ${(testCaseInfo.headerValues && testCaseInfo.headerValues[rowParam.code]) || ''}
                    </div>
                `;
            }
        }

        return `
            <div id="testHeaderRows">${rowsHtml}</div>
        `;
    };

    TestCaseExecute.prototype._getStepHtml = function (stepData, stepNumber, stepsCount) {
        let blockContent = '';
        for (let cellParam of stepData.block.cells) {
            if (cellParam.inInputs) {
                blockContent += `
                    <div>
                         <small><b>${cellParam.name}:</b></small>
                         ${stepData.values[cellParam.code]}
                    </div>
                `;
            }
        }

        return `
            <div class="card carousel-item js-testing-step ${stepNumber === 1 ? 'active' : ''}" 
                 data-block-code="${stepData.block.code}" data-block-item-position="${stepData.rowInBlockNumber}">
                <div class="card-header text-center">
                    <div class="p-2 d-inline-block"> 
                        ${stepData.block.title.text} (${stepData.rowInBlockNumber + 1} ${this._textStepFrom} ${stepData.rowsInBlockCount})
                    </div>
                    <div class="btn-group ml-2 float-right" role="group">
                        <div class="btn btn-secondary js-step-result js-carousel-control" role="button" data-success="false" data-action="next">
                            <i class="fa fa-thumbs-down"></i> ${this._textFail}
                        </div>
                        <div class="btn btn-secondary js-step-result js-carousel-control" role="button" data-success="true" data-action="next">
                            <i class="fa fa-thumbs-up"></i> ${this._textSuccess}
                        </div>
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