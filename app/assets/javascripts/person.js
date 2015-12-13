( function() {
  var app = angular.module('prolibertas-person', ['ui.router']);

  // Controllers
  app.controller('PeopleController', ['$filter', '$http', '$timeout', '$state', '$rootScope', function($filter, $http, $timeout, $state, $rootScope) {
    var scope = this;
    scope.sandwiches;
    scope.person= {};
    scope.person.selected_day =  $filter('date')(new Date(), 'dd/MM/yyyy');
    scope.people = [];
    scope.hasPeople = false;
    scope.services = [];
    scope.alertaCreado = $state.params.alertaCreado;
    scope.alertaBorrado = $state.params.alertaBorrado;
    scope.alertaGuardado = $state.params.alertaGuardado;

    // La alerta se oculta después de 5 segundos
    $timeout(function(){scope.alertaCreado = false;}, 5000);
    $timeout(function(){scope.alertaBorrado = false;}, 5000);
    $timeout(function(){scope.alertaGuardado = false;}, 5000);

    $('.datepicker').datetimepicker({
      locale: 'es',
      format: 'DD/MM/YYYY'
     });

    $rootScope.prolibertas = "Lista de Personas"

    $http.get( '/people.json?selected_day=' + scope.person.selected_day )
    .success(function(data){
      scope.people = data.people;
      scope.hasPeople = true;
    });

    $http.get('/services.json')
    .success(function(data) {
      scope.services = data.services;
    });

    $("#InputSelected_day").focusout( function() {
      scope.person.selected_day = $("#InputSelected_day").val();
        $http.get( '/people.json?selected_day=' + scope.person.selected_day )
          .success( function( data ) {
            scope.people = data.people;
            scope.hasPeople = true;
        });
    });

  //función para calcular la edad a partir de la fecha de nacimiento
   scope.anos = function (birth) {
    if (birth === null ) {
      return "";
    }
      else {
    var e = birth.split("-");

    var ano =  e[0];
    var mes =  e[1];
    var dia =  e[2];

    fecha_hoy = new Date();
    ahora_ano = fecha_hoy.getYear();
    ahora_mes = fecha_hoy.getMonth();
    ahora_dia = fecha_hoy.getDate();
    edad = (ahora_ano + 1900) - ano;

      if ( ahora_mes < (mes - 1)){
        edad--;
     }
     if (((mes - 1) == ahora_mes) && (ahora_dia < dia)){
       edad--;
     }
     if (edad > 1900){
       edad -= 1900;
     }

      return edad;
    }
}

    scope.genero = function(genero){
      if (genero == "man") {
        return 'H';
      }
      else if (genero == "woman") {
        return 'M';
      }
    };

    scope.createUsedService = function(person, service) {
      $http.post('/used_services.json',
      {used_service: {person_id: person.id, service_id: service.id, created_at: scope.person.selected_day }} )
        .success(function(data) {
          person.used_services_of_selected_day_id[service.name] = data.used_service.id;
        })
    };

    scope.deleteUsedService = function(person, service) {
      $http.delete('/used_services/' + person.used_services_of_selected_day_id[service.name] + '.json')
        .success(function(data) {
          person.used_services_of_selected_day_id[service.name] = null;
        })
    };

    // método que cambia a check si está desmarcado y viceversa
    scope.changeCheckbox = function(person, service) {
      if(person.used_services_of_selected_day_id[service.name])
        scope.deleteUsedService(person, service);
      else
      scope.createUsedService(person, service)
    };

    scope.getService = function(name) {
      var result = $.grep(scope.services, function(e){ return e.name == name; });
      return result[0];
    };

    scope.alertClass = function(person) {
      if (person.pending_alerts.length > 0){
        if (person.pending_alerts[0].type == 'punishment') {
          return 'danger';
        }
        else if (person.pending_alerts[0].type == 'warning') {
          return 'warning';
        }
        else if (person.pending_alerts[0].type == 'advice') {
          return 'success';
        }
        else {
          return '';
        }
      }
    };

    scope.todayDate = function() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!

      var yyyy = today.getFullYear();
      if(dd<10){
        dd='0'+dd
      }
      if(mm<10){
        mm='0'+mm
      }
      var today = dd+'/'+mm+'/'+yyyy;

      return today;
    };

    scope.guardarSandwiches = function() {

      $http.post('/sandwiches.json', {amount: scope.sandwiches, created_at: scope.person.selected_day})
        .success( function(data) {
          $state.go("personas", { alertaGuardado: 'true' })
        }).error( function(data) {
          scope.errors = data.errors;

          for(var error in scope.errors) {
            if(scope.errors[error]) {
              $("#Input" + $rootScope.capitalize(error))
                .tooltip({trigger: 'manual', title: scope.errors[error].join(', ')}).tooltip('show');
            }
          }
        });
    };


  }]);

  app.controller('PersonController',  ['$http', '$timeout', '$state', '$rootScope', function($http, $timeout, $state, $rootScope ) {
    var scope = this;
    scope.person = {};

    $http.get('/people/' + $state.params.id + '.json')
    .success(function(data){
      scope.person = data.person;
      $rootScope.prolibertas = scope.person.name + ' ' + scope.person.surname
    });

    scope.genero = function(genero){
      if (genero == "man") {
        return 'Hombre';
      }
      else if (genero == "woman") {
        return 'Mujer';
      }
    };

    scope.asistencia = function(value) {
      if (value === 0) { return 'Primera vez'; }
      else if(value === 1) { return 'Habitual'; }
      else if(value === 2) { return 'Reincidente'; }
    };

    scope.documentacion = function(value) {
      if (value === 0) { return 'Indocumentado'; }
      else if(value === 1) { return 'Regularizado'; }
      else if(value === 2) { return 'Sin Regularizar'; }
    };

    scope.vivienda = function(value ) {
      if (value === 0) { return 'Sin vivienda'; }
      else if(value === 1) { return 'Vivienda'; }
      else if(value === 2) { return 'Infravivienda'; }
    };

    scope.si_o_no = function(value) {
      if (value === 0) { return 'No'; }
      else if(value === 1) { return 'Si'; }
    };

    scope.residencia = function(value) {
      if (value === 0) { return 'De paso'; }
      else if(value === 1) { return 'Residente'; }
    };

    scope.provincia = function(value ) {
      if (value === 'Alava') { return 'Álava'; }
      else if(value === 'Albacete') { return 'Albacete'; }
      else if(value === 'Alicante') { return 'Alicante'; }
      else if(value === 'Almeria') { return 'Almería'; }
      else if(value === 'Asturias') { return 'Asturias'; }
      else if(value === 'Avila') { return 'Ávila'; }
      else if(value === 'Badajoz') { return 'Badajoz'; }
      else if(value === 'Baleares') { return 'Baleares'; }
      else if(value === 'Barcelona') { return 'Barcelona'; }
      else if(value === 'Burgos') { return 'Burgos'; }
      else if(value === 'Caceres') { return 'Cáceres'; }
      else if(value === 'Cadiz') { return 'Cadiz'; }
      else if(value === 'Cantabria') { return 'Cantabria'; }
      else if(value === 'Castellon') { return 'Castellon'; }
      else if(value === 'Ceuta') { return 'Ceuta'; }
      else if(value === 'Ciudad_Real') { return 'Ciudad Real'; }
      else if(value === 'Cordoba') { return 'Córdoba'; }
      else if(value === 'Cuenca') { return 'Cuenca'; }
      else if(value === 'Girona') { return 'Girona'; }
      else if(value === 'Granada') { return 'Granada'; }
      else if(value === 'Guadalajara') { return 'Guadalajara'; }
      else if(value === 'Guipuzcoa') { return 'Guipuzcoa'; }
      else if(value === 'Huelva') { return 'Huelva'; }
      else if(value === 'Huesca') { return 'Huesca'; }
      else if(value === 'Jaen') { return 'Jaén'; }
      else if(value === 'La_Coruna') { return 'La Coruña'; }
      else if(value === 'La_Rioja') { return 'La Rioja'; }
      else if(value === 'Las_Palmas') { return 'Las Palmas'; }
      else if(value === 'Leon') { return 'León'; }
      else if(value === 'Lerida') { return 'Lérida'; }
      else if(value === 'Lugo') { return 'Lugo'; }
      else if(value === 'Madrid') { return 'Madrid'; }
      else if(value === 'Malaga') { return 'Málaga'; }
      else if(value === 'Melilla') { return 'Melilla'; }
      else if(value === 'Murcia') { return 'Murcia'; }
      else if(value === 'Navarra') { return 'Navarra'; }
      else if(value === 'Orense') { return 'Orense'; }
      else if(value === 'Palencia') { return 'Palencia'; }
      else if(value === 'Pontevedra') { return 'Pontevedra'; }
      else if(value === 'Salamanca') { return 'Salamanca'; }
      else if(value === 'Segovia') { return 'Segovia'; }
      else if(value === 'Sevilla') { return 'Sevilla'; }
      else if(value === 'Soria') { return 'Soria'; }
      else if(value === 'Tarragona') { return 'Tarragona'; }
      else if(value === 'Tenerife') { return 'Tenerife'; }
      else if(value === 'Teruel') { return 'Teruel'; }
      else if(value === 'Toledo') { return 'Toledo'; }
      else if(value === 'Valencia') { return 'Valencia'; }
      else if(value === 'Valladolid') { return 'Valladolid'; }
      else if(value === 'Vizcaya') { return 'Vizcaya'; }
      else if(value === 'Zamora') { return 'Zamora'; }
      else if(value === 'Zaragoza') { return 'Zaragoza'; }
      else { return value; }
    };

    scope.destroyPerson = function(person) {
      var confirmed = confirm('¿Desea borrar a ' + person.name + ' ' + person.surname + '?');
      if (confirmed) {
        $http.delete('/people/' + person.id + '.json').success(function(data) {
          $state.go("personas", { alertaBorrado: 'true' })
        });
      }
    };

  }]);

  app.controller('PersonFormController', ['$http', '$filter', '$state', '$rootScope',function($http, $filter, $state, $rootScope) {
    var scope = this;
    // Formulario
    scope.personForm = {};

    // Fecha de entrada a día de hoy
    scope.personForm.entry =  $filter('date')(new Date(), 'dd/MM/yyyy');

    // Errores
    scope.errors = {};

    // Paises del mundo
    scope.countries = ["España","Marruecos","Rumanía","Afganistán","Islas Äland","Albania","Algeria","Samoa Americana","Andorra","Angola","Anguila","Antártida","Antigua y Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbayán","Bahamas","Bahrein","Bangladesh","Barbados","Bielorrusia","Bélgica","Belice","Benín","Islas Bermudas","Bhután","Bolivia, Estado plurinacional de","Islas BES (Caribe Neerlandés)","Bosnia y Herzegovina","Botsuana","Isla Bouvet","Brasil","Británico del Océano Índico, Territorio","Brunei Darussalam","Bulgaria","Burquina Faso","Burundi","Camboya","Camerún","Canadá","Cabo Verde","Islas Caimán","República Centro-africana","Chad","Chile","China","Isla de Navidad","Islas Cocos (Keeling)","Colombia","Comores, Islas","Congo","Islas Cook","Costa Rica","Costa de Marfíl","Croacia","Cuba","Curasao","Chipre","República Checa","Dinamarca","Yibuti","Dominica","República Dominicana","Ecuador","Egipto","El Salvador","Guinea Ecuatorial","Eritrea","Estonia","Etiopía","Islas Falkland (Malvinas)","Islas Feroe","Fiyi","Finlandia","Francia","Guayana Francesa","Polinesia Francesa","Territorios Franceses del Sur","Gabón","Gambia","Georgia","Alemania","Ghana","Gibraltar","Grecia","Groenlandia","Granada","Guadalupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haití","Islas Heard e Islas McDonald","Santa Sede (Ciudad Estado del Vaticano)","Honduras","Hong Kong","Hungría","Islandia","India","Indonesia","Irán, República islámica de","Irak","Irlanda","Isla de Man","Israel","Italia","Jamaica","Japón","Jersey","Jordania","Kazajistán","Kenia","Kiribati","Corea","Kuwait","Kirgizstán","Lao","Letonia","Líbano","Lesoto","Liberia","Libia","Liechtenstein","Lituania","Luxemburgo","Macao","Macedonia","Madagascar","Malawi","Malasia","Islas Maldivas","Mali","Malta","Islas Marshall","Martinica","Mauritania","Mauricio","Mayotte","México","Micronesia","Moldavia","Mónaco","Mongolia","Montenegro","Montserrat","Mozambique","Birmania","Namibia","Nauru","Nepal","Países Bajos","Nueva Caledonia","Nueva Zelanda","Nicaragua","Niger","Nigeria","Niue","Isla Norfolk","Islas Marianas del Norte","Noruega","Omán","Pakistán","Palau","Palestina","Panamá","Papúa Nueva Guinea","Paraguay","Perú","Filipinas","Pitcairn","Polonia","Portugal","Puerto Rico","Qatar","Reunión","Federación Rusa","Ruanda","San Bartolomé","Santa Elena, Ascensión y Tristán de Acuña","San Cristobo y Nevis","Santa Lucía","San Martín (zona francesa)","San Pedro y Miquelon","San Vicente y las Granadinas","Samoa","San Marino","Santo Tomé y Príncipe","Arabia Saudí","Senegal","Serbia","Seychelles","Sierra Leona","Singapur","Isla de San Martín (zona holandesa)","Eslovaquia","Eslovenia","Islas Salomón","Somalia","Suráfrica","Georgia del Sur e Islas Sandwitch del Sur","Sri Lanka","Sudán","Surinám","Sudán del Sur","Svalbard y Jan Mayen","Swazilandia","Suecia","Suiza","República árabe de Siria","Taiwán","Tadjikistán","Tanzania","Tailandia","Timor Oriental","Togo","Tokelau","Tonga","Trinidad y Tobago","Tunez","Turquía","Turkmenistán","Turks y Caicos, Islas","Tuvalu","Uganda","Ucrania","Emiratos Árabes Unidos","Reino Unido","Estados Unidos","Islas menores exteriores de Estados Unidos","Uruguay","Uzbekistán","Vanuatu","Venezuela, República Bolivariana de","Vietnam","Islas Vírgenes, Británicas","Islas Vírgenes, de EEUU","Wallis y Futuna","Sahara Occidental","Yemen","Zambia","Zimbabue"];

    // ZTS Zonas de Trabajo Social
    scope.zonas = ["Norte-Sierra", "Levante", "Sureste (Fuensanta)", "Centro (La Ribera)", "Sur",
      "Poniente Sur", "Poniente Norte (La Foggara) ", "Noroeste", "Periferia-Alcolea",
      "Periferia-Villarrubia", "Periferia-Santa Cruz", "Periferia-Cerro Muriano",
      "Periferia-El Higuerón", "Periferia-Trassierra", "ETF 1", "ETF 2", "ETF 3", "ETF 4"];

    $('.datepicker').datetimepicker({
      locale: 'es',
      format: 'DD/MM/YYYY'
    });

    scope.change = function(field) {
      if(scope.errors[field.toLowerCase()]) {
        $("#Input" + field).tooltip('destroy');
        scope.errors[field.toLowerCase()] = false
      }
    };

    scope.formDates = function() {
      scope.personForm.birth  = $( '#InputBirth'  ).val();
      scope.personForm.entry  = $( '#InputEntry'  ).val();
      scope.personForm.output = $( '#InputOutput' ).val();
    };

    scope.guardarPersona = function() {
      scope.formDates();

      if(scope.personForm.city)
        scope.personForm.city.toUpperCase();

      $http.post('/people.json', {person: scope.personForm})
        .success(function(data){
          $state.go('personas', { alertaCreado: 'true' });
        })
        .error(function(data) {
          scope.errors = data.errors;

          for(var error in scope.errors) {
            if(scope.errors[error]) {
              $("#Input" + $rootScope.capitalize(error))
                .tooltip({trigger: 'manual', title: scope.errors[error].join(', ')}).tooltip('show');
            }
          }
        });
    };

    scope.actualizarPersona = function() {
      scope.formDates();

      if(scope.personForm.city)
        scope.personForm.city.toUpperCase();

      $http.put("/people/" + $state.params.id + ".json",{person: scope.personForm})
        .success(function() {
          $state.go("persona", {id: $state.params.id});
          scope.errors = {};
        })
        .error(function(data) {
          scope.errors = data.errors;

          for(var error in scope.errors) {
            if(scope.errors[error]) {
              $("#Input" + $rootScope.capitalize(error))
                .tooltip({trigger: 'manual', title: scope.errors[error].join(', ')}).tooltip('show');
            }
          }
        });
    };

    scope.actionForm = scope.guardarPersona;

    if ($state.params.id != undefined) {
      scope.actionForm = scope.actualizarPersona;
      $http.get('/people/' + $state.params.id + '.json')
      .success(function(data) {
        scope.personForm = data.person;
        $rootScope.prolibertas = "Editar expediente " + scope.personForm.exp;
      });
    }
    else {
      scope.actionForm = scope.guardarPersona;
      $rootScope.prolibertas = "Crear Persona"
    }

  }]);

  app.controller('PersonReportController',  ['$http', '$timeout', '$state', '$rootScope', function($http, $timeout, $state, $rootScope ) {
    var scope = this;
    scope.services = {};
    scope.person = {};

    $http.get('/people/' + $state.params.id + '.json')
    .success(function(data){
      scope.person = data.person;
    });

    $http.get('/people/' + $state.params.id + '/individual_report.json')
    .success(function(data){
      scope.services = data;
    });

  }]);

  app.controller('PersonFilesController',  ['$http', '$timeout', '$state', '$rootScope', '$upload', function($http, $timeout, $state, $rootScope, $upload ) {
    var scope = this;
    scope.person = {};
    scope.person.attachments = [];
    scope.person.attachment = {};

    $http.get('/people/' + $state.params.id + '.json')
    .success(function(data){
      scope.person = data.person;
    });

    $http.get('/people/' + $state.params.id + '/attachments.json')
    .success(function(data){
      scope.person.attachments = data.attachments;
    });

    scope.adjuntar = function(add) {

      $upload.upload({
        url: "/people/" + $state.params.id + "/attachments.json",
        method: "POST",
        fields: scope.person.attachment,
        file: scope.person.attachment.file,
        fileFormDataName: "attachment[file]",
        formDataAppender: function(fd, key, val){
          fd.append('attachment[' + key + ']', val || '');
        }
      })
      .success(function(data) {
          scope.person.attachments.push(data.attachment);
          scope.errors = {};
        })
        .error(function(data) {
          scope.errors = data.errors;

          for(var error in scope.errors) {
            if(scope.errors[error]) {
              $("#Input" + $rootScope.capitalize(error))
                .tooltip({trigger: 'manual', title: scope.errors[error].join(', ')}).tooltip('show');
            }
          }
        });
    };

    scope.removeAttachment = function(attachment) {
      var confirmed = confirm("¿Desea borrar el archivo?");

      if (confirmed) {
        scope.person.attachment = attachment;

        $http.delete('/attachments/' + attachment.id + '.json')
          .success(function(data) {
            var index = scope.person.attachments.indexOf(attachment);
            if (index > -1) {
              scope.person.attachments.splice(index, 1);
            }
        });
      }

    };

  }]);

})();
