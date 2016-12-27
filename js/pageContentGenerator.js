/**
 * Created by beliy on 27.12.2016.
 */

const generatePageContent = (function () {

    const
        getHeaderRowsHtml = function (headerParams, testCase) {
            if (headerParams.used) {
                let rowsHtml = '';
                for (let rowParam of headerParams.rows) {
                    if (rowParam.inInputs) {
                        rowsHtml += `
                            <div class="form-group row">
                                <label class="col-sm-2 col-form-label text-sm-right">${rowParam.name}:</label>
                                <di class="col-sm-10">
                                    <input type="text" class="form-control" data-cell-code="${rowParam.code}"
                                           value="${testCase && testCase.headerValues[rowParam.code] || ''}"/>
                                </di>
                            </div>
                        `;
                    }
                }

                return `
                    <div>
                        <b>ШАПКА ТАБЛИЦЫ</b>
                    </div>
                    <br>
                    <div id="testHeaderRows">${rowsHtml}</div>
                `;

            } else {
                return '';
            }
        },

        getBlocksHtml = function (blockParams) {
            return `
                <table class="table">
                    <tbody id="${blockParams.code}" class="js-input-data-table">
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
        };

    return function (params, testCase) {
        let html = '';
        html += getHeaderRowsHtml(params.headerParams, testCase);
        for (let blockParams of params.blocks) {
            html += getBlocksHtml(blockParams);
        }

        return html;
    }
})();
