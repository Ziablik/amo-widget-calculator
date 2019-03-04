'use strict'

define(['jquery'], function ($) {
    var widgetSettings = {

        get : function () {
            var tp;
            $.ajax({
                type: 'POST',
                cache: false,
                dataType: 'json',
                async: false,
                url: 'https://new5c608a588697c.amocrm.ru/ajax/widgets/list',
                data: '',
                success: function (data) {
                    tp=JSON.parse(data.widgets.lastochka.settings);
                }
            });
            return tp;
        },

        save : function (codeField, formul) {
            var data = this.get();
            console.log(data);
            data[codeField] = formul;

            $.post('https://new5c608a588697c.amocrm.ru/ajax/widgets/edit', {
                action: 'edit',
                id: '348835',
                code: 'lastochka',
                widget_active: 'Y',
                settings: data
            }, function () {
                console.log(widgetSettings.get());
            });
        },

        delete : function (codeFiled) {
            var data = this.get();
            delete data[codeFiled];
            $.post('https://new5c608a588697c.amocrm.ru/ajax/widgets/edit', {
                action: 'edit',
                id: '348835',
                code: 'lastochka',
                widget_active: 'Y',
                settings: data
            }, function () {
                console.log(widgetSettings.get());
            });
        }
    };

    return widgetSettings
});
