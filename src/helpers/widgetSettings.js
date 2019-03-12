'use strict';

define(['jquery'], function ($) {
    var widgetSettings = {

        get : function (wcode) {
            var tp;
            $.ajax({
                type: 'POST',
                cache: false,
                dataType: 'json',
                async: false,
                url: '/ajax/widgets/list',
                data: '',
                success: function (data) {
                    tp=JSON.parse(data.widgets[wcode].settings);
                }
            });
            return tp;
        },

        save : function (codeField, formul, wcode) {
            var data = this.get();
            data[codeField] = formul;
            this.set(data, wcode)
        },

        delete : function (codeFiled, wcode) {
            var data = this.get();
            delete data[codeFiled];
            this.set(data, wcode)
        },

        set : function (data, wcode) {
            $.post('/ajax/widgets/edit', {
                action: 'edit',
                id: '348835',
                code: wcode,
                widget_active: 'Y',
                settings: data
            }, function () {
                console.log(widgetSettings.get(wcode));
            });
        }
    };

    return widgetSettings
});
