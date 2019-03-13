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
        var formulas;
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

        /**
         * Метод устанавливает формулы из json строки в массив
         */
        self.setLocalFormulas = function () {
            formulas = widgetSettings.getFormulas(wcode)
        }

        this.getFormulField = function () {
            var fieldsNames = widgetHelpers.getFieldsNames();
            //Выбор кастомного поля, чтобы создать для него формулу
            $('#work-area-' + wcode).append('<div id="formul--creating" class="safety_settings__section_new monitoring-settings__section"></div>');

            self.getTemplate('formul-creating', {}, function (data) {
                var html = data.render({
                    fieldsNames
                });
                $('#formul--creating').append(html);
                //Не добавляется style для td#saveButton
                $('#formulField').css('width', '100%');



                $('#buttonAddField span').append('Добавить в формулу');
                $('#buttonAddField').on('click', function () {
                    $('#formulField').val($('#formulField').val() + $(this).closest('tr').find('.control--select--button-inner').text());
                });

                $('#buttonSaveFormul span').append('Создать формулу');
                $('#buttonSaveFormul').css('background', '#4c8bf7').css('color', '#fff');

                $('#buttonSaveFormul').on('click', function () {
                    if(widgetHelpers.validateFormul($('#formulField').val(), fieldsNames, $(this).closest('tbody').find('#mainField').parent().find('.control--select--button-inner').text())){
                        $('#formulField').css('border', '1px solid rgb(0,255,0)');

                        widgetSettings.save(
                            $(this).closest('tbody').find('#selectField').find('.control--select--button').attr('data-value'),
                            widgetHelpers.convertFormulToID($('#formulField').val()),
                            wcode,
                            formulas,
                            settings.id
                        )
                    }
                    else{
                        $('#formulField').css('border', '1px solid rgb(255,0,0)')
                    }
                })
            });
        };

        //Функция отрисовывает все существующие формулы на странице расширненных настроек
        this.getFormulsList = function () {
            var fieldsNames = widgetHelpers.getFieldsNames();

            $.each(formulas, function (key, el) {
                var formul = widgetHelpers.convertFormulToName(el.formul);
                var fieldName = widgetHelpers.convertIDToName(el.codeField);


                self.getTemplate('formul-table', {}, function (date) {
                    var html = date.render({
                        fieldsNames,
                        formul,
                        fieldName,
                        selectedField: el.codeField
                    });

                    console.log('template');
                    $('#work-area-' + wcode).append(html);
                });
            })


            $('button#spoiler').each(function () {
                $(this).css('background', 'linear-gradient(to bottom,#fcfcfc 0%,#f8f8f9 100%)')
                    .css('width', '100%').css('text-align', 'left');
                $(this).parent().find('.control--select--button-inner').text($(this).text().substr(1));
                $(this).on('click', function () {
                    $(this).parent().children('table.content__account__settings').toggle('normal');
                })
            });

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
                        widgetSettings.delete(widgetHelpers.convertNameToID($(this).closest('div').find('#spoiler').text().substr(1)), wcode);
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

                $(this).find('#selectResultField').on('change', function () {
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
                        $(this).closest('tbody').find('#formul-info').css('border', '1px solid rgb(0,255,0)');
                        widgetSettings.delete(widgetHelpers.convertNameToID($(this).closest('div').find('#spoiler').text().substr(1)), wcode,json);
                        widgetSettings.save($(this).closest('tbody').find('.control--select--button').attr('data-value'),
                                            widgetHelpers.convertFormulToID($(this).closest('tbody').find('#formul-info').val()), wcode, json)
                    }
                    else{
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
                settings = self.get_settings();
                wcode = settings.widget_code;
                //Подгружаем стили
                if (FreePackWidgetEnv === 'dev') {
                    wurl = 'https://localhost:8080/amo-widget-calculator'
                } else {
                    wurl = '/upl/' + wcode + '/widget'
                }

                return true
            },
            init: function () {
                self.setLocalFormulas()
                return true
            },
            bind_actions: function () {
                if(self.system().area === 'lcard'){
                    widgetLCard.createAction(formulas);
                }
                return true;
            },
            advancedSettings: function() {
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
