/**
 * Created by beliy on 21.12.2016.
 */
const $body = $('body');

const $testHeaderRows = $('#testHeaderRows');
const $preconditionsTable = $('#preconditionsTable');
const $stepsTable = $('#stepsTable');
const $postconditionsTable = $('#postconditionsTable');

const $resultTable = $('#resultTable');

let headerParams = {
    rows: [
        {code: 'name', colspan: 2, width: '1%', name: 'Название', inInputs: true, inResult: true},
        {code: 'code', colspan: 2, width: '1%', name: 'Код', inInputs: true, inResult: true},
        {code: 'description', colspan: 2, width: '1%', name: 'Описание', inInputs: true, inResult: true},
    ]
};

let preconditionsTableParams = {
    cells: [
        {code: 'number', colspan: 1, width: '1%', name: '№', isOrderNumber: true, inInputs: false, inResult: true},
        // {code: 'code', colspan: 1, width: '15%', name: 'Код', inInputs: true, inResult: true},
        {code: 'name', colspan: '100%', width: '90%', name: 'Описание', inInputs: true, inResult: true}
    ]
};

let stepsTableParams = {
    cells: [
        {code: 'number', colspan: 1, width: '1%', name: '№', isOrderNumber: true, inInputs: false, inResult: true},
        {code: 'code', colspan: 1, width: '10%', name: 'Код', inInputs: true, inResult: true},
        {code: 'name', colspan: 2, width: '30%', name: 'Действие', inInputs: true, inResult: true},
        {code: 'expected', colspan: 2, width: '30%', name: 'Ожидаемый результат', inInputs: true, inResult: true},
        {code: 'result', colspan: '100%', width: '', name: 'Фактический результат', inInputs: false, inResult: true}
    ]
};

let postconditionsTableParams = {
    cells: [
        {code: 'number', colspan: 1, width: '1%', name: '№', isOrderNumber: true, inInputs: false, inResult: true},
        // {code: 'code', colspan: 1, width: '15%', name: 'Код', inInputs: true, inResult: true},
        {code: 'name', colspan: '100%', width: '90%', name: 'Описание', inInputs: true, inResult: true}
    ]
};

$(document).ready(function () {
    generateTestHeaderRows();

    $body.on('click', '.js-do-magic', function () {
        $resultTable.html('');

        for (const rowParam of headerParams.rows) {
            if (rowParam.inResult) {
                $resultTable.append(`
                    <tr>
                        <td width="${rowParam.width || ''}" colspan="${rowParam.colspan || ''}"><b>${rowParam.name}:</b></td>
                        <td colspan="100%">${getCellValue($testHeaderRows, rowParam.code)}</td>
                    </tr>
                `);
            }
        }

        if (preconditionsTableParams.cells && preconditionsTableParams.cells.length) {
            $resultTable.append('<tr><td colspan="100%"><br><b>Предусловия:</b></td></tr>');
            addItemsToResultTable($preconditionsTable, preconditionsTableParams);
        }

        if (stepsTableParams.cells && stepsTableParams.cells.length) {
            $resultTable.append('<tr><td colspan="100%"><br><b>Шаги теста:</b></td></tr>');
            addItemsToResultTable($stepsTable, stepsTableParams);
        }

        if (postconditionsTableParams.cells && postconditionsTableParams.cells.length) {
            $resultTable.append('<tr><td colspan="100%"><br><b>Постусловия:</b></td></tr>');
            addItemsToResultTable($postconditionsTable, postconditionsTableParams);
        }
    });

    $body.on('click', '.js-remove-item', function (e) {
        $(e.currentTarget).closest('tr').remove();
    });

    $body.on('keyup', 'textarea', function (e) {
        resizeTextArea(e.currentTarget);
    });

    $body.on('click', '.js-add-precondition', function () {
        appendRow($preconditionsTable, preconditionsTableParams);
    });

    $body.on('click', '.js-add-step', function () {
        appendRow($stepsTable, stepsTableParams);
    });

    $body.on('click', '.js-add-postcondition', function () {
        appendRow($postconditionsTable, postconditionsTableParams);
    });

    $body.on('click', '.js-edit-header-params', function () {
        showParamsDialog('Редактирование параметров таблицы предусловий', headerParams, function (json) {
            headerParams = json;
            generateTestHeaderRows();
        })
    });
    $body.on('click', '.js-edit-preconditions-params', function () {
        showParamsDialog('Редактирование параметров таблицы предусловий', preconditionsTableParams, function (json) {
            preconditionsTableParams = json;
            $preconditionsTable.find('.js-item').remove();
        })
    });
    $body.on('click', '.js-edit-steps-params', function () {
        showParamsDialog('Редактирование параметров таблицы шагов', stepsTableParams, function (json) {
            stepsTableParams = json;
            $stepsTable.find('.js-item').remove();
        })
    });
    $body.on('click', '.js-edit-postconditions-params', function () {
        showParamsDialog('Редактирование параметров таблицы постусловий', postconditionsTableParams, function (json) {
            postconditionsTableParams = json;
            $postconditionsTable.find('.js-item').remove();
        })
    })
});

/**
 * Generate fields for test general information. It will be used in header of result table.
 */
function generateTestHeaderRows() {
    $testHeaderRows.html('');
    for (const rowParam of headerParams.rows) {
        if (rowParam.inInputs) {
            $testHeaderRows.append(`
                <div class="form-group row">
                    <label class="col-sm-2 col-form-label text-sm-right">${rowParam.name}:</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" data-cell-code="${rowParam.code}"/>
                    </div>
                </div>
            `);
        }
    }
}

/**
 * Add new row with inputs in target table.
 * @param $table table to add row
 * @param params row params
 */
function appendRow($table, params) {
    let rowContent = '';
    for (const cellParam of params.cells) {
        if (cellParam.inInputs) {
            rowContent += `
                <td width="${cellParam.width || ''}">
                    <textarea data-cell-code="${cellParam.code || ''}" class="form-control" placeholder="${cellParam.name || ''}"></textarea>
                </td>
            `;
        }
    }
    $table.append(`\
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
    element.style.height = (element.scrollHeight) + 'px';
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
 * @param $itemsTable source table with item's data
 * @param params inserting params
 */
function addItemsToResultTable($itemsTable, params) {
    let rowContent = '';
    for (const cellParam of params.cells) {
        rowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width || ''}">${cellParam.name}</td>`
    }
    $resultTable.append(`<tr>${rowContent}</tr>`);

    let rowNum = 1;
    for (const item of $itemsTable.find('.js-item')) {
        const $item = $(item);
        if (checkRowHasData($item)) {
            let rowContent = '';
            for (const cellParam of params.cells) {
                if (cellParam.inResult) {
                    if (cellParam.isOrderNumber) {
                        rowContent += `<td colspan="1" width="1%">${rowNum}</td>`;
                    } else {
                        rowContent += `<td colspan="${cellParam.colspan}" width="${cellParam.width || ''}">
                                           ${getCellValue($item, cellParam.code)}
                                       </td>`
                    }
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