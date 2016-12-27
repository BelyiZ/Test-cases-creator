/**
 * Created by beliy on 21.12.2016.
 */

(function () {
    const
        $body = $('body'),
        $content = $('#content'),
        $resultContent = $('#resultContent'),
        $resultTable = $('#resultTable');

    const db = new PouchDB('testCases');

    let currentParams = {
            "headerParams": {
                "used": false,
                "rows": [{"code": "", "colspan": 0, "valueColspan": 0, "width": "", "name": "", "inInputs": false, "inResult": false}]
            },
            "blocks": [{
                "code": "",
                "title": {"text": "", "colspan": 0},
                "cells": [{"code": "", "colspan": 0, "width": "", "name": "", "inInputs": false, "inResult": false, "isOrderNumber": false}]
            }]
        },

        currentTestCase = {
            headerValues: {"[rowCode]": "[value]"},
            blocksValues: {"[blockCode]": [{"[cellCode]": "[value]"}]}
        };

    const
        appendItem = function (blockParams, values) {
            const $itemsTable = $(`#${blockParams.code}`);

            let rowContent = '';
            for (let cellParam of blockParams.cells) {
                if (cellParam.inInputs) {
                    rowContent += `
                        <td width="${cellParam.width || ''}">
                            <textarea data-cell-code="${cellParam.code || ''}" class="form-control" 
                                      placeholder="${cellParam.name || ''}">${values && values[cellParam.code] || ''}</textarea>
                        </td>
                    `;
                }
            }
            $itemsTable.append(`
                <tr class="js-item draggable">
                    <td width="1%"><i class="fa fa-arrows-v big-icon margin-top-10"></i></td>
                    ${rowContent}
                    <td width="1%"><i class="fa fa-remove clickable big-icon margin-top-10 js-remove-item"></i></td>
                </tr>
            `);
        },

        rebuildPageContent = function (clean) {
            $content.html(generatePageContent(currentParams, clean ? '' : currentTestCase));
            $resultContent.hide();
            for (let blockParams of currentParams.blocks) {
                if (currentTestCase && currentTestCase.blocksValues && currentTestCase.blocksValues[blockParams.code]) {
                    for (let rowValues of currentTestCase.blocksValues[blockParams.code]) {
                        appendItem(blockParams, rowValues);
                    }
                }
            }
            $('.js-input-data-table').sortable({
                items: ">.draggable"
            });
        },

        saveParams = function (newParams) {
            newParams._id = 'params';
            if (currentParams._rev) {
                newParams._rev = currentParams._rev;
            }
            db.post(newParams)
                .then(function (response) {
                    currentParams = newParams;
                    currentParams._rev = response.rev;
                    rebuildPageContent(true);
                })
                .catch(function (err) {
                    console.log(err);
                });
        },

        initParams = function () {
            db.get('params')
                .then(function (params) {
                    currentParams = params;
                    rebuildPageContent();
                })
                .catch(function (err) {
                    if (err.status === 404) {
                        $.getJSON('contentParams.json', function (json) {
                            saveParams(json);
                        });
                    }
                    console.log(err);
                });
        };


    $(document).ready(function () {
        initParams();

        $body.on('click', '.js-do-magic', function () {
            const result = generateResult(currentParams);
            currentTestCase = result.testCase;
            $resultTable.html(result.html);
            $resultContent.show();
        });

        $body.on('click', '.js-add-item', function (e) {
            const $target = $(e.currentTarget);
            const blockCode = $target.data('blockCode');
            for (let blockParams of currentParams.blocks) {
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

        $body.on('keyup paste change', 'textarea,input', function () {
            $resultTable.html('');
            $resultContent.hide();
        });

        $body.on('click', '.js-settings-button', function () {
            let json = $.extend(true, {}, currentParams);
            delete json._id;
            delete json._rev;
            showParamsDialog('Редактирование параметров', json, saveParams);
        });

        $body.on('click', '.js-download-xls', function () {
            convertToFile($resultTable, 'testCases', 'xls');
        });

        $body.on('click', '.js-download-doc', function () {
            convertToFile($resultTable, 'testCases', 'doc');
        });

        $body.on('click', '.js-save-in-db', function () {
            db.post(currentTestCase).then(function (response) {
                console.log(JSON.stringify(response));
            });
        });
    });
})();

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