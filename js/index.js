/**
 * Created by beliy on 21.12.2016.
 */
const $body = $('body');

const $preconditionsTable = $('#preconditionsTable');
const $stepsTable = $('#stepsTable');
const $postconditionsTable = $('#postconditionsTable');

const $name = $('.js-test-name');
const $function = $('.js-text-function');

const $resultTable = $('#resultTable');

const preconditionsTableParams = {
    cells: [
        {className: 'js-number', colspan: 1, width: '1%', name: '№', isOrderNumber: true, inInputs: false, inResult: true},
        // {className: 'js-code', colspan: 1, width: '15%', name: 'Код', inInputs: true, inResult: true},
        {className: 'js-name', colspan: '100%', width: '90%', name: 'Описание', inInputs: true, inResult: true}
    ]
};

const stepsTableParams = {
    cells: [
        {className: 'js-number', colspan: 1, width: '1%', name: '№', isOrderNumber: true, inInputs: false, inResult: true},
        {className: 'js-code', colspan: 1, width: '10%', name: 'Код', inInputs: true, inResult: true},
        {className: 'js-name', colspan: 2, width: '30%', name: 'Действие', inInputs: true, inResult: true},
        {className: 'js-expected', colspan: 2, width: '30%', name: 'Ожидаемый результат', inInputs: true, inResult: true},
        {className: 'js-result', colspan: '100%', width: '', name: 'Фактический результат', inInputs: false, inResult: true}
    ]
};

const postconditionsTableParams = {
    cells: [
        {className: 'js-number', colspan: 1, width: '1%', name: '№', isOrderNumber: true, inInputs: false, inResult: true},
        // {className: 'js-code', colspan: 1, width: '15%', name: 'Код', inInputs: true, inResult: true},
        {className: 'js-name', colspan: '100%', width: '90%', name: 'Описание', inInputs: true, inResult: true}
    ]
};

$(document).ready(function () {

    $body.on('click', '.js-do-magic', function () {
        $resultTable.html('');

        $resultTable.append(`<tr>
                                <td width="1%" colspan="2"><b>Название:</b></td>
                                <td colspan="100%">${$name.val()}</td>
                            </tr>`);
        $resultTable.append(`<tr>
                                <td width="1%" colspan="2"><b>Функция:</b></td>
                                <td colspan="100%">${$function.val()}</td>
                            </tr>`);

        $resultTable.append('<tr><td colspan="100%"><br><b>Предусловия:</b></td></tr>');
        addItemsToResultTable($preconditionsTable, preconditionsTableParams);

        $resultTable.append('<tr><td colspan="100%"><br><b>Шаги теста:</b></td></tr>');
        addItemsToResultTable($stepsTable, stepsTableParams);

        $resultTable.append('<tr><td colspan="100%"><br><b>Постусловия:</b></td></tr>');
        addItemsToResultTable($postconditionsTable, postconditionsTableParams);
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
});

function appendRow($table, params) {
    let rowContent = '';
    for (const cellParam of params.cells) {
        if (cellParam.inInputs) {
            rowContent += buildRowWithTextArea(cellParam.className, cellParam.name, cellParam.width);
        }
    }
    $table.append(`\
        <tr class="js-item">
            ${rowContent}\
            <td width="1%"><span class="remove-icon js-remove-item">x</span></td>\
        </tr>\
    `);
}

function buildRowWithTextArea(areaClass, placeholder, tdWidth) {
    return `<td width="${tdWidth || ''}">
                <textarea class="${areaClass || ''} form-control" placeholder="${placeholder || ''}"></textarea>
            </td>`;
}

function resizeTextArea(element) {
    element.style.height = '5px';
    element.style.height = (element.scrollHeight) + 'px';
}

function addItemsToResultTable($itemsTable, params) {
    const getCellValue = function ($row, cellClass) {
        return ($row.find(`.${cellClass}`).val() || '').trim();
    };

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
                                           ${getCellValue($item, cellParam.className)}
                                       </td>`
                    }
                }
            }
            $resultTable.append(`<tr>${rowContent}</tr>`);
        }
        rowNum++;
    }
}

function checkRowHasData($row) {
    for (let textarea of $row.find('textarea')) {
        if ($(textarea).val()) {
            return true;
        }
    }
    return false;
}