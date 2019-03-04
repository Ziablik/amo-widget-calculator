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
            data[codeField] = formul;
            this.set(data)
        },

        delete : function (codeFiled) {
            var data = this.get();
            delete data[codeFiled];
            this.set(data)
        },

        set : function (data) {
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
