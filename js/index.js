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

$(document).ready(function () {

    $body.on('click', '.js-do-magic', function () {
        $resultTable.html('');

        $resultTable.append('<tr><td width="1%" colspan="1"><b>Название:</b></td><td colspan="5">' + $name.val() + '</td></tr>');
        $resultTable.append('<tr><td width="1%" colspan="1"><b>Функция:</b></td><td colspan="5">' + $function.val() + '</td></tr>');
        $resultTable.append('\
            <tr>\
                <td width="33%" colspan="2"><b>Действие</b></td>\
                <td width="33%" colspan="2"><b>Ожидаемый результат</b></td>\
                <td width="33%" colspan="2">\
                    <b>Результат теста:</b>\
                    <ul>\
                        <li>пройден</li>\
                        <li>провален</li>\
                        <li>заблокирован</li>\
                    </ul>\
                </td>\
            </tr>\
        ');

        $resultTable.append('<tr><td colspan="6"><br><b>Предусловия:</b></td></tr>');
        addItemsToResultTable($preconditionsTable);

        $resultTable.append('<tr><td colspan="6"><br><b>Шаги теста:</b></td></tr>');
        addItemsToResultTable($stepsTable);

        $resultTable.append('<tr><td colspan="6"><br><b>Постусловия:</b></td></tr>');
        addItemsToResultTable($postconditionsTable);
    });

    $body.on('click', '.js-remove-item', function (e) {
        $(e.currentTarget).closest('tr').remove();
    });

    $body.on('keyup', 'textarea', function (e) {
        auto_grow(e.currentTarget);
    });

    $body.on('click', '.js-add-precondition', function () {
        appendRow($preconditionsTable, false);
    });
    $body.on('click', '.js-add-step', function () {
        appendRow($stepsTable, true);
    });
    $body.on('click', '.js-add-postcondition', function () {
        appendRow($postconditionsTable, false);
    });
});

function appendRow($table, withResult) {
    const resultcolumn = withResult ? '<td><textarea class="js-result form-control" placeholder="Результат теста"></textarea></td>' : '';
    $table.append('\
        <tr class="js-item">\
            <td><textarea class="js-name form-control" placeholder="Действие"></textarea></td>\
            <td><textarea class="js-expected form-control" placeholder="Ожидаемый результат"></textarea></td>\
            ' + resultcolumn + '\
            <td><span class="remove-icon js-remove-item">x</span></td>\
        </tr>\
    ');
}

function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
}

function addItemsToResultTable($itemsTable) {
    for (const item of $itemsTable.find('.js-item')) {
        const $item = $(item);
        const name = ($item.find('.js-name').val() || '').trim();
        const expected = ($item.find('.js-expected').val() || '').trim();
        const result = ($item.find('.js-result').val() || '').trim();

        if (name || expected || result) {
            $resultTable.append('\
                <tr>\
                    <td colspan="2">' + name + '</td>\
                    <td colspan="2">' + expected + '</td>\
                    <td colspan="2">' + result + '</td>\
                </tr>\
            ');
        }
    }
}