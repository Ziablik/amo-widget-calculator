define(['jquery',
    "./helpers/widgetSettings.js",
    "./helpers/widgetHelpers.js",
    './helpers/widgetLCard.js',], function ($, widgetSettings, widgetHelpers, widgetLCard) {
    /**
     *
     * @returns {Widget}
     * @constructor
     */
    var Widget = function () {
        var self = this;
        system = self.system;
        var wcode, settings, users, wurl, enabled;

        /**
         * Функция для загрузки шаблонов по из папки templates
         * @param template
         * @param params
         * @param callback
         * @returns {*|boolean}
         */
        self.getTemplate = function (template, params, callback) {
            params = (typeof params === 'object') ? params : {};
            template = template || '';

            return self.render({
                href:  '/templates/' + template + '.twig',
                base_path: wurl, //тут обращение к объекту виджет вернет /widgets/#WIDGET_NAME#
                load: callback, //вызов функции обратного вызова
            }, params) //параметры для шаблона
        };

        this.getFormulField = function () {
            var fieldsNames = widgetHelpers.getFieldsNames();

            //Выбор кастомного поля, чтобы создать для него формулу
            $('#work-area-lastochka').append('<div id="formul--creating" class="safety_settings__section_new monitoring-settings__section"></div>');
            $('#formul--creating').append('<div class="safety_settings__section_head_new_title">Создание формулы</div>' +
                                            '<table class="content__account__settings">' +
                                                '<tbody>' +
                                                    '<tr>' +
                                                        '<td>'+self.render(
                                                        {ref: '/tmpl/controls/select.twig'},// объект data в данном случае содержит только ссылку на шаблон
                                                        {
                                                            items: fieldsNames,
                                                            id: 'addField',   //указание id
                                                        })+'</td>' +
                                                        '<td>'+self.render(
                                                        {ref: '/tmpl/controls/button.twig'},// объект data в данном случае содержит только ссылку на шаблон
                                                        {
                                                            id: 'buttonAddField'   //указание id
                                                        })+'</td>' +
                                                    '</tr>' +
                                                    '<tr>' +
                                                        '<td id="selectField">'+self.render(
                                                        {ref: '/tmpl/controls/select.twig'},// объект data в данном случае содержит только ссылку на шаблон
                                                        {
                                                            items: fieldsNames,
                                                            id: 'mainField',   //указание id
                                                        })+'</td>' +
                                                        '<td>'+self.render(
                                                        {ref: '/tmpl/controls/input.twig'},// объект data в данном случае содержит только ссылку на шаблон
                                                        {
                                                            id: 'formulField'   //указание id
                                                        })+'</td>' +
                                                    '</tr>' +
                                                    '<tr>' +
                                                        '<td></td>' +
                                                        '<td id="saveButton">'+self.render(
                                                            {ref: '/tmpl/controls/button.twig'},// объект data в данном случае содержит только ссылку на шаблон
                                                            {
                                                                id: 'buttonSaveFormul'   //указание id
                                                            })+'</td>' +
                                                    '</tr>' +
                                                '</tbody>' +
                                            '</table>');
            $('#formul--creating').find('td:first').css('width', '15%');
            //Не добавляется style для td#saveButton
            $('td#saveButton').css('text-align', 'rigth');
            $('#formulField').css('width', '100%');



            $('#buttonAddField span').append('Добавить в формулу');
            $('#buttonAddField').on('click', function () {
                $('#formulField').val($('#formulField').val() + $(this).closest('tr').find('.control--select--button-inner').text());
            });

            $('#buttonSaveFormul span').append('Создать формулу');
            $('#buttonSaveFormul').css('background', '#4c8bf7').css('color', '#fff');

            $('#buttonSaveFormul').on('click', function () {
                if(widgetHelpers.validateFormul($('#formulField').val(), fieldsNames, $(this).closest('tbody').find('.control--select--button-inner').text())){
                    alert('Формула создана');
                    $('#formulField').css('border', '1px solid rgb(0,255,0)');
                    widgetSettings.save($(this).closest('tbody').find('#selectField').find('.control--select--button').attr('data-value'),
                        widgetHelpers.convertFormulToID($('#formulField').val()))
                }
                else{
                    alert("Не правильное оформление");
                    $('#formulField').css('border', '1px solid rgb(255,0,0)')
                }
            })
        };

        //Функция отрисовывает все существующие формулы на странице расширненных настроек
        this.getFormulsList = function () {
            var formuls = widgetSettings.get(),
                fieldsNames = widgetHelpers.getFieldsNames();
            delete formuls['login'];
            delete formuls['undefined'];
            for(key in formuls){
                if(key != 'login'){
                    $('#work-area-lastochka').append('<div class="safety_settings__section_new monitoring-settings__section">' +
                        '<button id="spoiler" class="button-input" type="button">▼'+widgetHelpers.convertIDToName(key)+'</button>' +
                        '<table class="content__account__settings">' +
                            '<tbody id="table--formul">' +
                                '<tr>' +
                                    '<td class="content__account__settings__title" style="width: 25%">Имя поля</td>' +
                                    '<td>' +
                                    self.render(
                                        {ref: '/tmpl/controls/select.twig'},
                                        {
                                            items: fieldsNames,
                                            id: 'selectResultField',
                                        }) +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td class="content__account__settings__title" style="width: 25%">Формула</td>' +
                                    '<td class="content__account__settings__field">' +
                                        '<input class="text-input" id="formul-info" value="'+ widgetHelpers.convertFormulToName(formuls[key]) + '" type="text">' +
                                    '</td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                        '</div>');
                }
            }

            //Не выводится console.log, То есть даже не заходит в функцию each
            $('button#spoiler').each(function () {
                $(this).css('background', 'linear-gradient(to bottom,#fcfcfc 0%,#f8f8f9 100%)')
                    .css('width', '100%').css('text-align', 'left');
                $(this).parent().find('.control--select--button-inner').text($(this).text().substr(1));
                $(this).on('click', function () {
                    $(this).parent().children('table.content__account__settings').toggle('normal');
                })
            });

            //Тоже самое с функцией each
            $('tbody#table--formul').each(function () {
                $(this).append('<tr><td></td><td id="buttons"></td></tr>');
                $(this).find('#buttons').css('text-align', 'right');

                $(this).find('#buttons').append(self.render(
                    {ref: '/tmpl/controls/button.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        id: 'buttonDeleteFormul'   //указание id
                    }));
                $(this).find('#buttonDeleteFormul').find('span').append('Удалить формулу');
                $(this).find('#buttonDeleteFormul').on('click', function () {
                    if(confirm('Вы уверены, что хотите удалить формулу?')){
                        console.log($(this).closest('div').find('#spoiler').text());
                        widgetSettings.delete(widgetHelpers.convertNameToID($(this).closest('div').find('#spoiler').text().substr(1)));
                        $(this).closest('div').detach();
                        alert('Формула удалена');
                    }
                });

                $(this).find('#buttons').append(self.render(
                    {ref: '/tmpl/controls/button.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        id: 'buttonUpdateFormul'   //указание id
                    }));
                $(this).find('#buttonUpdateFormul').find('span').append('Обновить формулу');
                $(this).find('#buttonUpdateFormul').hide();

                var formulText = $(this).find('#formul-info').val(),
                    fieldText = $(this).find('.control--select--button-inner').text();
                $(this).find('#formul-info').on('keyup', function () {
                    if($(this).val() != formulText || fieldText != $(this).closest('tbody').find('.control--select--button-inner').text()){
                        $(this).closest('tbody').find('#buttonUpdateFormul').show();
                    }
                    else{
                        $(this).closest('tbody').find('#buttonUpdateFormul').hide();
                    }
                });
                
                $(this).find('#selectResultField').on('input', function () {
                    console.log($(this).closest('tbody').find('#formul-info').val());
                    console.log($(this).closest('tbody').find('.control--select--button-inner').text());
                    if($(this).closest('tbody').find('#formul-info').val() != formulText ||
                        fieldText != $(this).closest('tbody').find('.control--select--button-inner').text()){
                        $(this).closest('tbody').find('#buttonUpdateFormul').show();
                    }
                    else{
                        $(this).closest('tbody').find('#buttonUpdateFormul').hide();
                    }
                });
                
                $(this).find('#buttonUpdateFormul').on('click', function () {
                    if(widgetHelpers.validateFormul($(this).closest('tbody').find('#formul-info').val(), fieldsNames,
                                                    $(this).closest('tbody').find('.control--select--button-inner').text())){
                        alert('Формула обновлена');
                        $(this).closest('tbody').find('#formul-info').css('border', '1px solid rgb(0,255,0)');
                        widgetSettings.delete(widgetHelpers.convertNameToID($(this).closest('div').find('#spoiler').text().substr(1)));
                        widgetSettings.save($(this).closest('tbody').find('.control--select--button').attr('data-value'),
                                            widgetHelpers.convertFormulToID($(this).closest('tbody').find('#formul-info').val()))
                    }
                    else{
                        alert("Не правильное оформление");
                        $(this).closest('tbody').find('#formul-info').css('border', '1px solid rgb(255,0,0)')
                    }
                })
            });
        };

        /**
         * @type {{render: (function(): boolean), init: (function(): boolean), bind_actions: (function(): boolean), settings: (function(): boolean), onSave: (function(): boolean), destroy: PandoraLoaderWidget.callbacks.destroy}}
         */
        this.callbacks = {
            render: function () {
                console.log('render');
                // wcode = settings.widget_code;
                //
                // //Подгружаем стили
                // if (FreePackWidgetEnv === 'dev') {
                //     wurl = 'https://localhost:8080/amo-widget-calculator'
                // } else {
                //     wurl = '/upl/' + wcode + '/widget'
                // }

                return true
            },
            init: function () {
                console.log('init');
                return true
            },
            bind_actions: function () {
                console.log('bind_action');
                if(self.system().area == 'lcard'){
                    widgetLCard.createAction();
                }
                return true;
            },
            advancedSettings: function() {
                console.log('advanced');
                console.log(widgetSettings.get());
                self.getFormulField();
                self.getFormulsList();
                return true;
            },
            settings: function () {
                return true
            },
            onSave: function () {
                return true
            },
            destroy: function () {
                return true
            }
        };
        return this
    };
    return Widget
});
