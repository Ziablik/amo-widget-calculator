define(['jquery'], function ($) {
    var widgetHelpers = {
        getFieldsNames : function() {
            var fieldsNames = [{option: 'Бюджет', id: 'lead_card_budget'}];

            //Получаю все имена и id всех кастомных полей, а также поля бюджет, и заношу их в объект fieldsNames
            //Берет только поля типа число
            var fields = AMOCRM.constant('account').cf;
            for (key in fields) {
                if(fields[key].TYPE_ID === '2' || fields[key].TYPE_ID === '1' || fields[key].TYPE_ID === '9'){
                    fieldsNames.push({option: fields[key].NAME, id: fields[key].ID});
                }
            }

            return fieldsNames;
        },

        //Замена названий полей в формуле на id полей
        convertFormulToID : function (formulByField) {
            var arrFormul = this.parseFormul(formulByField),
                formul = '';

            for(i=0; i<arrFormul.length; i++){
                if(arrFormul[i].length > 1){
                    formul = formul + '{' + this.convertNameToID(arrFormul[i]) + '}';
                }
                else{
                    formul = formul + arrFormul[i];
                }
            }

            return formul;
        },

        //Замена id полей в формуле на названия полей
        convertFormulToName : function (formulBySettings) {
            var arrFormul = this.parseFormulId(formulBySettings),
                formul = '';
            for(i=0; i<arrFormul.length; i++){
                if(arrFormul[i].length > 1){
                    formul = formul + this.convertIDToName(arrFormul[i]);
                }
                else{
                    formul = formul + arrFormul[i];
                }
            }

            return formul;
        },

        //Конвертировать имя поля на id поля
        convertNameToID : function (fieldName) {
            var fields,
                field;
            $.ajax({
                type:'GET',
                async: false,
                url: '/api/v2/account?with=custom_fields',
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
        },

        //Конвертировать id поля на имя поля
        convertIDToName : function (fieldID) {
            if(fieldID === 'lead_card_budget'){
                return 'Бюджет'
            }
            return AMOCRM.constant("account").cf[fieldID].NAME;
        },

        //parse текста формулы в массив, первый элемент может быть либо "(", либо имя поля,
        //bracketCount на выходе должен быть равен 0 и не должен становиться <0 во время процесса
        parseFormul : function (formul) {
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
                        return 'Вы забыли поставить открывающую скобку "("';
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
            if(arrSymbols.indexOf(arrFormul[0]) == 0 || arrFormul[0].length > 1){
                if(bracketCount == 0){
                    return arrFormul;
                }
                else{
                    return 'Не хватает закрывающей скобки ")" в формуле'
                }
            }
            else{
                return 'Не правильно заполнено поле формулы'
            }
        },

        //Функция парсит формулу в массив типа ['(', '421352', '+', '214643', ')', '*', '2']
        parseFormulId : function (formul) {
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
        },

        //Валидация формулы, mainField не должен повторяться в тексте формулы, все поля используемые в формуле должны существовать
        validateFormul : function (formul, fieldsNames, mainField) {
            var arrFormul = this.parseFormul(formul);
            if(typeof arrFormul === 'string'){
                return arrFormul
            }
            for(i=0; i<arrFormul.length; i++){
                if(arrFormul[i].length > 1){
                    if(arrFormul[i] == mainField){
                        return 'Нельзя использовать имя поля, для которого создается формула'
                    }
                    for(j=0; j<fieldsNames.length; j++){
                        if(arrFormul[i] == fieldsNames[j].option){
                            break;
                        }
                        else if(j == fieldsNames.length-1){
                            return 'Поле "'+ arrFormul[i] + '" не существует, либо у него другой тип';
                        }
                    }
                }
            }
            return true;
        },

        /**
         * Метод возращает формулу по коду поля codeField
         * @param codeField
         * @return {string}
         */
        getFormulaByCodeField: function (codeField) {
            var formula = '';
            $.each(formulas, function (key, el) {
                if (el.codeField === codeField) {
                    formula = el.formul
                }
            });

            return formula
        },

        /**
         * Метод возвращает true если в settings'е нет сохраняемой формулы
         * @param codeField
         * @param formulas
         * @return {boolean}
         */
        checkIsFormula: function (codeField, formulas) {
            for(i in formulas){
                if(formulas[i]['codeField'] === codeField){
                    return 'Формула для выбранного поля уже существует'
                }
            }
            return true
        },

        /**
         * Метод создает ивент автокомплита для переданного инпута
         * @param input
         */
        createAutoComplete: function(input){
            var searchText = '';
            input.parent().find('li').each(function () {
                $(this).on('click', function (event) {
                    input.val(widgetHelpers.searchChange(
                            $(this).find('span').attr('title'),
                            input.val()
                        ))
                })
            });
            input.on('keyup', function (event) {
                if(event.key === 'Backspace'){
                    searchText = searchText.slice(0, -1);
                    $(this).parent().find('span').each(function () {
                        if($(this).text().toUpperCase().indexOf(searchText.toUpperCase()) === -1){
                            $(this).parent().hide();
                        }
                        else $(this).parent().show();
                    })
                }
            });
            input.on('keypress', function (event) {
                if(event.key === '@'){
                    if($(this).val().indexOf('@') === -1){
                        searchText = '';
                        $(this).parent().find('ul').removeClass('control--select--list').addClass('control--select--list-opened')
                    }
                    else{
                        //Исправить
                        $(this).val($(this).val().slice(0, -1));
                    }
                }
                else {
                    searchText = searchText+event.key;
                    $(this).parent().find('span').each(function () {
                        if($(this).text().toUpperCase().indexOf(searchText.toUpperCase()) === -1){
                            $(this).parent().hide();
                        }
                        else $(this).parent().show();
                    })
                }
            });
        },

        /**
         * Метод ищет и заменяет @"Имя поля" -> "Имя поля"
         * @param fieldName
         * @param formula
         * @return {string}
         */
        searchChange: function (fieldName, formula) {
            var posStart = formula.indexOf('@');
            var posEnd;
            for(posEnd = posStart + 1; posEnd<formula.length; posEnd++){
                if('()-+/*'.indexOf(formula[posEnd]) !== -1){
                    break;
                }
            }
            formula = formula.substr(0, posStart) + fieldName + formula.substr(posEnd);
            return formula;
        }
    };

    return widgetHelpers
});