/**
 * Created by beliy on 21.12.2016.
 */
const $body = $('body');

const $content = $('#content');
const $resultContent = $('#resultContent');
const $resultTable = $('#resultTable');

let params = {
    "headerParams": {
        "used": false,
        "rows": [{"code": "", "colspan": 0, "valueColspan": 0, "width": "", "name": "", "inInputs": false, "inResult": false}]
    },
    "blocks": [{
        "code": "",
        "title": {"text": "", "colspan": 0},
        "cells": [{"code": "", "colspan": 0, "width": "", "name": "", "inInputs": false, "inResult": false}]
    }]
};

$(document).ready(function () {
    $.getJSON('contentParams.json', function (json) {
        params = json;
        $content.html(generatePageContent());
    });

    $body.on('click', '.js-do-magic', function () {
        $resultTable.html('');

        if (params.headerParams.used) {
            for (const rowParam of params.headerParams.rows) {
                if (rowParam.inResult) {
                    $resultTable.append(`
                        <tr>
                            <td width="${rowParam.width}" colspan="${rowParam.colspan}"><b>${rowParam.name}:</b></td>
                            <td colspan="${rowParam.valueColspan}">${getCellValue($('#testHeaderRows'), rowParam.code)}</td>
                        </tr>
                    `);
                }
            }
        }
        for (let block of params.blocks) {
            addItemsToResultTable(block);
        }
        $resultContent.show();
    });

    $body.on('click', '.js-add-item', function (e) {
        const $target = $(e.currentTarget);
        const blockCode = $target.data('blockCode');
        for (let blockParams of params.blocks) {
            if (blockParams.code === blockCode) {
                appendItem(blockParams);
            }
        }
    });

    $body.on('click', '.js-remove-item', function (e) {
        $(e.currentTarget).closest('tr').remove();
    });

    $body.on('keyup', 'textarea', function (e) {
        resizeTextArea(e.currentTarget);
    });

    $body.on('click', '.js-settings-button', function () {
        showParamsDialog('Редактирование параметров', params, function (json) {
            params = json;
            $content.html(generatePageContent());
        })
    });

    $body.on('click', '.js-download-xls', function () {
        tableToExcel('stepsTable', 'name', 'myfile.xls');
    })
});

/**
 * Generate inputs part of page relative to params
 * @returns {string} generated html
 */
function generatePageContent() {
    let content = '';
    content += generateTestHeaderRows();
    for (let blockParams of params.blocks) {
        content += generateBlockTable(blockParams);
    }
    return content;
}

/**
 * Generate fields for test general information. It will be used in header of result table.
 * @returns {string} generated html
 */
function generateTestHeaderRows() {
    let result = `
        <div>
            <b>ШАПКА ТАБЛИЦЫ</b>
        </div>
        <br>
        <div id="testHeaderRows">
    `;
    for (const rowParam of params.headerParams.rows) {
        if (rowParam.inInputs) {
            result += `
                <div class="form-group row">
                    <label class="col-sm-2 col-form-label text-sm-right">${rowParam.name}:</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" data-cell-code="${rowParam.code}"/>
                    </div>
                </div>
            `;
        }
    }
    return result + '</div>';
}

/**
 * Generate content block html
 * @param blockParams
 * @returns {string} generated html
 */
function generateBlockTable(blockParams) {
    return `
        <table class="table">
            <tbody id="${blockParams.code}">
                <tr>
                    <th colspan="100%" class="text-sm-center">${blockParams.title.text.toUpperCase()}</th>
                </tr>
            </tbody>
        </table>
        <div class="text-sm-right">
            <button type="button" class="btn btn-secondary margin-bottom-25 js-add-item" 
                    data-block-code="${blockParams.code}">
                        <i class="fa fa-plus"></i>
                        Добавить элемент
            </button>
        </div>  
    `;
}

/**
 * Add new row with inputs in target table.
 * @param blockParams block params
 */
function appendItem(blockParams) {
    const $itemsTable = $(`#${blockParams.code}`);

    let rowContent = '';
    for (const cellParam of blockParams.cells) {
        if (cellParam.inInputs) {
            rowContent += `
                <td width="${cellParam.width || ''}">
                    <textarea data-cell-code="${cellParam.code || ''}" class="form-control" placeholder="${cellParam.name || ''}"></textarea>
                </td>
            `;
        }
    }
    $itemsTable.append(`\
        <tr class="js-item">
            ${rowContent}\
            <td width="1%"><i class="fa fa-remove clickable remove-icon js-remove-item"></i></td>\
        </tr>\
    `);
}

/**
 * Calculate textarea height by included content
 * @param element textarea DOM-element
 */
function resizeTextArea(element) {
    element.style.height = '5px';
    element.style.height = (element.scrollHeight) + 'px';
    element.blur();
    element.focus()
}

/**
 * Get cell value by container and cell code
 * @param $container container includes target cell
 * @param code code of target cell
 * @returns {string} cell value or empty string
 */
function getCellValue($container, code) {
    return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
}

/**
 * Add block of items (such as preconditions or steps) into the result table
 * @param blockParams inserting params
 */
function addItemsToResultTable(blockParams) {
    const $itemsTable = $(`#${blockParams.code}`);

    // append block title row
    $resultTable.append(`
        <tr>
            <td colspan="${blockParams.title.colspan}">
                <br>
                <b>${blockParams.title.text}:</b>
            </td>
        </tr>
    `);

    // append columns titles block
    let titleRowContent = '';
    for (const cellParam of blockParams.cells) {
        titleRowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width || ''}">${cellParam.name}</td>`
    }
    $resultTable.append(`<tr>${titleRowContent}</tr>`);

    // append content
    let rowNum = 1;
    for (const item of $itemsTable.find('.js-item')) {
        const $item = $(item);
        if (checkRowHasData($item)) {
            let rowContent = '';
            for (const cellParam of blockParams.cells) {
                if (cellParam.inResult) {
                    rowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width}">
                                       ${cellParam.isOrderNumber ? rowNum : getCellValue($item, cellParam.code)}
                                   </td>`;
                }
            }
            $resultTable.append(`<tr>${rowContent}</tr>`);
        }
        rowNum++;
    }
}

/**
 * Check source row contains data or empty
 * @param $row target row
 * @returns {boolean} true if contains data, else otherwise
 */
function checkRowHasData($row) {
    for (let textarea of $row.find('textarea')) {
        if ($(textarea).val()) {
            return true;
        }
    }
    return false;
}

/**
 * Create and show dialog for editing params
 * @param title title of dialog
 * @param json current params json
 * @param onSave on save button click callback
 */
function showParamsDialog(title, json, onSave) {
    const html = `
        <div class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog  modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title">${title}</h4>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning" role="alert">
                            <strong>Внимание!</strong> После сохранения все данные из таблицы будут удалены.
                        </div>
                        <div class="alert alert-info" role="alert">
                            Проверок правильности JSON'a пока никаких нет. Пишите сразу правильно. 
                        </div>
                        <textarea class="form-control js-params">${JSON.stringify(json, null, 4)}</textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary js-save-btn">Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    const $modal = $(html);
    const $paramsArea = $modal.find('textarea.js-params');
    $modal.on('click', '.js-save-btn', function () {
        onSave(JSON.parse($paramsArea.val()));
        $modal.modal('hide');
    });
    $modal.on('hidden.bs.modal', function () {
        $modal.remove();
    });
    $modal.on('shown.bs.modal', function () {
        resizeTextArea($paramsArea[0]);
    });
    $modal.modal('show');
}