/** @namespace window.ru.belyiz.patterns.AbstractEntityService */

/**
 * Родительский класс для всех DAO-сервисов
 */
(function (pattern, utils) {
    'use strict';
    AbstractEntityService.prototype = Object.create(pattern.proto);

    utils.Package.declare('ru.belyiz.patterns.AbstractEntityService', {
        extend: function (newService) {
            newService.prototype = Object.create(AbstractEntityService.prototype);
        },

        clazz: AbstractEntityService,
        proto: AbstractEntityService.prototype
    });

    /**
     * @constructor
     *
     * Абстрактный класс-родитель для для всех DAO-сервисов.
     * У каждого дочернего класса должен быть набор базовых методов и полей:
     * type - тип сущности,
     * getEntity() - получение сущности по id
     * saveEntity() - сохранение сущности в базе данных
     * removeEntity() - удаление сущности
     * all() - получение всех сущностей с типом type
     * some() - получение списка сущностей, по списку id
     */
    function AbstractEntityService() {
    }

    AbstractEntityService.prototype.initialize = function () {
        if (!this.type) {
            throw('Поле type должно быть определено в классе, наследуемом от AbstractEntityInfoWidget.');
        }
        if (typeof this.getEntity !== 'function') {
            throw('Функция getEntity() должна быть определена в классе, наследуемом от AbstractEntityInfoWidget.');
        }
        if (typeof this.saveEntity !== 'function') {
            throw('Функция saveEntity() должна быть определена в классе, наследуемом от AbstractEntityInfoWidget.');
        }
        if (typeof this.removeEntity !== 'function') {
            throw('Функция removeEntity() должна быть определена в классе, наследуемом от AbstractEntityInfoWidget.');
        }
        if (typeof this.all !== 'function') {
            throw('Функция all() должна быть определена в классе, наследуемом от AbstractEntityInfoWidget.');
        }
        if (typeof this.some !== 'function') {
            throw('Функция some() должна быть определена в классе, наследуемом от AbstractEntityInfoWidget.');
        }
        return pattern.proto.initialize.call(this);
    };

})(window.ru.belyiz.patterns.Service, window.ru.belyiz.utils);