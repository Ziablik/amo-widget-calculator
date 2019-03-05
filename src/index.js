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
            var fieldsNames = [];
            fieldsNames.push({option: 'Бюджет', id: 'lead_card_budget'});
            //Получаю все имена и id всех кастомных полей, а также поля бюджет, и заношу их в объект fieldsNames
            //Берет только поля типа число
            $.get('/api/v2/account?with=custom_fields', function (data) {
                var leads = data._embedded.custom_fields.leads;
                for (key in leads){
                    if(leads[key].field_type == 2){
                        fieldsNames.push({option: leads[key].name, id: leads[key].id});
                    }
                }

                //Выбор кастомного поля, чтобы создать для него формулу
                $('#work-area-lastochka').append('<div id="formul--creating" class="safety_settings__section_new monitoring-settings__section"></div>')
                $('#formul--creating').append(self.render(
                    {ref: '/tmpl/controls/select.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        items: fieldsNames,
                        id: 'addField',   //указание id
                    })
                );

                //Выбор кастомного поля, чтобы добавить текст в формулу
                $('#formul--creating').append(self.render(
                    {ref: '/tmpl/controls/select.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        items: fieldsNames,
                        id: 'mainField',   //указание id
                    })
                );
                $('.control--select--button').css('width', '15%');
                $('#mainField').parent().append('= ');

                //Поле для ввода формулы
                $('#mainField').parent().append(self.render(
                    {ref: '/tmpl/controls/input.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        id: 'formulField'   //указание id
                    }));
                $('#formulField').css('width', '50%');

                //Кнопка для доавбления имя поля в форму создания формулы
                $('#addField').parent().append(self.render(
                    {ref: '/tmpl/controls/button.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        id: 'buttonAddField'   //указание id
                    }));
                $('#buttonAddField span').append('Добавить в формулу');

                $('#buttonAddField').on('click', function () {
                    console.log($(this).parent().find('.control--select--button-inner').text());
                    console.log($('#formulField').val());
                    $('#formulField').val($('#formulField').val() + $(this).parent().find('.control--select--button-inner').text());
                });

                //Кнопка для сохранения формулы
                $('#mainField').parent().append(self.render(
                    {ref: '/tmpl/controls/button.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        id: 'buttonSaveFormul'   //указание id
                    }));
                $('#buttonSaveFormul span').append('Создать формулу');
                $('#buttonSaveFormul').css('background', '#4c8bf7').css('color', '#fff');

                $('#buttonSaveFormul').on('click', function () {
                    if(widgetHelpers.validateFormul($('#formulField').val(), fieldsNames, $(this).parent().find('.control--select--button-inner').text())){
                        alert('Формула создана');
                        $('#formulField').css('border', '1px solid rgb(0,255,0)');
                        widgetSettings.save($(this).parent().find('.control--select--button').attr('data-value'), widgetHelpers.convertFormulToID($('#formulField').val()))
                    }
                    else{
                        alert("Не правильное оформление");
                        $('#formulField').css('border', '1px solid rgb(255,0,0)')
                    }
                })
            });
        };

        //Функция отрисовывает все существующие формулы на странице расширненных настроек
        this.getFormulsList = function () {
            var formuls = widgetSettings.get();
            for(key in formuls){
                if(key != 'login'){
                    $('#work-area-lastochka').append('<div class="safety_settings__section_new monitoring-settings__section">' +
                        '<button id="spoiler" class="button-input" type="button"></button>' +
                        '<table class="content__account__settings">' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td class="content__account__settings__title" style="width: 20%">Имя поля</td>' +
                                    '<td class="content__account__settings__title" id="field-info">'+widgetHelpers.convertIDToName(key)+'</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td class="content__account__settings__title" style="width: 20%">Формула</td>' +
                                    '<td class="content__account__settings__field">' +
                                        '<input class="text-input" id="formul-info" value="'+ widgetHelpers.convertFormulToName(formuls[key]) + '" type="text">' +
                                    '</td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                        '</div>');
                }
            }

            $('button#spoiler').each(function () {
                $(this).css('background', 'linear-gradient(to bottom,#fcfcfc 0%,#f8f8f9 100%)')
                    .css('width', '100%').css('text-align', 'left');
                $(this).text('▼' + $(this).parent().find('#field-info').text());
                $(this).on('click', function () {
                    $(this).parent().children('table.content__account__settings').toggle('normal');
                })
            });

            $('tbody').each(function () {
                $(this).append('<tr><td id="buttonField"></td></tr>');
                $(this).find('#buttonField').append(self.render(
                    {ref: '/tmpl/controls/button.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        id: 'buttonDeleteFormul'   //указание id
                    }));
                $(this).find('#buttonDeleteFormul').append('Удалить формулу');
                $(this).find('#buttonDeleteFormul').on('click', function () {
                    if(confirm('Вы уверены, что хотите удалить формулу?')){
                        widgetSettings.delete(widgetHelpers.convertNameToID($(this).closest('tbody').find('#field-info').text()));
                        $(this).closest('div').detach();
                        alert('Формула удалена');
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
                self.getFormulsList();
                self.getFormulField();

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
