# Test-cases-creator
Генератор документации тест-кейсов.


Для настройки полей пока используется JSON-формат. В дальнейшем планируется сделать интерфейс.
## Описание полей JSON

```
{
    "markdown": true, --- индикатор использования MarkDown в полях ввода. 
                          Эксперименталная функция, работа при экспорте в .xls и .doc не гарантируется

    "headerParams": {                   --- настройка шапки таблицы тест-кейса
        "rows": [                       --- настройка строк в шапке таблицы
            {
                "code": "description",  --- уникальный в рамках всех элементов массива "rows" код поля. 
                                            Нигде не выводится. Используется для служебных целей
                "colspan": 2,           --- количество колонок объединенных в одну для названия поля.
                                            Может быть числом или процентами, например, 6 или '100%'.
                "valueColspan": 5,      --- количество колонок объединенных в одну для значения поля. 
                                            Может быть числом или процентами, например, 6 или '100%'.
                "width": "1%",          --- ширина колонки в процентах
                "name": "Описание",     --- текст-название поля
                "inInputs": true,       --- индикатор необходимости отображения в блоке ввода данных
                "inResult": true        --- индикатор необходимости отображения в результирующей таблице
            }
        ]
    },

    "blocks": [ --- настройка информационных блоков
        {
            "code": "preconditions",      --- уникальный в рамках всех элементов массива "blocks" код поля.
                                              Нигде не выводится. Используется для служебных целей
            "title": {                    --- настройка отображения заголовка поля
                "text": "Предусловия",    --- текст заголовк поля
                "colspan": 7              --- количество колонок для отображения заголовка. 
                                              Может быть числом или процентами, например, 6 или '100%'.
            },
            "cells": [                      --- настройка отображения колонок в таблице блока
                {
                    "code": "number",       --- уникальный в рамках всего блока код колонки.
                                                Нигде не выводится. Используется для служебных целей
                    "colspan": 1,           --- количество колонок объединенных в одну. 
                                                Может быть числом или процентами, например, 6 или '100%'.
                    "width": "1%",          --- ширина колонки в процентах
                    "name": "№",            --- название колонки
                    "isOrderNumber": true,  --- индикатор колоки с порядковым номером строки
                    "inInputs": false,      --- индикатор необходимости отображения в блоке ввода данных
                    "inResult": true        --- индикатор необходимости отображения в результирующей таблице
                }
            ]
        }
    ]
}
```

**Сумма всех колонок указанных в colspan в каждой строке сгенерированной таблицы должна быть одинаковая!**
