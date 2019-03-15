define(['jquery',
    "./helpers/widgetSettings.js",
    "./helpers/widgetHelpers.js",
    './helpers/widgetLCard.js',], function ($, widgetSettings, widgetHelpers, widgetLCard) {
    /**
     *
     * @returns {Widget}
     * @constructor
     */
    var AlarmCrmCalculatorWidget = function () {
        var self = this;
        system = self.system;
        var isInited = false; // Bool на первый запуск виджета
        var formulas; // Массив всех формул
        var wId; // ID виджета
        var fieldsNames; // Кастомные поля
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
            formulas = widgetSettings.getFormulas(wcode);
        };

        /**
         * Метод рендерит поля для добавления формул
         * Добавляет листнеры на ивенты добавления формул
         */
        self.addNewFormulaRender = function() {
            var workArea = $('#work-area-' + wcode);
            var formulaInput;
            self.getTemplate('add-new-formula', {}, function (data) {
                var html = data.render({
                    fieldsNames
                });
                workArea.append(html)
            });


            // Ивент добавления поля в форму
            $(document).on('click', '#buttonAddFieldToFormula', function () {
                formulaInput = $('#formulaField');
                formulaInput.val(formulaInput.val() + $(this).closest('tr').find('.control--select--list--item-selected span').text());
            });

            // Ивент сохранения формулы
            $(document).on('click', '#buttonSaveFormula', function () {
                formulaInput = $('#formulaField');

                if(widgetHelpers.validateFormul(
                    formulaInput.val(),
                    fieldsNames,
                    $('#mainFormulaField').parent().find('.control--select--list--item-selected span').text()
                )) {
                    formulaInput.css('border', '1px solid #dbdedf');

                    widgetSettings.save(
                        $(this).closest('tbody').find('#selectField').find('.control--select--button').attr('data-value'),
                        widgetHelpers.convertFormulToID(formulaInput.val()),
                        wcode,
                        formulas,
                        wId
                    );

                    self.setLocalFormulas(); // Устанавливаем новые значения формул
                } else{
                    formulaInput.css('border', '1px solid rgb(255,0,0)')
                }
            });
        };

        /**
         * Метод рендерит все текущие формулы
         * Добавляет листнеры на ивенты добавления формул
         */
        self.formulasTableRender = function () {
            if(formulas.length > 0) {
                $.each(formulas, function (key, el) {
                    var formul = widgetHelpers.convertFormulToName(el.formul);
                    var fieldName = widgetHelpers.convertIDToName(el.codeField);

                    self.getTemplate('formula-table', {}, function (date) {
                        var html = date.render({
                            fieldsNames,
                            formul,
                            fieldName,
                            selectedField: {id: el.codeField, option: fieldName},
                            key
                        });

                        $('#work-area-' + wcode).append(html);
                    });
                });

                $(document).on('click', 'button.spoiler-formula', function () {
                    $(this).parent().children('table.content__account__settings').toggle('normal');
                });

                $(document).on('click', '.buttonDeleteFormula', function () {
                    if (confirm('Вы уверены, что хотите удалить формулу?')) {
                        widgetSettings.delete($(this).attr('field-code'), wcode, formulas, wId);
                        $(this).closest('div').detach();
                        self.setLocalFormulas(); // Устанавливаем новые значения формул
                    }
                });

                $(document).on('click', '.buttonUpdateFormula', function () {
                    if(widgetHelpers.validateFormul(
                        $(this).closest('tbody').find('#formul-info').val(),
                        fieldsNames,
                        $(this).closest('tbody').find('.control--select--button-inner').text()
                    )){
                        $(this).closest('tbody').find('#formul-info').css('border', '1px solid rgb(0,255,0)');
                        widgetSettings.delete($(this).attr('field-code'), wcode, formulas, wId);
                        self.setLocalFormulas();
                        widgetSettings.save(
                            $(this).closest('tbody').find('.control--select--list--item-selected').attr('data-value'),
                            widgetHelpers.convertFormulToID($(this).closest('tbody').find('#formul-info').val()),
                            wcode,
                            formulas,
                            wId
                        );
                        self.setLocalFormulas();
                        $(this).closest('div')
                            .find('.spoiler-formula')
                            .text($(this).closest('tbody').find('.control--select--button-inner').text())
                    }
                    else{
                        $(this).closest('tbody').find('#formul-info').css('border', '1px solid rgb(255,0,0)');
                    }
                });
            }
        };

        /**
         * DEPRECATED
         * TODO: Переделать в ноывй метод
         */
        //Функция отрисовывает все существующие формулы на странице расширненных настроек
        this.getFormulsList = function () {
            var fieldsNames = widgetHelpers.getFieldsNames();
            $.each(formulas, function (key, el) {
                var formul = widgetHelpers.convertFormulToName(el.formul);
                var fieldName = widgetHelpers.convertIDToName(el.codeField);


                self.getTemplate('formula-table', {}, function (date) {
                    var html = date.render({
                        fieldsNames,
                        formul,
                        fieldName,
                        selectedField: el.codeField
                    });

                    console.log('template');
                    $('#work-area-' + wcode).append(html);
                });
            });


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
                        widgetSettings.delete(widgetHelpers.convertNameToID($(this).closest('div').find('#spoiler').text().substr(1)), wcode, json);
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
         * Метод рендерит дополнительные настройки
         */
        self.advancedSettingsRender = function () {
            var body = $('body');
            body.addClass('page-loading'); // Показываем лоадер
            self.addNewFormulaRender(); // Рендерим форму добавления формулы
            self.formulasTableRender(); // Рендерим все формулы
            body.removeClass('page-loading'); // Убираем лоадер
        };

        /**
         * @type {{render: (function(): boolean), init: (function(): boolean), bind_actions: (function(): boolean), settings: (function(): boolean), onSave: (function(): boolean), destroy: PandoraLoaderWidget.callbacks.destroy}}
         */
        this.callbacks = {
            render: function () {
                settings = self.get_settings();
                wcode = settings.widget_code;
                // Подгрузка локально или из архива
                if (FreePackWidgetEnv === 'dev') {
                    wurl = 'https://localhost:8080/amo-widget-calculator'
                } else {
                    wurl = '/upl/' + wcode + '/widget'
                }

                // Записываем локальные данные при инициализации виджета
                if(isInited === false) {
                    self.setLocalFormulas()
                    wId = self.params.id;
                    fieldsNames = widgetHelpers.getFieldsNames();

                    isInited = true
                }

                // Если мы вернулись в окно доп настроек, отрендерить формулы и тп, callbacks.advancedSettings не отрабатывает при повторном переходе
                if(self.system().area === 'advanced_settings') {
                    self.advancedSettingsRender()
                }

                console.log(true)
                return true
            },
            init: function () {
                return true
            },
            bind_actions: function () {
                if(self.system().area === 'lcard') {
                    widgetLCard.createAction(formulas);
                }
                return true;
            },
            advancedSettings: function() {
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

    return AlarmCrmCalculatorWidget
});
