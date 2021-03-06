define(['jquery',
    "./helpers/widgetSettings.js",
    "./helpers/widgetHelpers.js",
    './helpers/widgetLCard.js',], function ($, widgetSettings, widgetHelpers, widgetLCard) {
    /**
     *
     * @returns {AlarmCrmCalculatorWidget}
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
            var formulaInput , errorText;
            var body = $('body');
            self.getTemplate('add-new-formula', {}, function (data) {
                var html = data.render({
                    fieldsNames
                });
                workArea.append(html);
                widgetHelpers.createAutoComplete($('#formulaField'));
            });

            // Ивент добавления поля в форму
            $(document).on('click', '#buttonAddFieldToFormula', function () {
                formulaInput = $('#formulaField');
                formulaInput.val(formulaInput.val() + $(this).closest('tr').find('.control--select--list--item-selected span').text());
            });

            $(document).on('click', '#buttonSaveFormula', function () {
                formulaInput = $('#formulaField');
                errorText = $(this).closest('tbody').find('.errorText');
                if(typeof widgetHelpers.validateFormul(
                    formulaInput.val(),
                    fieldsNames,
                    $('#mainFormulaField').parent().find('.control--select--list--item-selected span').text()
                ) === 'boolean') {
                    if(typeof widgetHelpers.checkIsFormula(
                        $(this).closest('tbody').find('#selectField').find('.control--select--button').attr('data-value'),
                        formulas
                    ) === "boolean"){
                        errorText.parent().hide('normal');
                        formulaInput.css('border', '1px solid #dbdedf');
                        body.addClass('page-loading');
                        widgetSettings.save(
                            $(this).closest('tbody').find('#selectField').find('.control--select--button').attr('data-value'),
                            widgetHelpers.convertFormulToID(formulaInput.val()),
                            wcode,
                            formulas,
                            wId
                        );
                        body.removeClass('page-loading');
                        var fieldName = $(this).closest('tbody')
                                .find('#selectField')
                                .find('.control--select--button-inner').text(),
                            selectedId = $(this).closest('tbody')
                                .find('#selectField')
                                .find('.control--select--list--item-selected').attr('data-value'),
                            formul = formulaInput.val();

                        self.getTemplate('formula-table', {}, function (date) {
                            var html = date.render({
                                fieldsNames,
                                formul,
                                fieldName,
                                selectedField: {id: selectedId, option: fieldName}
                            });
                            $('#work-area-' + wcode).append(html);
                        });

                        formulaInput.val('');
                        self.setLocalFormulas(); // Устанавливаем новые значения формул
                    }
                    else{
                        errorText.text(widgetHelpers.checkIsFormula(
                            $(this).closest('tbody').find('#selectField').find('.control--select--button').attr('data-value'),
                            formulas
                        ));
                        errorText.parent().show('normal');
                        formulaInput.css('border', '1px solid rgb(255,0,0)')
                    }
                } else{
                    errorText.text(widgetHelpers.validateFormul(
                        formulaInput.val(),
                        fieldsNames,
                        $('#mainFormulaField').parent().find('.control--select--list--item-selected span').text()
                    ));
                    errorText.parent().show('normal');
                    formulaInput.css('border', '1px solid rgb(255,0,0)')
                }
            });
        };

        /**
         * Метод рендерит модальное окно с подтверждением
         */
        self.modalRender = function(someText, body, button, eventType) {
            self.getTemplate('modal', {}, function (date) {
                var html = date.render({
                    someText,
                });
                body.append(html)
            });
            $(document).on('click', '.modal-body__close', function () {
                $(this).closest('.modal-list').detach();
            });
            $(document).on('click', '.buttonSuccess', function () {
                $(this).closest('.modal-list').detach();
                body.addClass('page-loading');
                widgetSettings.delete(button.attr('field-code'), wcode, formulas, wId);
                self.setLocalFormulas(); // Устанавливаем новые значения формул
                if(eventType === 'update'){
                    widgetSettings.save(
                        button.closest('tbody').find('.control--select--list--item-selected').attr('data-value'),
                        widgetHelpers.convertFormulToID(button.closest('tbody').find('#formul-info').val()),
                        wcode,
                        formulas,
                        wId
                    );
                    self.setLocalFormulas();
                    button.closest('div')
                        .find('.spoiler-formula')
                        .text(button.closest('tbody').find('.control--select--button-inner').text())
                }
                else button.closest('div').detach();
                body.removeClass('page-loading');
            });
            $(document).on('click', '.buttonCancel', function () {
                $(this).closest('.modal-list').detach();
            });
        };

        /**
         * Метод рендерит все текущие формулы
         * Добавляет листнеры на ивенты добавления формул
         */
        self.formulasTableRender = function () {
            var body = $('body');
            if(formulas.length > 0) {
                $.each(formulas, function (key, el) {
                    var formul = widgetHelpers.convertFormulToName(el.formul),
                        fieldName = widgetHelpers.convertIDToName(el.codeField);

                    self.getTemplate('formula-table', {}, function (date) {
                        var html = date.render({
                            fieldsNames,
                            formul,
                            fieldName,
                            key,
                            selectedField: {id: el.codeField, option: fieldName},
                        });

                        $('#work-area-' + wcode).append(html);
                        widgetHelpers.createAutoComplete($('.table-'+key).find('#formul-info'))
                    });
                });

                $(document).on('click', 'button.spoiler-formula', function () {
                    $(this).parent().children('table.content__account__settings').toggle('normal');
                });

                $(document).on('click', '.buttonDeleteFormula', function () {

                    var someText = 'Вы уверены, что хотите удалить формулу?',
                        buttonDelete = $(this);
                    self.modalRender(someText, body, buttonDelete, '');
                });

                $(document).on('click', '.buttonUpdateFormula', function () {
                    var errorText = $(this).closest('tbody').find('.errorText');
                    var someText = 'Вы уверены, что хотите обновить формулу?',
                        buttonUpdate = $(this);
                    if(typeof widgetHelpers.validateFormul(
                        $(this).closest('tbody').find('#formul-info').val(),
                        fieldsNames,
                        $(this).closest('tbody').find('.control--select--button-inner').text()
                    ) === 'boolean'){
                        errorText.parent().hide('normal');
                        $(this).closest('tbody').find('#formul-info').css('border', '1px solid rgb(0,255,0)');
                        self.modalRender(someText, body, buttonUpdate, 'update');
                    }
                    else{
                        errorText.text(widgetHelpers.validateFormul(
                            $(this).closest('tbody').find('#formul-info').val(),
                            fieldsNames,
                            $(this).closest('tbody').find('.control--select--button-inner').text()
                        ));
                        errorText.parent().show('normal');
                        $(this).closest('tbody').find('#formul-info').css('border', '1px solid rgb(255,0,0)');
                    }
                });
            }
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
                    self.setLocalFormulas();
                    wId = self.params.id;
                    fieldsNames = widgetHelpers.getFieldsNames();

                    isInited = true
                }

                // Если мы вернулись в окно доп настроек, отрендерить формулы и тп, callbacks.advancedSettings не отрабатывает при повторном переходе
                if(self.system().area === 'advanced_settings') {
                    self.advancedSettingsRender()
                }

                return true
            },
            init: function () {
                return true
            },
            bind_actions: function () {
                widgetLCard.createAction(formulas);
                return true;
            },
            advancedSettings: function() {
                return true;
            },
            settings: function () {
                $('#widget_settings__fields_wrapper').hide();
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
