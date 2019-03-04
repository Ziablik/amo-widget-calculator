define(['jquery', './widgetHelpers.js', "./widgetSettings.js"], function ($, widgetHelpers, widgetSettings) {
    var widgetLCard = {
        calculate : function (mainField, formul) {
            var arrFormul,
                formulValue = '';

            arrFormul = widgetHelpers.parseFormulId(formul);
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
        },

        //Функция выбирает те поля, для которых нужно создать обработчик
        createAction : function () {
            var formuls = widgetSettings.get(),
                arrFormul;
            delete formuls['login'];
            console.log(formuls);

            for(key in formuls){
                arrFormul = widgetHelpers.parseFormulId(formuls[key]);
                console.log(arrFormul);
                for(i=0; i<arrFormul.length; i++){
                    if(arrFormul[i].length > 1){
                        this.fieldAction(key, arrFormul[i], formuls[key]);
                    }
                }
            }
        },

        //Создает обработчик для поля
        fieldAction : function (mainField, actionField, formul) {
            if(actionField == 'lead_card_budget'){
                $('#' + actionField).on('keyup', function () {
                    widgetLCard.calculate(mainField, formul);
                })
            }
            else {
                $('[name="CFV[' + actionField + ']"]').on('keyup', function () {
                    widgetLCard.calculate(mainField, formul);
                })
            }
        }
    };

    return widgetLCard
});
