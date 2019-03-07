define(['jquery'], function ($) {
    var widgetHelpers = {
        //
        getFieldsNames : function() {
            var fieldsNames = [];
            fieldsNames.push({option: 'Бюджет', id: 'lead_card_budget'});
            //Получаю все имена и id всех кастомных полей, а также поля бюджет, и заношу их в объект fieldsNames
            //Берет только поля типа число
            $.ajax({
                url: '/api/v2/account?with=custom_fields',
                dataType: 'json',
                async: false,
                success: function (data) {
                    var leads = data._embedded.custom_fields.leads;
                    for (key in leads){
                        if(leads[key].field_type == 2){
                            fieldsNames.push({option: leads[key].name, id: leads[key].id});
                        }
                    }
                }
            });
            return fieldsNames;
        },

        //Замена названий полей в формуле на id полей
        convertFormulToID : function (formulByField) {
            console.log(formulByField);
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
            // console.log(fieldName);
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
            if(fieldID == 'lead_card_budget'){
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
            // console.log(formul, fieldsNames, mainField);
            var arrFormul = this.parseFormul(formul);
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
        }

};

    return widgetHelpers
});
