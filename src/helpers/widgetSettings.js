'use strict';

define(['jquery'], function ($) {
    var widgetSettings = {

        getFormulas : function (wcode) {
            var formulas = [];
            $.ajax({
                type: 'POST',
                cache: false,
                dataType: 'json',
                async: false,
                url: '/ajax/widgets/list',
                data: '',
                success: function (data) {
                    var settings = JSON.parse(data.widgets[wcode.toString()].settings)
                    if(settings.json && settings.json !== '{}') {
                        formulas = JSON.parse(settings.json)
                        if (typeof formulas.length < 1) {
                            formulas = []
                        }
                    } else {
                        formulas = []
                    }
                }
            });

            return formulas;
        },

        save : function (codeField, formul, wcode, data, id) {
            data.push({codeField, formul});
            this.set(data, wcode, id)
        },

        delete : function (codeField, wcode, data, id) {
            console.log(codeField)
            try {
                data = $.grep(data, function (el) {
                    return el.codeField !== codeField
                });
            } catch (e) {}

            console.log(data)
            this.set(data, wcode, id)
        },

        set : function (data, wcode, id) {
            try {
                $.post('/ajax/widgets/edit', {
                    action: 'edit',
                    id: id,
                    code: wcode,
                    widget_active: 'Y',
                    settings: { json: data ? JSON.stringify(data) : '' }
                });
            } catch (e) {
                console.log(e)
                var error_params = {
                    header: "Внимание!",
                    text: "Проблема в работе виджета"
                };
                AMOCRM.notifications.show_message_error(error_params);
            }
        }
    };

    return widgetSettings
});
