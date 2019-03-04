define(['jquery',
    "./helpers/widgetSettings.js",
    "./helpers/widgetHelpers.js",
    './helpers/widgetLCard.js'], function ($, widgetSettings, widgetHelpers, widgetLCard) {
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
            $.get('https://new5c608a588697c.amocrm.ru/api/v2/account?with=custom_fields', function (data) {
                var leads = data._embedded.custom_fields.leads;
                for (key in leads){
                    if(leads[key].field_type == 2){
                        fieldsNames.push({option: leads[key].name, id: leads[key].id});
                    }
                }
                //Выбор кастомного поля, чтобы создать для него формулу
                $('#work-area-lastochka').append(self.render(
                    {ref: '/tmpl/controls/select.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        items: fieldsNames,
                        id: 'mainField',   //указание id
                    })
                );
                $('.control--select--button ').css('width', '15%');
                $('.control--select').append('=');

                //Поле для ввода формулы
                $('.control--select').append(self.render(
                    {ref: '/tmpl/controls/input.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        id: 'formulField'   //указание id
                    }));
                $('#formulField').css('width', '50%');

                //Кнопка для сохранения формулы
                $('.control--select').append(self.render(
                    {ref: '/tmpl/controls/button.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        id: 'buttonSaveFormul'   //указание id
                    }));
                $('#buttonSaveFormul span').append('Создать формулу');
                $('#buttonSaveFormul').css('background', '#4c8bf7').css('color', '#fff');

                $('#buttonSaveFormul').on('click', function () {
                    if(widgetHelpers.validateFormul($('#formulField').val(), fieldsNames, $('.control--select--button-inner').text())){
                        alert('Формула создана');
                        $('#formulField').css('border', '1px solid rgb(0,255,0)');
                        console.log($('.control--select--button').attr('data-value'));
                        widgetSettings.save($('.control--select--button').attr('data-value'), widgetHelpers.convertFormulToID($('#formulField').val()))
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
                    $('#work-area-lastochka').append('<div>' +
                        '<a href="" class="spoiler_links">Спойлер</a>' +
                        '<div class="control" id="formul-info">'+ widgetHelpers.convertIDToName(key) +'='+ widgetHelpers.convertFormulToName(formuls[key]) +'</div>' +
                        '</div>');
                }
            }
            $("div#formul-info").hide('normal');
            $('.spoiler_links').on('click', function(){
                $("div#formul-info").hide('normal');
                $(this).parent().children('div#formul-info').toggle('normal');
                return false;
            });
            $('div#formul-info').each(function () {
                $(this).append(self.render(
                    {ref: '/tmpl/controls/button.twig'},// объект data в данном случае содержит только ссылку на шаблон
                    {
                        id: 'buttonDeleteFormul'   //указание id
                    }));
                $(this).find('button').css('background', 'rgb(240,0,0)').css('color', '#fff');
                $(this).find('span').append('Удалить формулу');
                var mainField = $(this).html(),
                    codeField = '';
                for(i=0; i<mainField.length; i++){
                    if(mainField[i] != '='){
                        codeField = codeField + mainField[i];
                    }
                    if(mainField[i] == '='){
                        break;
                    }
                }
                $(this).parent().find('a').text(codeField);
                $(this).find('button').on('click', function () {
                    if(confirm('Вы уверены, что хотите удалить формулу?')){
                        codeField = widgetHelpers.convertNameToID(codeField);
                        widgetSettings.delete(codeField);
                        $(this).parent().parent().detach();
                        alert('Формула удалена');
                    }
                })
            })
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
