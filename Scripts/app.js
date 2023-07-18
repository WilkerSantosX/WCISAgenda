var dataDe; 
var horaDe;
var qtdReserva = 0;

$(document).ready(function () {			 
    $('.sidenav').sidenav();
    $('.modal').modal();
    $('.tooltipped').tooltip();
    $('select').formSelect();

    (async () => {
        getDateNow(new Date());
        await wait(1000);
        updateCalendarioAte();
    })();

    horaDe = getHourNow(new Date());   
    $("#hora_retirada").val(horaDe);
    $("#hora_devolucao").val(horaDe);

    $('.datepicker-de').datepicker({
        autoClose: true,        
        format: "dd/mm/yyyy",
        //parse: null,
        defaultDate: new Date(moment().format('yyyy'), moment().format('M')-1, moment().format('DD')),     
        setDefaultDate: true,   
        disableWeekends: true,
        // disableDayFn: ((callbackDay) => {
        //     if(callbackDay.getDay() == 1 || callbackDay.getDay() == 2 || callbackDay.getDay() == 3) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }),
        firstDay: 0,
        minDate: new Date(moment().format('yyyy'), moment().format('M')-1, moment().format('DD')),
        maxDate: new Date(moment().format('yyyy'), moment().format('M')-1, moment().add(7, 'days').format('DD')),
        yearRange: 1,
        // minYear: 2023,
        // maxYear: 2025,
        // minMonth: 6,
        // maxMonth: 2,
        // startRange: null,
        // endRange: null,
        //isRTL: true,
        showMonthAfterYear: true,
        //showDaysInNextAndPreviousMonths: true,
        //container: null,
        showClearBtn: false,
        i18n: {
            cancel: '',
            clear: '',
            done: '',
            months: [ 'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
            monthsShort: [ 'Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
            weekdays: [ 'Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado' ],
            weekdaysShort: [ 'Dom','Seg','Ter','Qua','Qui','Sex','Sáb' ],
            weekdaysAbbrev: [ 'D', 'S', 'T', 'Q', 'Q', 'S', 'S' ]
        },
        // events: [],
        onSelect: ((el) => {
            getDateNow(el);
            updateCalendarioAte();
        }),
        // onOpen: ((isOpen) => {console.log(isOpen)}),
        // onClose: ((date) => {console.log(date)}),
        // onDraw: ((options) => {console.log(options)})
    });   

    $('.timepicker-de').timepicker({
        //duration: 350,
        //showClearBtn: true,
        //defaultTime: '13:14',
        //fromNow: 20000,
        twelveHour: false,
        //vibrate: false,
        // onOpenStart: ((el) => {console.log(el)}),
        // onOpenEnd: ((time) => {console.log(time)}),
        // onCloseStart: ((isOpen) => {console.log(isOpen)}),
        onCloseEnd: (() => {CalcularTempoAluguel()}),
        // onSelect: ((time) => {console.log(time)}),
        i18n: {
            cancel: 'cancelar',
            clear: '',
            done: 'ok',
        },        
    });

    $('.timepicker-ate').timepicker({
        //duration: 350,
        //showClearBtn: true,
        //defaultTime: '13:14',
        //fromNow: 20000,
        twelveHour: false,
        //vibrate: false,
        // onOpenStart: ((el) => {console.log(el)}),
        // onOpenEnd: ((time) => {console.log(time)}),
        // onCloseStart: ((isOpen) => {console.log(isOpen)}),
        onCloseEnd: (() => {CalcularTempoAluguel()}),
        // onSelect: ((time) => {console.log(time)}),
        i18n: {
            cancel: 'cancelar',
            clear: '',
            done: 'ok',
        },        
    });

    //$('.timepicker').timepicker('open')
    //$('.timepicker').timepicker('_updateTimeFromInput', '10:30')
    M.updateTextFields();


    //Ações do usuário
    $('.green-text').click(function(){
        $(this).removeClass("green-text");
        $(this).addClass("orange-text"); 
        $("#btn_acao").removeClass("hide");
    });


    $("#agendamento_tipo").change(function(){    
        if(this.value == 'consulta' || this.value == 'estadia' || this.value == 'prestacao' || this.value == 'recebimento'){
            $('.div-devolucao').hide();
            $('#lblDataRetirada').text("Data");
            $('#lblHoraRetirada').text("Hora");
        } else{
            $('#lblDataRetirada').text("Data Retirada");
            $('#lblHoraRetirada').text("Hora Retirada");            
            $('.div-devolucao').show();
        }
    });


    $('#limpar').click(function(){
        $('.orange-text').addClass("green-text");
        $('.orange-text').removeClass("orange-text"); 
        $("#btn_acao").addClass("hide");
    });

    $('#salvar').click(function(){
        if(!$("#agendamento_tipo").val()){
            return Swal.fire(
                'Atenção',
                'Selecione o tipo de agendamento',
                'warning'
            )
        }
        
        if($("#agendamento_tipo").val() == 'carro' || $("#agendamento_tipo").val() == 'aluguel' || $("#agendamento_tipo").val() == 'outros'){
            if(!$("#data_retirada").val() || !$("#hora_retirada").val() || !$("#data_devolucao").val() || !$("#hora_devolucao").val() || $('.orange-text').length <= 0){
                return Swal.fire(
                    'Atenção',
                    'Preencha todas as informações necessárias para reserva',
                    'warning'
                )
            }
            if($("#tempo_id").val().includes("-")){
                return Swal.fire(
                    'Atenção',
                    'A data de devolução não pode ser menor que a data de reserva',
                    'warning'
                )               
            }
   
            $('.orange-text').addClass("grey-text");
            $('.orange-text').attr("data-tooltip", "indisponivel");
            $('.orange-text').removeClass("orange-text");
    
            qtdReserva++;
            $('#count_agendamentos_id').text(qtdReserva);
            $('#count_agendamentos_id').removeClass("green");
            $('#count_agendamentos_id').addClass("orange");  


            var options = $('#agendamento_tipo option:selected');
            const dadosHTML = '<div class="col s12 m12 l12"><div class="card"><div class="card-content"><div class="card-title">' +  
                                '<h6>' + options[0].innerHTML + '</h6></div>' +
                                '<p>Protocolo: ' + qtdReserva + '</p>' +
                                '<p>Data/Hora Início: ' + $("#data_retirada").val() + ' ' +  $("#hora_retirada").val() + '</p>' +
                                '<p>Data/Hora Fim: ' + $("#data_devolucao").val() + ' ' +  $("#hora_devolucao").val() + '</p>' +
                                '<p>Valor: ' + '0,00' +  '</p>' +
                                '</div></div></div>';

            $('#row-agendas').append(dadosHTML);  

        }else{
            
            $('.orange-text').addClass("grey-text");
            $('.orange-text').attr("data-tooltip", "indisponivel");
            $('.orange-text').removeClass("orange-text");
    
            qtdReserva++;
            $('#count_agendamentos_id').text(qtdReserva);
            $('#count_agendamentos_id').removeClass("green");
            $('#count_agendamentos_id').addClass("orange");              
            
            var options = $('#agendamento_tipo option:selected');
            const dadosHTML = '<div class="col s12 m12 l12"><div class="card"><div class="card-content"><div class="card-title">' +  
                                '<h6>' + options[0].innerHTML + '</h6></div>' +
                                '<p>Protocolo: ' + qtdReserva + '</p>' +
                                '<p>Data/Hora Início: ' + $("#data_retirada").val() + ' ' +  $("#hora_retirada").val() + '</p>' +
                                '<p>Data/Hora Fim: ' +  '-' + '</p>' +
                                '<p>Valor: ' + '0,00' +  '</p>' +
                                '</div></div></div>';

            $('#row-agendas').append(dadosHTML);             
        }

        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Agendado com sucesso',
            showConfirmButton: false,
            timer: 1000
        })

        $("#btn_acao").addClass("hide");
    });

});

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function updateCalendarioAte(){
    $('.datepicker-ate').datepicker({
        autoClose: true,        
        format: "dd/mm/yyyy",
        //parse: null,
        defaultDate: dataDe,     
        setDefaultDate: true,   
        disableWeekends: true,
        // disableDayFn: ((callbackDay) => {
        //     if(callbackDay.getDay() == 1 || callbackDay.getDay() == 2 || callbackDay.getDay() == 3) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }),
        firstDay: 0,
        minDate: dataDe,
        maxDate: new Date(moment().format('yyyy'), moment().format('M')-1, moment().add(7, 'days').format('DD')),
        yearRange: 1,    
        // minYear: 2023,
        // maxYear: 2025,
        // minMonth: 6,
        // maxMonth: 2,
        // startRange: null,
        // endRange: null,
        //isRTL: true,
        showMonthAfterYear: true,
        //showDaysInNextAndPreviousMonths: true,
        //container: null,
        showClearBtn: false,
        i18n: {
            cancel: '',
            clear: '',
            done: '',
            months: [ 'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
            monthsShort: [ 'Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
            weekdays: [ 'Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado' ],
            weekdaysShort: [ 'Dom','Seg','Ter','Qua','Qui','Sex','Sáb' ],
            weekdaysAbbrev: [ 'D', 'S', 'T', 'Q', 'Q', 'S', 'S' ]
        },
        // events: [],
        onSelect: ((el) => {    
        }),
        onOpen: ((isOpen) => {console.log(dataDe)}),
        // onClose: ((date) => {console.log(date)}),
        // onDraw: ((options) => {console.log(options)})
    });   
}

function getDateNow(value){ 
    const today = value;
    const yyyy = today.getFullYear();
    let mm = today.getMonth(); // Months start at 0!
    let dd = today.getDate();
    
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    
    //const formattedToday = dd + '/' + mm + '/' + yyyy; 
    dataDe = new Date(yyyy, mm, dd);  
}

function getHourNow(value){ 
    const today = value;
    var hh = today.getHours();
    var mm = today.getMinutes();

    if (hh < 10) hh = '0' + hh;
    if (mm < 10) mm = '0' + mm;

    return hh + ":" + mm;
}


function CalcularTempoAluguel(){    
    if($("#hora_devolucao").val() == '')
        return;

    let dformat1 = $("#data_retirada").val().split("/");
    let hformat1 = $("#hora_retirada").val();
    let aluguel = dformat1[2] + "-" + dformat1[1] + "-" + dformat1[0] + " " + hformat1;

    let dataAluguel = moment(aluguel, 'YYYY-MM-DD HH:mm:ss');
        
    let dformat2 = $("#data_devolucao").val().split("/");
    let hformat2 = $("#hora_devolucao").val();
    
    let devolucao = dformat2[2] + "-" + dformat2[1] + "-" + dformat2[0] + " " + hformat2;
    let dataDevolucao = moment(devolucao, 'YYYY-MM-DD HH:mm:ss');
    
    let duration = moment.duration(dataDevolucao.diff(dataAluguel));
    let hours = parseInt(duration.asHours());
    let minutes = parseInt(duration.asMinutes())-hours*60;

    $("#tempo_id").val(hours + ' hour(s) and '+ minutes+' minutes.');
}