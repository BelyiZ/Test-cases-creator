/**
 * JavaScript "classes" packages manager
 */
window.ru.belyiz.utils.Package = (function (global) {
    'use strict';

    return {
        declare: function (namespace, constructor) {
            let names = namespace.split('.'),
                currentObject = global,
                name, newObject;

            for (let i = 0, len = names.length; i < len; i++) {
                name = names[i].trim();
                newObject = currentObject[name] || {};
                currentObject[name] = constructor && i === len - 1 ? constructor : newObject;
                currentObject = newObject;
            }

            return currentObject;
        }
    };

})(window);