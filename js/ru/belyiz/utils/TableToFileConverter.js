/** @namespace window.ru.belyiz.utils.TableToFileConverter */
(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.TableToFileConverter', new TableToFileConverter());

    /**
     * @constructor
     */
    function TableToFileConverter() {
        global.nodes.body.append('<a id="downloadLink" style="display:none;"></a>');
    }

    //noinspection XmlUnusedNamespaceDeclaration
    TableToFileConverter.prototype._templates = {
        'DOC': {
            uri: 'data:application/msword;base64,',
            html: `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                      xmlns:w="urn:schemas-microsoft-com:office:word"
                      xmlns="http://www.w3.org/TR/REC-html40">
                    <head>
                        <!--[if gte mso 9]>
                            <xml>
                                <w:WordDocument>
                                </w:WordDocument>
                            </xml>
                        <![endif]-->
                    </head>
                    <body>
                        <table border="1" cellpadding="5"
                               style='border-collapse:collapse; border:none; mso-border-alt:solid windowtext .5pt;'>
                           {table}
                        </table>
                    </body>
                </html>
            `,
        },

        'XLS': {
            uri: 'data:application/vnd.ms-excel;base64,',
            html: `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                      xmlns:x="urn:schemas-microsoft-com:office:excel"
                      xmlns="http://www.w3.org/TR/REC-html40">
                    <head>
                        <!--[if gte mso 9]>
                            <xml>
                                <x:ExcelWorkbook>
                                    <x:ExcelWorksheets>
                                        <x:ExcelWorksheet>
                                            <x:WorksheetOptions>
                                                <x:DisplayGridlines/>
                                            </x:WorksheetOptions>
                                        </x:ExcelWorksheet>
                                    </x:ExcelWorksheets>
                                </x:ExcelWorkbook>
                            </xml>
                        <![endif]-->
                    </head>
                    <body>
                        <table>{table}</table>
                    </body>
                </html>
            `,
        }
    };

    TableToFileConverter.prototype.convert = function (table, filename, type) {
        const template = this._templates[type.toUpperCase()];
        if (!template) {
            throw new TypeError(`Can't find parameters for type [${type}]`);
        }
        document.getElementById("downloadLink").href = template.uri + this._base64(this._format(template.html, {table: $(table).html()}));
        document.getElementById("downloadLink").download = filename + '.' + type.toLowerCase();
        document.getElementById("downloadLink").click();
    };

    TableToFileConverter.prototype._base64 = function (s) {
        return global.btoa(unescape(encodeURIComponent(s)))
    };

    TableToFileConverter.prototype._format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
        })
    };

})(window, window.ru.belyiz.utils);