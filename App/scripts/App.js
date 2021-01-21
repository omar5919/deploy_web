var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
if (isChrome) {
    'use strict';
    var app = angular.module('APP', ['APPController',
        'APPservice',
        'ui.router',
        'treeControl',
        'ui.bootstrap',
        'ui.select',
        'ngSanitize',
        'daterangepicker',
        'ram.touchspin'
    ]);
    app.config(function ($stateProvider, $urlRouterProvider, $httpProvider, uiSelectConfig) {

        uiSelectConfig.theme = 'select2';
        uiSelectConfig.resetSearchInput = true;
        uiSelectConfig.appendToBody = true;

        let base = window.location.origin;
        let app = $("#hdnAngularApp").val() === '' ? '' : $("#hdnAngularApp").val() + '/';
        let url = base + '/' + app + 'App/views';

        $urlRouterProvider.when('', '/').otherwise('/');
        $stateProvider
            .state('index', {
                url: '/',
                controller: function ($state, $rootScope) {
                    console.log("");
                }
            })
            .state('rtPanelSensibo', {
                url: '/panel_sensibo',
                templateUrl: url + '/Sensibo/panel.html',
                controller: panelSensiboCtrl
            })
            .state('rtConsultaBms', {
                url: '/consulta_bms',
                templateUrl: url + '/Bms/consulta_bms.html',
                controller: consultaBmsCtrl
            })
            .state('rtConsultaBms.inicio', {
                url: '/inicio',
                views: {
                    'opcionesBmsView': {
                        templateUrl: url + '/Bms/opt_bms_ini.html',
                        controller: consultaBmsIniCtrl
                    }
                }
            })
            .state('rtConsultaBms.tarifacion', {
                url: '/tarifacion',
                views: {
                    'opcionesBmsView': {
                        templateUrl: url + '/Bms/tarifacion.html',
                        controller: consultaBmsTarifacionCtrl
                    }
                }
            })
            .state('rtConsultaBms.simulacion', {
                url: '/simulacion',
                views: {
                    'opcionesBmsView': {
                        templateUrl: url + '/Bms/simulacion.html',
                        controller: consultaBmsSimulacionCtrl
                    }
                }
            })
            .state('rtBandejaSolicitud', {
                url: '/bandejasolicitud',
                templateUrl: url + '/Solicitudes/bandeja.html',
                controller: bandejaSolicitudCtrl
            })

            .state('rtRegistroSolicitud', {
                abstract: true,
                url: '/registro_solicitud',
                templateUrl: url + '/Solicitudes/registro_solicitud.htm',
                controller: regSolCtrl
            })
            .state('rtRegistroSolicitud.inicio', {
                url: '/inicio',
                views: {
                    'opcionesSolicitudView': {
                        templateUrl: url + '/Solicitudes/opt_reg_ini.htm',
                        controller: regSolIniCtrl
                    }
                }
            })
            .state('rtRegistroSolicitud.ayuda', {
                url: '/ayuda',
                views: {
                    'opcionesSolicitudView': {
                        templateUrl: url + '/Solicitudes/opt_reg_ayuda.htm',
                        controller: regSolAyudaCtrl
                    }
                }
            })
            .state('rtRegistroSolicitud.wizard', {
                url: '/wizard',
                views: {
                    'opcionesSolicitudView': {
                        templateUrl: url + '/Solicitudes/opt_wizard.htm',
                        controller: regSolWizardCtrl
                    }
                }
            })
            .state('rtRegistroSolicitud.chatboot', {
                url: '/chatboot',
                views: {
                    'opcionesSolicitudView': {
                        templateUrl: url + '/App/views/Solicitudes/opt_chatboot.htm',
                        controller: regSolChatbootCtrl
                    }
                }
            })
            .state('rtRegistroSolicitud.recurrentes', {
                url: '/recurrentes',
                views: {
                    'opcionesSolicitudView': {
                        templateUrl: url + '/Solicitudes/opt_recurrentes.htm',
                        controller: regSolRecurrentesCtrl
                    }
                }
            })
            .state('rtRegistroSolicitud.arbolinmuebles', {
                url: '/arbol',
                views: {
                    'opcionesSolicitudView': {
                        templateUrl: url + '/Solicitudes/opt_arbolinmuebles.htm',
                        controller: regSolArbolInmueblesCtrl
                    }
                }
            })
            .state('rtRegistroSolicitud.bandeja', {
                url: '/badeja',
                views: {
                    'opcionesSolicitudView': {
                        templateUrl: url + '/Solicitudes/opt_bandeja.htm',
                        controller: regSolBandejaCtrl
                    }
                }
            })
            //GESTION DE DISTRIBUCION
            .state('rtRegistroDistribucion', {
                url: '/gd/registro/:id',
                templateUrl: url + '/Distribucion/registro.htm',
                controller: gdRegistroCtrl
            })
            .state('rtDistribucionReportes', {
                url: '/gd/reportes',
                templateUrl: url + '/Distribucion/reportes.html',
                controller: gdReportes
            })
            .state('rtActualizacionOE', {
                url: '/gd/actualizacionoe',
                templateUrl: url + '/Distribucion/actualizacionoe.htm',
                controller: gdActualizacionOeCtrl
            })
            .state('rtBandejaDistribucion', {
                url: '/gd/bandeja/:tipo',
                templateUrl: url + '/Distribucion/bandeja_distribucion.htm',
                controller: gdBandejaDistribucionCtrl
            })
            .state('rtBandejaOrdenEntrega', {
                url: '/gd/bandejaoe',
                templateUrl: url + '/Distribucion/bandeja_oe.htm',
                controller: gdBandejaOeCtrl
            })
            .state('rtMisSolicitudes', {
                url: '/gd/mis_solicitudes',
                templateUrl: url + '/Distribucion/mis_solicitudes.htm',
                controller: gdMisSolicitudesCtrl
            })

            .state('rtMisPendientes', {
                url: '/sol/mis_pendientes',
                templateUrl: url + '/Solicitudes/mis_pendientes.html',
                controller: solMisPendientes
            })
            .state('rtPreguntasFrecuentes', {
                url: '/pf/preguntas_frecuentes',
                templateUrl: url + '/Preguntas/preguntas_frecuentes.html',
                controller: pfPreguntasCtrl
            })
            .state('rtAdmPreguntasFrecuentes', {
                url: '/adm/preguntas_frecuentes',
                templateUrl: url + '/Administrador/preguntas_frecuentes.html',
                controller: admPreguntasFrecuentesCtrl
            });

        $httpProvider.interceptors.push(function ($q, $location, $window) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($window.localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
                    }
                    return config;
                },
                'responseError': function (response) {
                    if (response.status === 401 || response.status === 403) {
                        $location.path('/Index.aspx');
                    }
                    return $q.reject(response);
                }
            };
        });

    });
    app.run(function ($rootScope, $interval, $window) {
        moment.locale('es');
        $rootScope.appurl = $("#hdnAngularApp").val();
        $rootScope.appapi = $("#hdnAngularApi").val();
        const _s = $("#hdnNgUsuario").val();
        const _clave = $("#hdnNgClave").val();
        const _c = $("#hdnNgCliente").val();
        if (_s !== "") $rootScope._usuario = JSON.parse($("#hdnNgUsuario").val());
        if (_clave !== "") $rootScope._clave = _clave;
        if (_c !== "") $rootScope._cliente = JSON.parse($("#hdnNgCliente").val());

        $window.localStorage.token = $rootScope._clave;

        var getReloj = function () {
            $rootScope.fecha = moment().format('MMMM Do YYYY, h:mm:ss a');
        }
        $interval(getReloj, 1000);
    });
    app.factory('minimizarContent', function () {
        return {
            load: function () {
                $('.collapse-link').click(function () {
                    var ibox = $(this).closest('div.ibox');
                    var button = $(this).find('i');
                    var content = ibox.find('div.ibox-content');
                    content.slideToggle(200);
                    button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                    ibox.toggleClass('').toggleClass('border-bottom');
                    setTimeout(function () {
                        ibox.resize();
                        ibox.find('[id^=map-]').resize();
                    }, 50);
                });
            }
        }
    });

    app.filter('formatoFecha', function () {
        return function (input) {
            var m = moment(input);
            if (m.isValid())
                return m.fromNow();
            else
                return input;
        }
    });

    app.filter('formatoFecha1', function () {
        return function (input) {
            var m = moment(input);
            if (m.isValid())
                return m.format("DD/MM/YYYY");
            else
                return input;
        }
    });

    app.filter('formatoFecha2', function () {
        return function (input) {
            return new Date(input).format('dd/MM/yyyy');
        }
    });

    app.filter('formatoFechaHora', function () {
        return function (input) {
            return new Date(input).format('dd/MM/yyyy HH:mm');
        }
    });

    app.filter('formatoFechaHoraPeru', function () {
        return function (input) {
            const m = moment(input);
            if (m.isValid())
                return m.format('DD/MM/yyyy h:mm a');
        }
    });

    app.directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
        return {
            //scope: true,   // optionally create a child scope
            link: function (scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    }]);

    app.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);


    app.filter('formatomb', () => {
        return (size) => {
            if (size) {
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                if (size == 0) return '0 Byte';
                var i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
                return Math.round(size / Math.pow(1024, i), 2) + ' ' + sizes[i];
            }
        };
    });
    
    app.filter('calificacion',()=>{
        return (val) => {
            if (val) {
                let calificacion = '';
                switch (val) {
                    case 1:calificacion = 'Su calificación fue de Muy Insatisfecho';break;
                    case 2:calificacion = 'Su calificación fue de Insatisfecho';break;
                    case 3:calificacion = 'Su calificación fue de Neutro';break;
                    case 4:calificacion = 'Su calificación fue de Satisfecho';break;
                    case 5:calificacion = 'Su calificación fue de Muy Satisfecho';break;
                }
                return calificacion;
            }
        };
    });

    app.filter('filtrarUnidadMedida', function () {
        return function (id, list) {
            if (id !== undefined)
                return _.find(list, {'Id': id}).Nombre;
        }
    });

    app.filter('CantidadSeleccionados', function () {
        return (list) => {
            let all = false;
            let selectedList = _.filter(list, { 'Selected': true });
            if (selectedList.length > 0) {
                all = true;
            }
            return !all;
        }
    });
}
