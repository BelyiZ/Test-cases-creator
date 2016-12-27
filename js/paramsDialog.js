/**
 * Created by beliy on 27.12.2016.
 */

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
                            <strong>Внимание!</strong> После сохранения все введенные данные на странице будут удалены.
                        </div>
                        <div class="alert alert-info" role="alert">
                            Проверок правильности JSON'a пока никаких нет. Пишите сразу правильно. 
                        </div>
                        <textarea class="form-control js-params">${JSON.stringify(json, null, 4)}</textarea>
                    </div>
                    <div class="modal-footer">
                        <div class="btn btn-secondary" data-dismiss="modal">Отмена</div>
                        <div class="btn btn-primary js-save-btn">Сохранить</div>
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