define(['jquery'], function ($) {
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

        this.get_settings = function () {
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
        };

        this.set_settings = function (codeField, formul) {
            var data = self.get_settings();
            data[codeField] = formul;

            $.post('https://new5c608a588697c.amocrm.ru/ajax/widgets/edit', {
                action: 'edit',
                id: '348835',
                code: 'lastochka',
                widget_active: 'Y',
                settings: data
            }, function () {
                console.log(self.get_settings());
            });
        };

        this.delete_settings = function (codeFiled) {
            var data = self.get_settings();
            delete data[codeFiled];
            $.post('https://new5c608a588697c.amocrm.ru/ajax/widgets/edit', {
                action: 'edit',
                id: '348835',
                code: 'lastochka',
                widget_active: 'Y',
                settings: data
            }, function () {
                console.log(self.get_settings());
            });
        };

        this.getFieldsNames = function () {
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
                    if(self.validateFormul($('#formulField').val(), fieldsNames, $('.control--select--button-inner').text())){
                        alert('Формула создана');
                        $('#formulField').css('border', '1px solid rgb(0,255,0)');
                        console.log($('.control--select--button').attr('data-value'));
                        self.set_settings($('.control--select--button').attr('data-value'), self.convertFormulToID($('#formulField').val()))
                    }
                    else{
                        alert("Не правильное оформление");
                        $('#formulField').css('border', '1px solid rgb(255,0,0)')
                    }
                })
            });
        };

        //Функция отрисовывает все существующие формулы на странице расширненных настроек
        this.getFormuls = function () {
            var formuls = self.get_settings();
            for(key in formuls){
                if(key != 'login'){
                    $('#work-area-lastochka').append('<div>' +
                        '<a href="" class="spoiler_links">Спойлер</a>' +
                        '<div class="control" id="formul-info">'+ self.convertIDToName(key) +'='+ self.convertFormulToName(formuls[key]) +'</div>' +
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
                        codeField = self.convertNameToID(codeField);
                        self.delete_settings(codeField);
                        $(this).parent().parent().detach();
                        alert('Формула удалена');
                    }
                })
            })
        };

        this.calculate = function (mainField, formul) {
            var arrFormul,
                formulValue = '';

            arrFormul = self.parseFormulId(formul);
            for(i=0; i<arrFormul.length; i++){
                if(arrFormul[i].length > 1){
                    if(arrFormul[i] == 'lead_card_budget'){
                        arrFormul[i] = $('#'+arrFormul[i]).val().replace(/\s/g, '');
                        formulValue = formulValue + arrFormul[i];
                    }
                    else{
                        arrFormul[i] = $('[name="CFV['+ arrFormul[i] +']"]').val();
                        formulValue = formulValue + arrFormul[i];
                    }
                }
                else{
                    formulValue = formulValue + arrFormul[i];
                }
            }
            try {
                $('[name="CFV['+ mainField +']"]').val(eval(formulValue));
            } catch (err) {
                console.log('Заполните поля, учавствующие в формуле')
            }
        };

        //Функция выбирает те поля, для которых нужно создать обработчик
        this.createAction = function () {
            var formuls = self.get_settings(),
                arrFormul;
            delete formuls['login'];
            console.log(formuls);

            for(key in formuls){
                arrFormul = self.parseFormulId(formuls[key]);
                console.log(arrFormul);
                for(i=0; i<arrFormul.length; i++){
                    if(arrFormul[i].length > 1){
                        self.fieldAction(key, arrFormul[i], formuls[key]);
                    }
                }
            }
        };

        //Создает обработчик для поля
        this.fieldAction = function (mainField, actionField, formul) {
            if(actionField == 'lead_card_budget'){
                $('#' + actionField).on('keyup', function () {
                    self.calculate(mainField, formul);
                })
            }
            else {
                $('[name="CFV[' + actionField + ']"]').on('keyup', function () {
                    self.calculate(mainField, formul);
                })
            }
        };

        //Замена названий полей в формуле на id полей
        this.convertFormulToID = function (formulByField) {
            console.log(formulByField);
            var arrFormul = self.parseFormul(formulByField),
                formul = '';

            for(i=0; i<arrFormul.length; i++){
                if(arrFormul[i].length > 1){
                    formul = formul + '{' + self.convertNameToID(arrFormul[i]) + '}';
                }
                else{
                    formul = formul + arrFormul[i];
                }
            }

            return formul;
        };

        //Замена id полей в формуле на названия полей
        this.convertFormulToName = function (formulBySettings) {
            var arrFormul = self.parseFormulId(formulBySettings),
                formul = '';
            for(i=0; i<arrFormul.length; i++){
                if(arrFormul[i].length > 1){
                    formul = formul + self.convertIDToName(arrFormul[i]);
                }
                else{
                    formul = formul + arrFormul[i];
                }
            }

            return formul;
        };

        //Конвертировать имя поля на id поля
        this.convertNameToID = function (fieldName) {
            // console.log(fieldName);
            var fields,
                field;
            $.ajax({
                type:'GET',
                async: false,
                url: 'https://new5c608a588697c.amocrm.ru/api/v2/account?with=custom_fields',
                success: function (data) {
                    fields = data._embedded.custom_fields.leads;
                }
            });
            for(field in fields){
                if(fieldName == 'Бюджет'){
                    return 'lead_card_budget'
                }
                if(fieldName == fields[field].name){
                    return field;
                }
            }
        };

        //Конвертировать id поля на имя поля
        this.convertIDToName = function (fieldID) {
            if(fieldID == 'lead_card_budget'){
                return 'Бюджет'
            }
            return AMOCRM.constant("account").cf[fieldID].NAME;
        };

        //Валидация формулы, mainField не должен повторяться в тексте формулы, все поля используемые в формуле должны существовать
        this.validateFormul = function (formul, fieldsNames, mainField) {
            // console.log(formul, fieldsNames, mainField);
            var arrFormul = self.parseFormul(formul);
            if(!arrFormul){
                return false
            }
            for(i=0; i<arrFormul.length; i++){
                if(arrFormul[i].length > 1){
                    if(arrFormul[i] == mainField){
                        return false
                    }
                    for(j=0; j<fieldsNames.length; j++){
                        if(arrFormul[i] == fieldsNames[j].option){
                            break;
                        }
                        else if(j == fieldsNames.length-1){
                            return false;
                        }
                    }
                }
            }
            return true;
        };

        //parse текста формулы в массив, первый элемент может быть либо "(", либо имя поля,
        //bracketCount на выходе должен быть равен 0 и не должен становиться <0 во время процесса
        this.parseFormul = function (formul) {
            var bracketCount = 0,
                arrFormul = [],
                arrSymbols = '()+-*/0123456789',
                arrField = '';
            for(i=0; i<formul.length; i++){
                if(arrSymbols.indexOf(formul[i]) != -1){
                    arrField = '';
                    if(arrSymbols.indexOf(formul[i]) == 0){
                        bracketCount++;
                    }
                    else if(arrSymbols.indexOf(formul[i]) == 1){
                        bracketCount--;
                    }
                    if(bracketCount < 0){
                        return false;
                    }
                    arrFormul.push(formul[i]);
                }
                else{
                    arrField = arrField + formul[i];
                    if(arrSymbols.indexOf(formul[i+1]) != -1 || i == formul.length-1){
                        arrFormul.push(arrField);
                    }
                }
            }
            if((arrSymbols.indexOf(arrFormul[0]) == 0 || arrFormul[0].length > 1) && bracketCount == 0){
                return arrFormul;
            }
            return false;
        };


        //Функция парсит формулу в массив типа ['(', '421352', '+', '214643', ')', '*', '2']
        this.parseFormulId = function (formul) {
            var arrFormul = [],
                bracketCount = 0,
                arrField = '';
            for(i=0; i<formul.length; i++){
                if(bracketCount == 1 && formul[i] != '}'){
                    arrField = arrField + formul[i];
                }
                else if(formul[i] != '{' && formul[i] != '}'){
                    arrFormul.push(formul[i]);
                }
                if(formul[i] == '{'){
                    arrField = '';
                    bracketCount++;
                }
                if(formul[i] == '}'){
                    arrFormul.push(arrField);
                    bracketCount--;
                }
            }
            return arrFormul;
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
                    self.createAction();
                }
                return true;
            },
            advancedSettings: function() {
                console.log('advanced');
                self.getFieldsNames();
                self.getFormuls();

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
