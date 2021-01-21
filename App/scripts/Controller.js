var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
if (isChrome) {
    'use strict';
    var app = angular.module('APPController', [
        'ui.router',
        'treeControl',
        'ui.bootstrap',
        'ui.select',
        'ngSanitize',
        'ui.slimscroll',
        'oitozero.ngSweetAlert',
        'cp.ngConfirm',
        'thatisuday.dropzone',
        'puiTreeView',
        'ngAnimate',
        'com.2fdevs.videogular',
        'com.2fdevs.videogular.plugins.controls',
        'com.2fdevs.videogular.plugins.overlayplay',
        'com.2fdevs.videogular.plugins.poster'
    ]);
    app.controller('BodyCtrl', function ($scope, $rootScope) {
        console.log("Inicio NgEdi");
    });

    function dashboardCtrl($scope, $rootScope) {
    }

    function dashboardDefaultCtrl($scope) {
        console.log('');
    }

    function solicitudCtrl($scope, $state, SOLICITUD) {
        $scope.complete = false;
        $scope.nuevo_actor = function () {
            $state.go('nuevo_actor');
        };
        SOLICITUD.setSolicitud().then(function (res) {
            if (res.type) {
                var tabla = $('#example').DataTable({
                    dom: 'Bfrtip',
                    buttons: [
                        {
                            text: '<i class="fa fa-plus" aria-hidden="true"></i> Nuevo Actor',
                            action: function (e, dt, node, config) {
                                $scope.nuevo_actor();
                            }
                        },
                        {
                            extend: 'excelHtml5',
                            title: 'Actores de Cuenca'
                        },
                        {
                            extend: 'pdfHtml5',
                            download: 'open',
                            title: 'Actores de Cuenca'
                        }
                    ],
                    responsive: true,
                    select: true,
                    language: {
                        url: '../PUBLIC/js/datatables/es.json'
                    },
                    data: res.data,
                    columns: [{
                        title: "Nombre del Actor",
                        "data": "NOMBRE"
                    }, {
                        title: "AAA",
                        "data": "NOMBRE_AAA"
                    }, {
                        title: "ALA",
                        "data": "NOMBRE_ALA"
                    }]
                });
                tabla.on('select', function (e, dt, type, indexes) {
                    var rowData = tabla.rows(indexes).data().toArray();

                    $state.go('actores.edit', {
                        id: rowData[0].ID
                    });
                });
                $scope.complete = true;
            }
        });
    }

    function solMisPendientes($scope, $rootScope, $window, SOLICITUD, RESOURCES) {
        $('#BodyAsp').hide();
        $scope.cargando = false;
        $scope.mostrarOpciones = true;
        $scope.seleccionados = [];
        $scope.lista = [];
        $scope.selected = {};
        $scope.maxSize = 5;
        $scope.bigTotalItems = 0;
        $scope.bigCurrentPage = 1;
        $scope.filtros = {
            fechas: {
                startDate: moment().subtract(1, 'months'),
                endDate: moment()
            }
        };

        $scope.conformidad = function () {

        }

        $scope.abrirST = function (x) {
            RESOURCES.guardarSesion(x.Id).then((res) => {
                if (res.TipoResultado === 1) {
                    $window.location.href = '../../../Interfaces/Solicitudes/RegistroSolicitud.aspx?TipoSolicitud=false';
                }
            });
        }

        $scope.aprobar = function () {
            Swal.queue([{
                title: 'EDI',
                showCancelButton: true,
                confirmButtonText: 'Aprobar',
                text: 'Esta seguro en aprobar?',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    const req = {
                        'ListIdsSolicitud': _.map($scope.lista.filter(x => x.Selected === true), "Id"),
                        'Aprobar': true,
                        'MotivoRechazo': ''
                    };
                    return SOLICITUD.aprobarRechazarMasiva(req).then(res => {
                        if (res.TipoResultado === 2) Swal.insertQueueStep(res.Mensaje);
                        if (res.TipoResultado === 1) {
                            $scope.obtener();
                            $scope.mostrarOpciones = true;
                            $scope.seleccionados = [];
                            Swal.insertQueueStep(res.Mensaje);
                        }
                    });
                }
            }]);
        }
        $scope.rechazar = function () {
            Swal.queue([{
                title: 'EDI',
                input: 'text',
                showCancelButton: true,
                confirmButtonText: 'Rechazar',
                text: 'Esta seguro en rechazar?',
                showLoaderOnConfirm: true,
                preConfirm: (val) => {
                    const req = {
                        'ListIdsSolicitud': _.map($scope.lista.filter(x => x.Selected === true), "Id"),
                        'Aprobar': false,
                        'MotivoRechazo': val
                    };
                    return SOLICITUD.aprobarRechazarMasiva(req).then(res => {
                        if (res.TipoResultado === 2) Swal.insertQueueStep(res.Mensaje);
                        if (res.TipoResultado === 1) {
                            $scope.obtener();
                            $scope.mostrarOpciones = true;
                            $scope.seleccionados = [];
                            Swal.insertQueueStep(res.Mensaje);
                        }
                    });
                }
            }]);
        }

        $scope.selectAll = function (x) {
            _.map($scope.lista, (a) => {
                a.Selected = x;
            });
        };

        $scope.obtener = function () {
            $scope.cargando = true;
            const req = {
                filtros: {
                    IdCliente: $rootScope._cliente.Id,
                    FechaDesde: $scope.filtros.fechas.startDate.format('YYYY/MM/DD'),
                    FechaHasta: $scope.filtros.fechas.endDate.format('YYYY/MM/DD')
                },
                paginacion: {cantidad: 10, NumeroPagina: this.bigCurrentPage}
            };
            SOLICITUD.getObtenerMisPendientes(req).then((res) => {
                if (res.TipoResultado === 1) {
                    $scope.bigTotalItems = res.paginacion.TotalRegistros;
                    $scope.lista = res.Lista;
                }
                $scope.cargando = false;
            });
        }

        $scope.obtener();

    }

    function regSolCtrl($scope, $state, $http, $rootScope, $interval, minimizarContent, $uibModal, $ngConfirm, toast, $q, RESOURCES) {
        $('#BodyAsp').hide();
        minimizarContent.load();
        $scope.sol = {};
        $scope.solBase = {};
        $scope.Clientes = [];
        $scope.TipoSolicitud = [];
        $scope.Solicitante = [];
        $scope.GrupoUnidad = [];
        $scope.Problema = [];
        $scope.inmuebles = [];
        $scope.edificios = [];
        $scope.niveles = [];
        $scope.ambientes = [];
        $scope.TipoRiesgo = [];
        $scope.listaAprobadores = [];
        $scope.Equipos = [];
        $scope.reglas = {};
        $scope.filtro_arbol = {
            buscarInmuebleEdificioNivelModel: '',
            buscarGrupoUnidadModel: ''
        }
        $scope.abrirArbolInmuebles = false;
        $scope.status = {
            abrirInmuebles: false,
            abrirGrupoUnidad: false
        }

        $scope.validarGrupoUnidadMantenimiento = {};

        //VALIDACIONES
        let valOpciones = {
            title: '',
            content: '',
            placement: 'right',
            animation: 'pop',
            trigger: 'manual',
            closeable: true,
            multi: true
        }
        $('#valCliente').webuiPopover(Object.assign(valOpciones, {title: 'Error!', content: 'Cliente!'}));
        $('#valInmueble').webuiPopover(Object.assign(valOpciones, {title: 'Error!', content: 'Inmueble!'}));
        $('#valCorreo').webuiPopover(Object.assign(valOpciones, {title: 'Error!', content: 'Dato importante!'}));

        $scope.imagen_solicitante = [];

        $scope.output = {};

        RESOURCES.getInfoBaseSolicitud().then((res) => {
            $scope.solBase = res;
            $scope.inmuebleEdificioNivel = {
                idinmueble: res.IdInmueble,
                idedificio: res.IdEdificio,
                idnivel: res.IdNivel,
                idambiente: 0,
                nombre: res.Inmueble,
                nombreEdificio: res.Edificio,
                nombreNivel: res.Nivel
            }
            $scope.sol.correo = res.Email;
            $scope.sol.telefono = res.TelefonoUsuario;
            $scope.buscarInmuble(res.Edificio);
            $scope.obtenerSolicitante($rootScope._usuario.Nombre);
            $scope.obtenerImagenSolicitante({Id: $rootScope._usuario.Id});
            RESOURCES.getClientesPorUsuario().then((res) => {
                $scope.Clientes = res.ListaEntidadComun;
                $scope.sol.cliente = _.find($scope.Clientes, {Id: $scope.solBase.IdCliente});
            });
            RESOURCES.getTipoSolicitud({idcliente: $scope.solBase.IdCliente}).then((res) => {
                $scope.TipoSolicitud = res.ListaTipoSolicitudDto;
            });
        });

        $scope.obtenerSolicitante = function (search) {
            if (search !== "" && search.length > 2)
                return RESOURCES.getSolicitante({
                    idcliente: $scope.sol.cliente ? $scope.sol.cliente.Id : $rootScope._cliente.Id,
                    nombre: search
                }).then((res) => {
                    if (res.ListaUsuarios.length > 0) {
                        $scope.sol.solicitante = _.find(res.ListaUsuarios, {Id: $rootScope._usuario.Id});
                    }
                    $scope.Solicitante = res.ListaUsuarios;
                });
        };

        $scope.inmuebleEdificioNivel = {};
        $scope.arbolInmueblesModel = [];
        $scope.inmueble_edificio_nivel = {};

        $scope.arbolGrupoUnidadModel = [];

        $scope.grupo_unidad = {};
        $scope.cargando = false;
        $scope.cargandoGrupoUnidad = false;
        $scope.search = '';

        $scope.focusBuscarGrupoUnidad = false;

        $scope.buscarInmuble = function (val) {
            if (val) {
                $scope.cargando = true;
                RESOURCES.getArbolInmuebles({
                    IdCliente: $scope.solBase.IdCliente,
                    IdUsuario: $rootScope._usuario.Id,
                    nombre: val
                }).then((res) => {
                    $scope.arbolInmueblesModel = res.Lista;
                    $scope.cargando = false;
                });
            }
        }

        $scope.seleccionArbolInmuebles = function (node, expanded, $parentNode, $index, $first, $middle, $last, $odd, $even, $path) {
            $scope.inmueble_edificio_nivel = $path().map(function (node) {
                return {id: node.Id, nombre: node.label.trim(), nivel: node.nivel}
            });
            var _inm = _.find($scope.inmueble_edificio_nivel, {nivel: 1});
            var _edi = _.find($scope.inmueble_edificio_nivel, {nivel: 2});
            var _nvl = _.find($scope.inmueble_edificio_nivel, {nivel: 3});
            var _amb = _.find($scope.inmueble_edificio_nivel, {nivel: 4});
            $scope.inmuebleEdificioNivel = {
                idinmueble: _inm.id,
                idedificio: _edi ? _edi.id : 0,
                idnivel: _nvl ? _nvl.id : 0,
                idambiente: _amb ? _amb.id : 0,
                nombre: _inm.nombre,
                nombreEdificio: _edi ? _edi.nombre : '',
                nombreNivel: _nvl ? _nvl.nombre : '',
                nombreAmbiente: _amb ? _amb.nombre : '',
            }
            $scope.abrirArbolInmuebles = !$scope.abrirArbolInmuebles;
        };
        $scope.buscarGrupoUnidad = function (obj) {
            if (obj) {
                if ($scope.sol.tiposolicitud) {
                    $scope.arbolGrupoUnidadModel = undefined;
                    $scope.cargandoGrupoUnidad = true;
                    RESOURCES.getArbolGrupoUnidad({
                        IdCliente: $scope.solBase.IdCliente,
                        IdTipoSolicitud: $scope.sol.tiposolicitud.Id,
                        Nombre: obj,
                        Origen: 1,
                        UsuarioLogin: $rootScope._usuario.Id
                    }).then((res) => {
                        $scope.arbolGrupoUnidadModel = res.Lista;
                        $scope.cargandoGrupoUnidad = false;
                    });
                } else {
                    toast.info('Info Edi!', 'Seleccione un tipo de solicitud!');
                }
            }
        }
        $scope.seleccionArbolGrupoUnidad = function (node, expanded, $parentNode, $index, $first, $middle, $last, $odd, $even, $path) {
            $scope.grupo_unidad = $path().map(function (node) {
                return {id: node.Id, nombre: node.label.trim(), nivel: node.nivel}
            });
            const _grupo = _.find($scope.grupo_unidad, {nivel: 1});
            const _unidad = _.find($scope.grupo_unidad, {nivel: 2});
            const _prob = _.find($scope.grupo_unidad, {nivel: 3});
            $scope.grupoUnidad = {
                idgrupo: _grupo.id,
                idunidad: _unidad ? _unidad.id : 0,
                idproblema: _prob ? _prob.id : 0,
                nombregrupo: _grupo.nombre,
                nombreunidad: _unidad ? _unidad.nombre : "",
                nombreproblema: _prob ? _prob.nombre : ""
            }

            if ($scope.sol.tiposolicitud && $scope.sol.tiposolicitud.EsFlujoRequerimiento) {
                RESOURCES.postObtenerAprobadores({
                    IdCliente: $scope.solBase.IdCliente,
                    IdTipoSolicitud: $scope.sol.tiposolicitud.Id,
                    IdInmueble: $scope.inmuebleEdificioNivel.idinmueble,
                    IdEdificio: $scope.inmuebleEdificioNivel.idedificio,
                    IdNivel: $scope.inmuebleEdificioNivel.idnivel,
                    IdGrupoMantenimiento: $scope.grupoUnidad.idgrupo,
                    IdUnidadMantenimiento: $scope.grupoUnidad.idunidad
                }).then((res) => {
                    $scope.reglas = res;
                    if (res.EsNecesarioParaElRegistro) {
                        if (res.ListAprobadores.length === 0) {
                            toast.err('Error!', 'No existe Aprobador de requerimientos');
                            return;
                        } else {

                            $scope.sol.aprobadores = res.ListAprobadores;

                            /*if (res.MostrarSeleccionDeAprobadores) {
                                //MOSTRAR POPUP CON APROBADORES PARA SELECCION
                                $scope.listaAprobadores = res.ListAprobadores;
                            } else {
                                $scope.sol.aprobadores = res.ListAprobadores;
                            }*/
                        }
                    }
                });
            }

            if ($scope.grupoUnidad.idunidad !== 0) {
                //buscar equipos
                const req = {
                    IdCliente: $scope.solBase.IdCliente,
                    IdInmueble: $scope.inmuebleEdificioNivel.idinmueble,
                    IdUnidadMantenimiento: $scope.grupoUnidad.idunidad,
                    Nombre: ""
                }
                RESOURCES.postBuscarEquipoXnombre(req).then((res) => {
                    $scope.Equipos = res.ListaEquipoSolicitudDto;
                });
                RESOURCES.validarGrupoUnidad($scope.grupoUnidad.idunidad).then((res) => {
                    $scope.validarGrupoUnidadMantenimiento = res;
                    if (res.Mensaje) toast.info('Info Edi!', res.Mensaje);
                });
            } else {
                toast.info('Info Edi!', 'Seleccione Unidad de Mantenimiento!');
            }

        }
        $scope.expandedNodes = [];
        $scope.selectedFood = null;
        $scope.cambioCliente = function (obj) {
            //LIMPIAR LO PRE SELECCIONADO
            $scope.limpiar();
            //CAMBIA CLIENTE MUESTRA LOS TIPOS PARA EL CLIENTE
            $scope.solBase.IdCliente = obj.Id;
            RESOURCES.getTipoSolicitud({idcliente: obj.Id}).then((res) => {
                $scope.TipoSolicitud = res.ListaTipoSolicitudDto;
            });
        }
        $scope.cambioTipoSolicitud = function (obj) {
            $scope.grupoUnidad = undefined;
            $scope.arbolGrupoUnidadModel = undefined;
            $scope.buscarGrupoUnidadModel = undefined;
            if (obj.Mensaje) toast.info('Info Edi!', obj.Mensaje);
        }
        $scope.limpiar = function () {
            if ($scope.sol.id) {
                $scope.dzMethods.removeAllFiles(true);
                $scope.sol.id = null;
                $scope.sol.codigo = null;
                $scope.adj.ListArchivos = [];
            }
            //inmuebles
            $scope.inmuebleEdificioNivel = undefined;
            $scope.arbolInmueblesModel = undefined;
            $scope.buscarInmueblesModel = '';
            $scope.filtro_arbol.buscarInmuebleEdificioNivelModel = undefined;
            $scope.filtro_arbol.buscarGrupoUnidadModel = undefined;
            //tipo de solicitud
            $scope.sol.tiposolicitud = undefined;
            //grupo unidad - clasificacion del problema
            $scope.grupoUnidad = undefined;
            $scope.arbolGrupoUnidadModel = undefined;
            $scope.buscarGrupoUnidadModel = undefined;
            $scope.Equipos = [];

            $scope.sol.descripcion = '';
        }
        $scope.cambioGrupoUnidad = function (obj) {
            /*RESOURCES.getClasificacionDelProblema({
                idgrupo: obj.IdGrupoMantenimiento,
                idunidad: obj.IdUnidadMantenimiento
            }).then((res) => {
                $scope.Problema = res.ListaEntidadComun;
            });*/
        }
        $scope.obtenerImagenSolicitante = function (obj) {
            if (obj) {
                const req = {
                    CodigoTabla: 238,
                    IdEntidad: obj.Id,
                    IdCategoria: 294,
                    NumeroGrupo: 0,
                    RetornarAdjuntosEnBytes: true
                };
                RESOURCES.postObtenerAdjunto(req).then((res) => {
                    $scope.imagen_solicitante = res.ListAdjuntos;
                });
                $scope.sol.correo = obj.Email ? obj.Email : $scope.sol.correo;
                $scope.sol.telefono = obj.Telefono ? obj.Telefono : $scope.sol.telefono;
            }
        }
        $scope.adjuntos = [];
        let host = "http://localhost:4950";
        $scope.dzOptions = {
            url: host + '/Adjunto/Guardar',
            paramName: 'photo',
            maxFilesize: '10',
            acceptedFiles: '.jpg,.jpeg,.png,.pdf,.xlsx',
            addRemoveLinks: true,
            autoProcessQueue: false,
            uploadMultiple: true
        };
        $scope.adj = {
            CodigoTabla: 233,
            IdCategoria: 0,
            NumeroGrupo: 3,
            IdEntidad: $scope.sol.id,
            ListArchivos: [],
            Origen: 1,
            UsuarioLogin: $rootScope._usuario.Id
        }
        $scope.dzCallbacks = {
            'addedfiles': function (files) {
                console.log(files);
            },
            'removedfile': function (file) {
                _.remove($scope.adjuntos, file);
            },
            'addedfile': function (file) {
                console.log(file);
                $scope.adjuntos.push(file);
            },
            'success': function (file, xhr) {
                console.log(file, xhr);
            },
            'processingmultiple': function (file, xhr) {
                console.log(file, xhr);
            },
            'error': function (err) {

            },
            'sendingmultiple': function (file, xhr) {
                console.log(file, xhr);
            },
            'completemultiple': function (file, xhr) {
                console.log(file, xhr);
            },
            'sending': function (file, xhr, formData) {

            }
        };
        $scope.dzMethods = {};
        $scope.adj = {
            CodigoTabla: 233,
            IdCategoria: 0,
            NumeroGrupo: 3,
            IdEntidad: $scope.sol.id,
            ListArchivos: [],
            Origen: 1,
            UsuarioLogin: $rootScope._usuario.Id
        }
        $scope.removeNewFile = function () {
            $scope.dzMethods.removeFile($scope.newFile);
        }
        $scope.convertir = function (file) {
            return new Promise((resolve, reject) => {
                var reader = new FileReader();
                var fileByteArray = [];
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        var arrayBuffer = evt.target.result,
                            array = new Uint8Array(arrayBuffer);
                        for (var i = 0; i < array.length; i++) {
                            fileByteArray.push(array[i]);
                        }
                        resolve(fileByteArray);
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        }

        $scope.buscarInmuebles = function (search) {
            if (search !== "")
                return RESOURCES.getInmuebles({idcliente: $scope.solBase.IdCliente, filtro: search}).then((res) => {
                    $scope.inmuebles = res.ListaInmueble;
                    $scope.sol.inmueble = _.find($scope.inmuebles, {Id: $scope.solBase.IdInmueble});
                });
        };
        RESOURCES.getTipoRiesgo().then((res) => {
            $scope.TipoRiesgo = res.ListaEntidadComun;
        });
        $scope.nombre = 'Usuario EDI';

        $scope.enviarAdjuntos = async function (solicitudId) {
            if ($scope.sol.solicitante) {
                $scope.adj.IdEntidad = solicitudId;
                $scope.adj.UsuarioLogin = $scope.sol.solicitante.Id;
                var archivos = $scope.dzMethods.getAllFiles();
                for (let i = 0; i < archivos.length; i++) {
                    const base64 = await $scope.convertir(archivos[i]);
                    $scope.adj.ListArchivos.push({Nombre: archivos[i].name, arrArchivo: base64});
                }
            } else {
                $scope.adj.ListArchivos = [];
                $scope.dzMethods.removeAllFiles(true);
                toast.err('Info!', 'Seleccione un solicitante!');
            }
            return RESOURCES.postGuardarAdjunto($scope.adj);
        }

        $scope.guardarSolicitud = function () {

            if ($scope.sol.id) {
                toast.err('Error!', 'Ya existe ticket creado! Limpie la informacion!');
                return;
            }

            if ($scope.inmuebleEdificioNivel.idnivel === 0) {
                toast.err('Error!', 'Es necesario seleccionar un nivel!');
                return;
            }

            if ($scope.sol.tiposolicitud === undefined) {
                toast.err('Error!', 'Es necesario el tipo de solicitud!');
                return;
            }
            if ($scope.inmuebleEdificioNivel === undefined) {
                toast.err('Error!', 'Es necesario el arbol de inmuebles!');
                return;
            }
            if ($scope.grupoUnidad === undefined) {
                toast.err('Error!', 'Es necesario el grupo y unidad!');
                return;
            }
            if ($scope.grupoUnidad.idunidad === 0) {
                toast.err('Error!', 'Es necesario la unidad!');
                return;
            }
            if ($scope.sol.tiposolicitud.EsFlujoRequerimiento) {
                if ($scope.sol.aprobadores === undefined) {
                    toast.err('Error!', 'Es necesario tener al menos un aprobador!');
                    return;
                }
            }
            if ($scope.validarGrupoUnidadMantenimiento.EsObligatorioAdjuntarFormato) {
                if ($scope.validarGrupoUnidadMantenimiento.valor === undefined) {
                    toast.err('Error!', 'Es necesario marcar el check de adjuntos!');
                    return;
                }
            }

            //SOLICITUD
            $scope.req_solicitud = {
                IdCliente: $scope.sol.cliente.Id,
                IdSolicitante: $scope.sol.solicitante.Id,
                TelefonoContacto: $scope.sol.telefono,
                NombreContactoAdicional: "",
                TelefonoContactoAdicional: "",
                IdTipoSolicitud: $scope.sol.tiposolicitud.Id,
                CentroCosto: "ceco prueba",
                IdInmueble: $scope.inmuebleEdificioNivel.idinmueble,
                IdEdificio: $scope.inmuebleEdificioNivel.idedificio,
                IdNivel: $scope.inmuebleEdificioNivel.idnivel,
                IdClasificacionProblema: $scope.grupoUnidad.idproblema,
                IdTipoRiesgo: 0,
                NombreAmbiente: "",
                IdGrupoMantenimiento: $scope.grupoUnidad.idgrupo,
                IdUnidadMantenimiento: $scope.grupoUnidad.idunidad,
                DescripcionCorta: "desc corta",
                DescripcionDetallada: $scope.sol.descripcion,
                ListIdsEquipos: _.map($scope.sol.equipos, 'Id'),
                ListIdAprobadorRequerimiento: $scope.reglas.EsNecesarioParaElRegistro ? _.map($scope.sol.aprobadores, 'Id') : [],
                Origen: 1,
                UsuarioLogin: $rootScope._usuario.Id
            };
            Swal.queue([{
                title: 'Registro de la solicitud',
                showCancelButton: true,
                confirmButtonText: 'Grabar',
                text: 'Se grabara la solicitud. Desea continuar?',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return RESOURCES.postGuardarSolicitud($scope.req_solicitud).then(res => {
                        let msg = '';
                        if (res) {
                            if (res.Codigo) {
                                $scope.sol.id = res.Id;
                                $scope.sol.codigo = res.Codigo;
                                msg = res.Mensaje + '\n Tu ticket generado es el ' + res.Codigo;
                            } else {
                                msg = res.Mensaje;
                            }
                            if (res.TipoResultado === 2) Swal.insertQueueStep(msg);
                            return $scope.enviarAdjuntos(res.Id).then(res => {
                                Swal.insertQueueStep(msg);
                                $scope.limpiar();
                            });
                        }
                    });
                }
            }]);
        }
        $scope.TipoList = [{id: 1, name: 'Tipo 1'}];
        $scope.inmuebleseleccionado = {};
    }

    function bandejaSolicitudCtrl($scope, $state) {
        $("#BodyAsp").hide();
    }

    function regSolIniCtrl($scope, $state) {

    }

    function regSolAyudaCtrl($scope, $sce) {
        $scope.config = {
            sources: [
                {src: $sce.trustAsResourceUrl("https://sistemaedi.com.pe/Assets/video/mejoras.mp4"), type: "video/mp4"},
                {
                    src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"),
                    type: "video/webm"
                },
                {
                    src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"),
                    type: "video/ogg"
                }
            ],
            tracks: [
                {
                    src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                    kind: "subtitles",
                    srclang: "en",
                    label: "English",
                    default: ""
                }
            ],
            theme: "Assets/css/angular/videogular.min.css",
            plugins: {
                poster: "http://www.videogular.com/assets/images/videogular.png"
            },
            poster: "http://www.videogular.com/assets/images/videogular.png",
            analytics: {
                category: "Videogular",
                label: "Main",
                events: {
                    ready: true,
                    play: true,
                    pause: true,
                    stop: true,
                    complete: true,
                    progress: 10
                }
            }
        };
    }

    function regSolWizardCtrl($scope, $state) {
        $scope.totalItems = 64;
        $scope.currentPage = 4;
    }

    function regSolChatbootCtrl($scope, $state) {

    }

    function regSolRecurrentesCtrl($scope, $state) {

    }

    function regSolArbolInmueblesCtrl($scope, $state) {
        $scope.treedata = [];
        $scope.expandedNodes = [$scope.treedata[0], $scope.treedata[1]];
        $scope.selectedFood = null;
        $scope.lastRightClickNode = null;
        $scope.doRightClick = function (node) {
            console.log(node.label);
            $scope.lastRightClickNode = node.label;
        }
        $scope.lastCookedFood = null;
        $scope.doCook = function () {
            $scope.lastCookedFood = $scope.selectedFood.name;
        };
        $scope.lastAction = null;
        $scope.doAction = function (cmd) {
            $scope.lastAction = cmd;
        };
        $scope.isLeaf = function () {
            return $scope.selectedFood && $scope.selectedFood.children.length == 0;
        };
    }

    function regSolBandejaCtrl($scope, $state) {
        var table = $('#tabla').DataTable({
            dom: 'Blfrtip',
            buttons: [
                {
                    text: '<i class="fas fa-paper-plane"></i> Ver',
                    action: function (e, dt, node, config) {
                        Swal.fire({
                            title: 'Cargando...',
                            html: '<div class="sk-spinner sk-spinner-double-bounce"><div class="sk-double-bounce1"></div><div class="sk-double-bounce2"></div></div>',
                            showConfirmButton: false
                        });
                        var fila = table.rows('.selected').data()[0];
                        if (fila != undefined) {
                            $("#").val(fila.Id);
                            document.getElementById("<%=btnhdnir.ClientID %>").click();
                        }
                    }
                },
                {
                    extend: 'excelHtml5',
                    text: 'Exp.Excel'
                },
                {
                    extend: 'pdfHtml5',
                    text: 'Exp.Pdf'
                }
            ],
            initComplete: function () {
                var filas = table.rows('.selected').data().length;
                table.button(1).enable(filas !== 0);
                table.button(2).enable(filas == 1);
            },
            language: {
                url: '../../Assets/js/tablas/i18n.json'
            },
            proccessing: true,
            serverSide: true,
            stateSave: true,
            ajax: {
                url: "../../Handlers/Tablas.ashx",
                data: function (d) {
                    d.filtros = {
                        modulo: "LIMPIEZA",
                        opcion: 6,
                        idsclientes: "1"
                    };
                },
                dataSrc: function (d) {
                    return d.data;
                }
            },
            columns: [
                {data: "RowNum"},
                {title: "Codigo", data: "Codigo"},
                {title: "Inmueble", data: "Inmueble"},
                {title: "Operario", data: "Operario"},
                {title: "Estado", data: "Estado"},
            ]
        });

        $('#tabla tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');
            var filas = table.rows('.selected').data().length;
            var fila = table.rows('.selected').data()[0];
            if (fila == undefined) {
                table.button(1).enable(false);
                table.button(2).enable(false);
            } else {
                table.button(1).enable(filas >= 1);
                table.button(2).enable(filas == 1);
            }
        });
    }

//BMS
    function consultaBmsCtrl($scope, minimizarContent, $rootScope, RESOURCES, BMS, toast) {
        $("#BodyAsp").hide();
        $scope.dataChart = [];
        $scope.chart = {};
        $scope.cargandoGrafico = false;
        minimizarContent.load();
        $scope.Equipos = [];
        $scope.fecha_min = moment('2020/10/01');
        $scope.fecha_max = moment();
        $scope.filtros = {
            fechas: {
                startDate: moment(),
                endDate: moment()
            }
        };
        $scope.fechasOptions = {
            eventHandlers: {
                'apply.daterangepicker': function (ev, picker) {
                    const fini = ev.model.startDate;
                    const ffin = ev.model.endDate;
                    const diff = ffin.diff(fini, 'days');
                    if (diff < 30) {
                        console.log('');
                    } else {
                        $scope.filtros.fechas.startDate = moment();
                        $scope.filtros.fechas.endDate = moment();
                        //toast.info('Info Edi!', 'Seleccione un rango de 30 días');
                    }
                }
            }
        };
        $scope.Medicion = [{Id: 1, Nombre: 'Voltaje'}, {Id: 2, Nombre: 'Corriente'}, {Id: 3, Nombre: 'Potencia'}];
        RESOURCES.getInfoBaseSolicitud().then((res) => {
            $scope.inmuebleEdificioNivel = {
                idinmueble: res.IdInmueble,
                idedificio: res.IdEdificio,
                idnivel: res.IdNivel,
                idambiente: 0,
                nombre: res.Inmueble,
                nombreEdificio: res.Edificio,
                nombreNivel: res.Nivel
            }
            RESOURCES.getClientesPorUsuario().then((res) => {
                $scope.Clientes = res.ListaEntidadComun;
                $scope.filtros.cliente = _.find($scope.Clientes, {Id: $rootScope._cliente.Id});
            });
            BMS.obtenerEquiposPorInmueble(res.IdInmueble).then((res) => {
                $scope.Equipos = res;
            });
        });

        $scope.buscarInmuble = function (buscar) {
            if (buscar) {
                $scope.cargando = true;
                RESOURCES.getArbolInmuebles({
                    IdCliente: $scope.filtros.cliente.Id,
                    IdUsuario: $rootScope._usuario.Id,
                    nombre: buscar
                }).then((res) => {
                    $scope.arbolInmueblesModel = res.Lista;
                    $scope.cargando = false;
                });
            }
        }
        $scope.seleccionArbolInmuebles = function (node, expanded, $parentNode, $index, $first, $middle, $last, $odd, $even, $path) {
            $scope.inmueble_edificio_nivel = $path().map(function (node) {
                return {id: node.Id, nombre: node.label.trim(), nivel: node.nivel}
            });
            var _inm = _.find($scope.inmueble_edificio_nivel, {nivel: 1});
            var _edi = _.find($scope.inmueble_edificio_nivel, {nivel: 2});
            var _nvl = _.find($scope.inmueble_edificio_nivel, {nivel: 3});
            var _amb = _.find($scope.inmueble_edificio_nivel, {nivel: 4});
            $scope.inmuebleEdificioNivel = {
                idinmueble: _inm.id,
                idedificio: _edi ? _edi.id : null,
                idnivel: _nvl ? _nvl.id : null,
                idambiente: _amb ? _amb.id : null,
                nombre: _inm.nombre,
                nombreEdificio: _edi ? _edi.nombre : '',
                nombreNivel: _nvl ? _nvl.nombre : '',
                nombreAmbiente: _amb ? _amb.nombre : '',
            }
            BMS.obtenerEquiposPorInmueble(_inm.id).then((res) => {
                $scope.Equipos = res;
            });
            $scope.abrirArbolInmuebles = !$scope.abrirArbolInmuebles;
        };
        $scope.buscar = function () {
            if ($scope.filtros.medicion) {
                $scope.cargandoGrafico = true;
                const req = {
                    IdCliente: $scope.filtros.cliente.Id,
                    Dispositivo: $scope.filtros.equipo.Id,
                    fechaDesde: $scope.filtros.fechas.startDate.format('YYYY-MM-DD'),
                    fechaHasta: $scope.filtros.fechas.endDate.format('YYYY-MM-DD'),
                    tipoReporteGrafico: $scope.filtros.medicion.Id
                };
                BMS.obtenerGraficoBms(req).then((res) => {
                    //$scope.data = res.ListElemento;
                    $scope.dataChart = [
                        {
                            label: 'Voltaje 1',
                            backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
                            borderColor: chartColors.red,
                            fill: false,
                            data: [
                                {x: new Date('10/01/2020 00:00:00'), y: -2},
                                {x: new Date('10/02/2020 08:00:00'), y: 2},
                                {x: new Date('10/03/2020 09:00:00'), y: 3},
                                {x: new Date('10/04/2020 08:00:00'), y: 4},
                                {x: new Date('10/05/2020 10:00:00'), y: 1},
                                {x: new Date('10/05/2020 10:15:00'), y: 2},
                                {x: new Date('10/05/2020 10:30:00'), y: 3},
                                {x: new Date('10/05/2020 10:45:00'), y: 4},
                                {x: new Date('10/05/2020 11:00:00'), y: 5},
                                {x: new Date('10/10/2020 08:00:00'), y: 2},
                                {x: new Date('10/11/2020 09:00:00'), y: 3},
                                {x: new Date('10/12/2020 10:00:00'), y: -2},
                                {x: new Date('10/13/2020 11:00:00'), y: 5},
                                {x: new Date('10/14/2020 12:00:00'), y: 6},
                                {x: new Date('10/15/2020 18:00:00'), y: 7},
                                {x: new Date('10/16/2020 20:00:00'), y: 9},
                            ]
                        }
                    ];
                    //$scope.chart.data.datasets = $scope.dataChart;
                    $scope.chart.data.datasets = res.ListElemento;

                    $scope.chart.update();
                    $scope.cargandoGrafico = false;
                }).catch(function (e) {
                    toast.info('Info Edi!', e.toString());
                    $scope.cargandoGrafico = false;
                });
            } else {
                toast.info('Info Edi!', 'Seleccione medición.');
            }
        }

        var ctx = document.getElementById('myChart').getContext('2d');
        ctx.canvas.width = 1000;
        ctx.canvas.height = 300;
        var color = Chart.helpers.color;
        var chartColors = {
            red: 'rgb(255, 99, 132)',
            orange: 'rgb(255, 159, 64)',
            yellow: 'rgb(255, 205, 86)',
            green: 'rgb(75, 192, 192)',
            blue: 'rgb(54, 162, 235)',
            purple: 'rgb(153, 102, 255)',
            grey: 'rgb(201, 203, 207)'
        };
        var config = {
            type: 'line',
            data: {
                datasets: $scope.dataChart
            },
            options: {
                title: {
                    text: 'Reporte'
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            parser: 'MM/DD/YYYY HH:mm',
                            tooltipFormat: 'll HH:mm',
                            stepSize: 30
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Periodo de Tiempo'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Medicion'
                        }
                    }]
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x'
                        },
                        zoom: {
                            enabled: true,
                            mode: 'x',
                        }
                    }
                }
            }
        };
        $scope.chart = new Chart(ctx, config);

    }

    function panelSensiboCtrl($scope, $state, $rootScope, RESOURCES, BMS, toast, $timeout) {
        $("#BodyAsp").hide();
        $scope.equipos = [];
        $scope.filtros = {};
        $scope.inmuebleEdificioNivel = {};
        $scope.arbolInmueblesModel = [];
        $scope.cargandoEquipos = false;
        $scope.isActive = false;
        RESOURCES.getInfoBaseSolicitud().then((res) => {
            $scope.inmuebleEdificioNivel = {
                idinmueble: res.IdInmueble,
                idedificio: res.IdEdificio,
                idnivel: res.IdNivel,
                idambiente: 0,
                nombre: res.Inmueble,
                nombreEdificio: res.Edificio,
                nombreNivel: res.Nivel
            }
            RESOURCES.getClientesPorUsuario().then((res) => {
                $scope.Clientes = res.ListaEntidadComun;
                $scope.filtros.cliente = _.find($scope.Clientes, {Id: $rootScope._cliente.Id});
            });
        });
        $scope.buscar = function () {
            if ($scope.inmuebleEdificioNivel) {
                $scope.cargandoEquipos = true;
                $scope.estadoGlobal = false;
                $scope.eqGlobal.todos = false;
                $scope.equipos = [];
                BMS.listarEquipos({
                    IdCliente: $scope.filtros.cliente.Id,
                    IdInmueble: $scope.inmuebleEdificioNivel.idinmueble,
                    IdEdificio: $scope.inmuebleEdificioNivel.idedificio,
                    IdNivel: $scope.inmuebleEdificioNivel.idnivel,
                    paginacion: {
                        cantidad: 10,
                        NumeroPagina: 1
                    }
                }).then((res) => {
                    $scope.cargandoEquipos = false;
                    $scope.equipos = res.lista;
                });
            } else {
                toast.info('Info Edi!', 'Seleccione inmueble');
            }
        }
        $scope.cambioCliente = function (obj) {
            $scope.limpiar();
            $scope.filtros.cliente = obj;
        }
        $scope.cargando = false;
        $scope.limpiar = function () {
            $scope.inmuebleEdificioNivel = undefined;
            $scope.arbolInmueblesModel = undefined;
            $scope.buscarInmueblesModel = undefined;
        }
        $scope.buscarInmuble = function (buscar) {
            if (buscar) {
                $scope.cargando = true;
                RESOURCES.getArbolInmuebles({
                    IdCliente: $scope.filtros.cliente.Id,
                    IdUsuario: $rootScope._usuario.Id,
                    nombre: buscar
                }).then((res) => {
                    $scope.arbolInmueblesModel = res.Lista;
                    $scope.cargando = false;
                });
            }
        }
        $scope.seleccionArbolInmuebles = function (node, expanded, $parentNode, $index, $first, $middle, $last, $odd, $even, $path) {
            $scope.inmueble_edificio_nivel = $path().map(function (node) {
                return {id: node.Id, nombre: node.label.trim(), nivel: node.nivel}
            });
            var _inm = _.find($scope.inmueble_edificio_nivel, {nivel: 1});
            var _edi = _.find($scope.inmueble_edificio_nivel, {nivel: 2});
            var _nvl = _.find($scope.inmueble_edificio_nivel, {nivel: 3});
            var _amb = _.find($scope.inmueble_edificio_nivel, {nivel: 4});
            $scope.inmuebleEdificioNivel = {
                idinmueble: _inm.id,
                idedificio: _edi ? _edi.id : null,
                idnivel: _nvl ? _nvl.id : null,
                idambiente: _amb ? _amb.id : null,
                nombre: _inm.nombre,
                nombreEdificio: _edi ? _edi.nombre : '',
                nombreNivel: _nvl ? _nvl.nombre : '',
                nombreAmbiente: _amb ? _amb.nombre : '',
            }
            $scope.abrirArbolInmuebles = !$scope.abrirArbolInmuebles;
        };
        $scope.eqGlobal = {};
        $scope.estadoGlobal = false;
        $scope.tiempoGlobal = 17;
        $scope.eqSelect = {
            select: {},
            eq: {}
        };
        let filterTextTimeout = {};
        $scope.$watch('tiempoGlobal', (newVal, oldVal) => {
            const seleccionados = _.filter($scope.equipos, {'check': true, 'EstaEncendidoElEquipo': true});

            if (seleccionados.length > 0) {
                _.map($scope.equipos, function (a) {
                    if (a.check) a.TemperaturaEquipo = newVal;
                    return a;
                });
                if (filterTextTimeout) $timeout.cancel(filterTextTimeout);
                filterTextTimeout = $timeout(function () {
                    $scope.cargandoEquipos = true;
                    var ids = _.map($scope.equipos, function (e, idx) {
                        if (e.check) return e.DispositivoID;
                    });
                    const req = {
                        IdCliente: $scope.filtros.cliente.Id,
                        ListDispositivoID: ids,
                        Temperatura: newVal
                    };
                    BMS.modificarTemperaturaEquipos(req).then((res) => {
                        $scope.cargandoEquipos = false;
                        $scope.buscar();
                        toast.info2('Info Edi!', res.Mensaje);
                    });
                }, 5000);
            } else {
                if ($scope.equipos.length > 0) toast.info('Info Edi!', 'Debe seleccionar al menos un equipo encendido.');
            }
        });

        $scope.validarTodos = function () {
            const ninguno = _.filter($scope.equipos, {'check': false});
            if (ninguno.length === $scope.equipos.length) {
                $scope.eqGlobal.todos = false;
            }
        }

        $scope.seleccionarTodos = function (obj) {
            _.map($scope.equipos, function (a) {
                a.check = $scope.eqGlobal.todos;
                return a;
            });
        }
        $scope.encenderEquipos = function () {
            let ids = [];
            const equiposSeleccionados = _.filter($scope.equipos, {'check': true});
            if (equiposSeleccionados.length > 0) {
                if (equiposSeleccionados.length <= 3) {
                    $scope.estadoGlobal = true;
                    if ($scope.isActive) {
                        //ENCENDER
                        ids = _.map(equiposSeleccionados, function (e, idx) {
                            e.EstaEncendidoElEquipo = true;
                            return e.DispositivoID;
                        });
                    } else {
                        //APAGAR
                        ids = _.map(equiposSeleccionados, function (e, idx) {
                            e.EstaEncendidoElEquipo = false;
                            return e.DispositivoID;
                        });
                    }
                    $scope.cargandoEquipos = true;
                    const req = {
                        IdCliente: $scope.filtros.cliente.Id,
                        ListDispositivoID: ids,
                        encender: $scope.isActive
                    };
                    BMS.encenderEquipos(req).then((res) => {
                        $scope.cargandoEquipos = false;
                        $scope.estadoGlobal = false;
                        toast.info2('Info Edi!', res.Mensaje);
                        $scope.buscar();
                    });
                } else {
                    Swal.queue([{
                        title: 'Seguro de ' + $scope.isActive ? 'Encender' : 'Apagar' + 'los equipos.',
                        showCancelButton: true,
                        confirmButtonText: $scope.isActive ? 'Encender' : 'Apagar',
                        text: 'Desea continuar?',
                        showLoaderOnConfirm: true,
                        preConfirm: () => {
                            return BMS.encenderEquipos(req).then(res => {
                                $scope.cargandoEquipos = false;
                                $scope.estadoGlobal = false;
                                Swal.insertQueueStep(res.Mensaje);
                                $scope.buscar();
                            });
                        }
                    }]);
                }
            } else {
                $scope.estadoGlobal = false;
                toast.info('Info Edi!', 'Seleccione Equipo!');
            }
        }
        $scope.encenderEquipo = function (obj) {
            $scope.cargandoEquipos = true;
            const req = {
                IdCliente: $scope.filtros.cliente.Id,
                ListDispositivoID: [obj.DispositivoID],
                encender: !obj.EstaEncendidoElEquipo
            };
            BMS.encenderEquipos(req).then((res) => {
                $scope.cargandoEquipos = false;
                _.map($scope.equipos, function (a) {
                    if (a === obj) a.EstaEncendidoElEquipo = !a.EstaEncendidoElEquipo;
                    return a;
                });
                toast.info2('Info Edi!', res.Mensaje);
            });
        }
    }

    function consultaBmsIniCtrl($scope, $rootScope) {
    }

    function consultaBmsTarifacionCtrl($scope, $rootScope) {
    }

    function consultaBmsSimulacionCtrl($scope, $rootScope) {
    }

//DISTRIBUCION
    function gdRegistroCtrl($scope, $rootScope, $stateParams, $state, $window, toast, $uibModal, RESOURCES, $q, DISTRIBUCION) {
        $("#BodyAsp").hide();
        const url = $("#hdnAngularApi").val();
        // console.log($rootScope._cliente.Id);

        $scope.cargando = false;

        $scope.cargandoInfo = false;
        $scope.bloquearTodo = true;
        $scope.mensajeBloqueo = '';
        $scope.ticketId = 0;
        if ($stateParams.id) $scope.ticketId = parseInt($stateParams.id);
        $scope.ticket = {};
        $scope.permisos = {};
        $scope.usr = $rootScope._usuario;

        $scope.subiendoOrigen = false;
        $scope.subiendoDestino = false;

        $scope.obtenerImagenSolicitante = function (id) {
            if (id) {
                const req = {
                    CodigoTabla: 238,
                    IdEntidad: id,
                    IdCategoria: 294,
                    NumeroGrupo: 0,
                    RetornarAdjuntosEnBytes: true
                };
                RESOURCES.postObtenerAdjunto(req).then((res) => {
                    $scope.imagen_solicitante = res.ListAdjuntos;
                });
            }
        }

        $scope.plantillaOrigen = null;
        $scope.plantillaDestino = null;

        $scope.ordenesPorCargaOrigen = [];
        $scope.ordenesPorCargaDestino = [];

        $scope.mensajeCargaOrigen = '';
        $scope.mensajeCargaDestino = '';

        $scope.items = [];

        $scope.origen_list = [];
        $scope.destino_list = [];

        $scope.sol = {
            disponibilidad: moment()
        };

        $scope.tbDistribucion = {};
        $scope.data = {};

        $scope.TipoServios = [];
        $scope.Proveedores = [];
        $scope.UbigeoOrigen = [{Id: 0, Nombre: 'Buscar por criterio.'}];
        $scope.UbigeoDestino = [{Id: 0, Nombre: 'Buscar por criterio.'}];

        $scope.Origen = [];
        $scope.Destino = [];

        $scope.UsuarioDestino = [];

        $scope.AgenciaOrigen = [];
        $scope.AgenciaDestino = [];

        $scope.TipoPaquete = [];
        $scope.Prioridad = [];
        $scope.CentroCosto = [];

        $scope.SedeOrigen = [];
        $scope.SedeDestino = [];
        $scope.imagen_solicitante = [];

        $scope.UnidadMedida = [];

        $scope.log = [];

        $scope.dataDistribucion = [];

        $scope.cerrar = function () {
            $state.go('rtBandejaDistribucion', {
                tipo: $scope.permisos.PermiteVerOtrosTickets ? 1 : 0
            });
        }
        $scope.cargando = true;
        $q.all([
            RESOURCES.obtenerListaValores(180, null),
            RESOURCES.obtenerListaValores(181, null),
            RESOURCES.obtenerListaValores(183, null),
            RESOURCES.obtenerListaValores(182, null),
            DISTRIBUCION.obtenerCentroCosto(62),
            RESOURCES.obtenerListaValores(187, null)
        ]).then(function (res) {
            $scope.cargando = false;
            $scope.TipoServios = res[0];
            $scope.Origen = res[1];
            $scope.Destino = res[1];
            $scope.TipoPaquete = res[2];
            $scope.Prioridad = res[3];
            $scope.CentroCosto = res[4];
            $scope.UnidadMedida = res[5];
            $scope.UnidadMedida.sort(function (a, b) {
                return a.Nombre > b.Nombre;
            });
            if ($scope.ticketId !== 0) {
                //buscar ticket
                DISTRIBUCION.obtenerTicketId($scope.ticketId).then((res) => {
                    $scope.ticket = res.data;
                    $scope.permisos = res.permisos;
                    $scope.dataDistribucion = res.ListOrdenes;
                    //--
                    $scope.sol.descripcion = $scope.ticket.DescripcionItem;
                    $scope.sol.disponibilidad = moment($scope.ticket.FechaDisponibilidad);
                    $scope.sol.tiposervicio = _.find($scope.TipoServios, {'Id': $scope.ticket.IdTipoServicio});
                    $scope.sol.prioridad = _.find($scope.Prioridad, {'Id': $scope.ticket.IdPrioridad});
                    $scope.sol.tipopaquete = _.find($scope.TipoPaquete, {'Id': $scope.ticket.IdTipoPaquete});
                    $scope.sol.centrocosto = _.find($scope.CentroCosto, {'Id': $scope.ticket.IdUnidadOrganizativa});

                    //DESTINATARIO
                    $scope.sol.usuario_destino = {Id: $scope.ticket.IdDestinatario, Nombre: $scope.ticket.Destinatario};

                    $scope.sol.origen = _.find($scope.Origen, {'Id': $scope.ticket.IdTipoOrigen});
                    $scope.sol.destino = _.find($scope.Destino, {'Id': $scope.ticket.IdTipoDestino});

                    //ORIGEN LECTURA
                    $scope.origen_list = _.map(res.ListOrdenes, o => _.pick(o, ['Codigo', 'Estado', 'Origen', 'DireccionOrigen', 'UbigeoOrigen']));
                    //DESTINO LECTURA
                    $scope.destino_list = _.map(res.ListOrdenes, o => _.pick(o, ['Destino', 'DireccionDestino', 'UbigeoDestino']));
                    DISTRIBUCION.obtenerProveedoresDistribucion(62).then((res) => {
                        $scope.Proveedores = res;
                        //SELECCIONAR PROVEEDOR
                        $scope.sol.proveedor = _.find($scope.Proveedores, {'Id': $scope.ticket.IdProveedor});
                        $scope.cargandoInfo = false;
                    });
                });
            } else {
                // $scope.sol.centrocosto = $scope.CentroCosto[0];
                $scope.obtenerImagenSolicitante($scope.usr.Id);
                $scope.cargandoInfo = false;
            }
            //si tiene centro de costo seleccionar
            if ($scope.usr.IdUnidadOrganizativa) {
                $scope.sol.centrocosto = _.find($scope.CentroCosto, {Id: $scope.usr.IdUnidadOrganizativa});
            }
        });
        $scope.limpiarOrigen = function () {
            $scope.sol.origen = undefined;
            $scope.sol.sedeOrigen = undefined;
            $scope.sol.ubigeo_origen = undefined;
            $scope.sol.direccion_origen = undefined;
        }
        $scope.limpiarDestino = function () {
            _.forEach($scope.Destino, function (i) {
                i.disabled = false;
            });
            $scope.sol.destino = undefined;
            $scope.sol.sedeDestino = undefined;
            $scope.sol.ubigeo_destino = undefined;
            $scope.sol.direccion_destino = undefined;
        }
        DISTRIBUCION.validarCalificacion({}).then((res) => {
            if (res.TipoResultado === 1) {
                if (res.Mensaje) toast.info('Info Edi!', res.Mensaje);
            } else {
                if (!$scope.ticket.Id) {
                    $scope.bloquearTodo = false;
                    $scope.mensajeBloqueo = res.Mensaje;
                    toast.info('Info Edi!', res.Mensaje);
                }
            }
        });
        $scope.generales = function () {

        }
        $scope.seleccionarTipoServicio = (val) => {
            //LIMPIAR
            $scope.limpiarOrigen();
            $scope.limpiarDestino();
            //ENVIO 343
            //RECOJO 344
            //si envio solo agencia/almacen/otros
            //si recojo solo agencia - multi agencias/almacen/otros
        }
        $scope.seleccionarOrigen = (val) => {
            $scope.SedeOrigen = [];
            $scope.sol.direccion_origen = '';
            //limpiar
            if (val.Id === 345 || val.Id === 346 || val.Id === 347) {
                if ($scope.sol.tiposervicio.Id === 343) {
                    //envio
                    _.forEach($scope.Destino, function (i) {
                        i.disabled = i.Id !== 346;
                    });
                }
                if ($scope.sol.tiposervicio.Id === 344) {
                    //recojo
                    _.forEach($scope.Destino, function (i) {
                        i.disabled = i.Id !== 345;
                    });
                }
            }
            if (val.Id === 345) {
                //ALMACEN : MOSTRAR LOS ALMACENES EN EL COMBO
                DISTRIBUCION.obtenerAlmacenes(62).then((res) => {
                    $scope.AgenciaOrigen = res;
                });
            } else if (val.Id === 346) {
                //AGENCIA : caso que el tipo de Origen sea Sede principal : ObtenerInmueblePrincipal
                DISTRIBUCION.obtenerAgencias(62, null).then((res) => {
                    $scope.AgenciaOrigen = res.ListaInmueble;
                    if ($scope.sol.tiposervicio.Id === 344) $scope.AgenciaOrigen.push({
                        Id: 0,
                        Nombre: '--Multiple Origenes--'
                    });
                });
            } else if (val.Id === 347) {
                //OTROS
            } else {
                //otros habilitar el textarea direccion origen
            }
        }
        $scope.seleccionarDestino = (val) => {
            $scope.SedeDestino = [];
            if (val.Id === 345) {
                //ALMACEN : MOSTRAR LOS ALMACENES EN EL COMBO
                DISTRIBUCION.obtenerAlmacenes(62).then((res) => {
                    $scope.AgenciaDestino = res;
                });
            } else if (val.Id === 346) {
                //AGENCIA : caso que el tipo de Origen sea Sede principal : ObtenerInmueblePrincipal
                DISTRIBUCION.obtenerAgencias(62, null).then((res) => {
                    $scope.AgenciaDestino = res.ListaInmueble;
                    $scope.AgenciaDestino.push({Id: 0, Nombre: '--Multiple Destinos--'});
                });
            } else if (val.Id === 347) {
                //OTROS
                //SOLO SE HABILITARA EL TEXTAREA DE DIRECCION
                // DISTRIBUCION.obtenerProveedores(62).then((res) => {
                //     $scope.SedeOrigen.push(res);
                // });
            } else {
                //otros habilitar el textarea direccion origen
            }
        }
        $scope.seleccionarPrioridad = (val) => {

        }
        $scope.seleccionarTipoPaquete = (val) => {

        }
        $scope.obtenerUbigeo = function (buscar, tipo) {
            if (buscar !== "" && buscar.length > 2) {
                return DISTRIBUCION.obtenerUbigeo(buscar).then((res) => {
                    if (res.length > 0) {
                        if (tipo === 1) $scope.UbigeoOrigen = res;
                        else $scope.UbigeoDestino = res;
                    }
                });
            }
        };

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        async function encriptarBody(url, data) {
            if (data != null) {
                const settings = {
                    method: 'POST',
                    headers: {
                        "Accept": 'application/json',
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({
                        "Body": JSON.stringify(data),
                        "Token": "MIw3lILd1k4GwoAuelSGjwPVepY"
                    })
                };
                const fetchResponse = await fetch(`${url}/Usuario/Encriptar`, settings);
                const encry = await fetchResponse.json();
                return {
                    "data": encry
                };
            } else {
                return null;
            }
        }

        $scope.descargarPlantilla = function () {
            const req = {
                CodigoTabla: 205,
                IdEntidad: 62,
                IdCategoria: 23780,
                RetornarAdjuntosEnBytes: true
            };
            var reqBody = encriptarBody(url, req).then((res) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", url + `/ADM/Adjunto/Listar`);
                xhr.setRequestHeader('Content-type', 'application/json')
                xhr.setRequestHeader('Authorization', `Bearer ${$window.localStorage.token}`);
                xhr.onload = () => {
                    const res = JSON.parse(JSON.parse(xhr.response));
                    if (res.TipoResultado === 1) {
                        var bin = atob(res.ListAdjuntos[0].arrArchivo);
                        var ab = s2ab(bin); // from example above
                        var blob = new Blob([ab], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;'});
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = res.ListAdjuntos[0].Nombre;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } else {
                        toast.info('Info Edi!', res.Mensaje);
                    }
                    $scope.cargando = false;
                };
                xhr.send(JSON.stringify(res));
            });
        }
        $scope.convertir = function (file) {
            return new Promise((resolve, reject) => {
                var reader = new FileReader();
                var fileByteArray = [];
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        var arrayBuffer = evt.target.result,
                            array = new Uint8Array(arrayBuffer);
                        for (var i = 0; i < array.length; i++) {
                            fileByteArray.push(array[i]);
                        }
                        resolve(fileByteArray);
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        }
        $scope.seleccionarUsuarioDestino = function (val) {

        }
        $scope.subirPlantilla = async function (tipo) {
            if (tipo === 1) {
                $scope.subiendoOrigen = true;
            } else {
                $scope.subiendoDestino = true;
            }
            const base64 = await $scope.convertir(tipo === 1 ? this.plantillaOrigen : this.plantillaDestino);
            const req = {
                IdCliente: 62,
                LecturaEsOrigen: tipo === 1,
                IdTipo: 346,
                archivo: {
                    Nombre: tipo === 1 ? this.plantillaOrigen.name : this.plantillaDestino.name,
                    arrArchivo: base64
                }
            }
            DISTRIBUCION.subirPlantilla(req).then((res) => {
                if (res.TipoResultado === 1) {
                    if (tipo === 1) $scope.ordenesPorCargaOrigen = res.Ordenes;
                    else $scope.ordenesPorCargaDestino = res.Ordenes;
                    toast.info('Info Edi!', res.Mensaje);
                } else {
                    toast.info('Info Edi!', res.Mensaje);
                }
                if (tipo === 1) {
                    $scope.subiendoOrigen = false;
                    $scope.mensajeCargaOrigen = res.Mensaje;
                } else {
                    $scope.subiendoDestino = false;
                    $scope.mensajeCargaDestino = res.Mensaje;
                }
            });
        }
        $scope.borrarAdjOrigen = function () {
            this.plantillaOrigen = undefined;
            $('#adjOrigen').val(null);
        }
        $scope.agregarAdjOrigen = function () {
            $('#adjOrigen').click();
        }
        $scope.agregarAdjDestino = function () {
            $('#adjDestino').click();
        }
        $scope.borrarAdjDestino = function () {
            this.plantillaDestino = undefined;
            $('#adjDestino').val(null);
        }
        $scope.seleccionarSedeOrigen = function (i) {
            $scope.sol.direccion_origen = i.Nombre2;
        }
        $scope.seleccionarSedeDestino = function (i) {
            DISTRIBUCION.obtenerUsuariosPorInmueble(i.Id).then((res) => {
                $scope.UsuarioDestino = res.ListaUsuarios;
            });
            $scope.sol.direccion_destino = i.Nombre2;
        }
        $scope.agregarItems = function (i) {
            if ($scope.sol.sedeDestino && $scope.sol.sedeDestino.Id) {
                $scope.items.push({
                    Item: i.Item,
                    IdUnidadMedida: parseInt(i.IdUnidadMedida),
                    Cantidad: i.Cantidad
                });
            } else {
                toast.info('Info Edi!', 'Debe seleccionar un destino!');
            }
        }
        $scope.eliminarItem = function (i) {
            _.remove($scope.items, i);
        }
        $scope.abrirLog = function () {
            const req = {
                tabla: 1008,
                entidad: $scope.ticketId
            }
            RESOURCES.obtenerLogAcciones(req).then((res) => {
                $scope.log = res;
            });
        }
        $scope.calculoSla = (total) => {
            let _cumplio = _.filter(total, {'Cumplio': 1});
            let _nocumplio = _.filter(total, {'NoCumplio': 1});
            let res = {
                datasets: [{backgroundColor: ['#007bff', '#EFEEEE'], data: [_cumplio.length, _nocumplio.length]}],
                labels: ['Cumplio', 'No Cumplio']
            };
            var ctx3 = document.getElementById("rpt1").getContext('2d');
            $scope.chart1 = new Chart(ctx3, {
                type: 'pie',
                data: res,
                options: {
                    legend: {
                        display: true,
                        align: 'center',
                        position: 'right'
                    },
                    tooltips: {
                        enabled: true
                    },
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: -30,
                            bottom: 0
                        }
                    }
                }
            });
        }
        $scope.distribucion = function () {
            const total = $scope.dataDistribucion.length;
            const entregados = _.filter($scope.dataDistribucion, {'IdEstado': 357});
            $scope.porcentaje_val = ((parseFloat(entregados.length) / parseFloat(total)) * 100).toFixed(2);
            $scope.porcentaje_txt = 'Porcentaje de ' + ((parseFloat(entregados.length) / parseFloat(total)) * 100).toFixed(2) + ' %';
            $scope.calculoSla(entregados);
            if (jQuery.isEmptyObject($scope.tbDistribucion)) {
                $scope.tbDistribucion = $('#tbDistribucion').DataTable({
                    dom: 'Blfrtip',
                    data: $scope.dataDistribucion,
                    buttons: [
                        {
                            text: '<i class="fas fa-database"></i> Ver',
                            action: function (e, dt, node, config) {
                                const fila = $scope.tbDistribucion.rows('.selected').data()[0];
                                if (fila) {
                                    DISTRIBUCION.obtenerOrdenEntregaPorId(fila.Id).then((res) => {
                                        const modal = $uibModal.open({
                                            animation: true,
                                            templateUrl: 'ordenEntrega.html',
                                            size: 'lg',
                                            resolve: {
                                                orden: function () {
                                                    return res;
                                                }
                                            },
                                            controller: function ($scope, $http, $uibModalInstance, orden) {
                                                $scope.oe = orden.data;
                                                $scope.items = orden.Items;
                                                $scope.cerrarOrdenEntrega = function () {
                                                    $uibModalInstance.close();
                                                }
                                            }
                                        });
                                        modal.result.then(function (f) {
                                            if (f) {

                                            }
                                        });
                                    });
                                }
                            }
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Exp.Excel'
                        }
                    ],
                    language: {
                        url: '/Assets/js/tablas/i18n.json'
                    },
                    columns: [
                        {title: "#", data: "IdEstado"},
                        {title: "Codigo OE", data: "Codigo"},
                        {title: "Glosa", data: "Glosa"},
                        {title: "Origen", data: "Origen"},
                        {title: "Dirección", data: "DireccionOrigen"},
                        {title: "Destino", data: "Destino"},
                        {title: "Dirección", data: "DireccionDestino"},
                        {title: "Fecha Estimada Entrega", data: "FechaEstimadaEntrega"},
                        {title: "Fecha Real Entrega", data: "FechaDespacho"}
                    ],
                    columnDefs: [
                        {
                            render: function (data, type, row) {
                                /*
                                * INGRESADO = 353,
                                VALIDADO = 354,
                                ALMACEN = 355,
                               
                                EN_REPARTO = 356,
                                ENTREGADO = 357,
                                * 
                                REZAGADO = 364,
                                RECHAZADO = 365,
                                ANULADO = 366*/
                                if (data === 355) {
                                    return "<i class=\"fas fa-home\" style=\"color: green\"></i>";
                                } else if (data === 356) {
                                    return "<i class=\"fas fa-truck\" style=\"color: blue\"></i>";
                                } else if (data === 357) {
                                    return "<i class=\"far fa-check-square\" style=\"color: green\"></i>";
                                } else if (data === 365) {
                                    return "<i class=\"fas fa-circle\" style=\"color: red\"></i>";
                                } else return "";
                            },
                            targets: 0
                        },
                        {
                            render: function (data, type, row) {
                                return data ? new Date(data).format('dd-MM-yyyy') : '--';
                            },
                            targets: 7
                        },
                        {
                            render: function (data, type, row) {
                                return data ? new Date(data).format('dd-MM-yyyy') : '--';
                            },
                            targets: 8
                        }
                    ]
                });

                $scope.tbDistribucion.on('click', 'tr', function () {
                    $(this).toggleClass('selected');
                    const filas = $scope.tbDistribucion.rows('.selected').data().length;
                    const fila = $scope.tbDistribucion.rows('.selected').data()[0];
                    if (fila === undefined) {
                        $scope.tbDistribucion.button(0).enable(false);
                        $scope.tbDistribucion.button(1).enable(false);
                    } else {
                        $scope.tbDistribucion.button(0).enable(filas >= 1);
                        $scope.tbDistribucion.button(1).enable(filas === 1);
                    }
                });
            } else {
                $scope.tbDistribucion.draw();
            }
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        $scope.grabar = function () {
            let _otros = false;
            let _multiples_origenes = false;
            let _multiples_destinos = false;
            if (!$scope.sol.prioridad) {
                toast.info('Info Edi!', 'Debe seleccionar una prioridad.');
                return;
            }
            if (!$scope.sol.tipopaquete) {
                toast.info('Info Edi!', 'Debe seleccionar Tipo de Paquete.');
                return;
            }
            if ($scope.sol.sedeOrigen && $scope.sol.sedeDestino) {
                if ($scope.sol.sedeOrigen.Id === $scope.sol.sedeDestino.Id) {
                    toast.info('Info Edi!', 'El origen y destino no pueden ser iguales!');
                    return;
                }
            } else {
                _otros = true;
            }

            if ($scope.sol.sedeOrigen && $scope.sol.sedeOrigen.Id === 0) {
                _multiples_origenes = true;
            }

            if ($scope.sol.sedeDestino && $scope.sol.sedeDestino.Id === 0) {
                _multiples_destinos = true;
            }

            if (_multiples_origenes || _multiples_destinos || ($scope.items.length > 0)) {
                const req = {
                    IdCliente: 62,
                    DescripcionItem: $scope.sol.descripcion,
                    FechaDisponibilidad: $scope.sol.disponibilidad,
                    IdTipoServicio: $scope.sol.tiposervicio.Id,
                    IdPrioridad: $scope.sol.prioridad.Id,
                    IdUnidadOrganizativa: $scope.sol.centrocosto ? $scope.sol.centrocosto.Id : undefined,
                    IdTipoPaquete: $scope.sol.tipopaquete.Id,
                    IdTipoOrigen: $scope.sol.origen.Id,
                    IdTipoDestino: $scope.sol.destino.Id,
                    IdDestinatario: $scope.sol.usuario_destino ? $scope.sol.usuario_destino.Id : undefined
                };
                if ($scope.sol.origen.Id === 347 || $scope.sol.destino.Id === 347) {
                    //ORIGEN DESTINO OTROS
                    req.Ordenes = [
                        {
                            IdOrigen: $scope.sol.sedeOrigen ? $scope.sol.sedeOrigen.Id : null,
                            IdUbigeoOrigen: $scope.sol.ubigeo_origen ? $scope.sol.ubigeo_origen.Id : null,
                            DireccionOrigen: $scope.sol.direccion_origen ? $scope.sol.direccion_origen : '',
                            IdDestino: $scope.sol.sedeDestino ? $scope.sol.sedeDestino.Id : null,
                            IdUbigeoDestino: $scope.sol.ubigeo_destino ? $scope.sol.ubigeo_destino.Id : null,
                            DireccionDestino: $scope.sol.direccion_destino ? $scope.sol.direccion_destino : '',
                            Items: $scope.items
                        }
                    ];
                } else {
                    if ($scope.sol.sedeOrigen.Id === 0) {
                        _.forEach($scope.ordenesPorCargaOrigen, function (val) {
                            val.IdDestino = $scope.sol.sedeDestino.Id;
                        });
                        req.Ordenes = $scope.ordenesPorCargaOrigen;
                    } else if ($scope.sol.sedeDestino.Id === 0) {
                        _.forEach($scope.ordenesPorCargaDestino, function (val) {
                            val.IdOrigen = $scope.sol.sedeOrigen.Id;
                        });
                        req.Ordenes = $scope.ordenesPorCargaDestino;
                    } else {
                        req.Ordenes = [
                            {
                                IdOrigen: $scope.sol.sedeOrigen.Id,
                                IdUbigeoOrigen: $scope.sol.ubigeo_origen ? $scope.sol.ubigeo_origen.Id : null,
                                DireccionOrigen: $scope.sol.direccion_origen ? $scope.sol.direccion_origen : '',
                                IdDestino: $scope.sol.sedeDestino.Id,
                                IdUbigeoDestino: $scope.sol.ubigeo_destino ? $scope.sol.ubigeo_destino.Id : null,
                                DireccionDestino: $scope.sol.direccion_destino ? $scope.sol.direccion_destino : '',
                                Items: $scope.items
                            }
                        ];
                    }
                }
                Swal.queue([{
                    title: 'Registro de Distribución',
                    showCancelButton: true,
                    confirmButtonText: 'Grabar',
                    text: 'Se grabara el registro de Distribución. Desea continuar?',
                    showLoaderOnConfirm: true,
                    preConfirm: () => {
                        return DISTRIBUCION.grabarDistribucion(req).then((res) => {
                            if (res.TipoResultado === 1) {
                                Swal.insertQueueStep(res.Mensaje);
                                DISTRIBUCION.obtenerTicketId(res.Id).then((res) => {
                                    if (res.TipoResultado === 1) {
                                        $scope.ticket = res.data;
                                        $scope.permisos = res.permisos;
                                        $scope.dataDistribucion = res.ListOrdenes;
                                        $scope.ticketId = $scope.ticket.Id;
                                    } else Swal.insertQueueStep(res.Mensaje);
                                });
                            } else Swal.insertQueueStep(res.Mensaje)
                        });
                    }
                }]);
            } else {
                toast.info('Info Edi!', 'Debe de agregar items para el envio.');
            }

        }
        $scope.estadoRegistro = false;
        $scope.estadoAprobado = false;
        $scope.estadoRechazadp = false;
        $scope.enviar = function () {
            Swal.queue([{
                title: 'Solicitud de Distribución',
                showCancelButton: true,
                confirmButtonText: 'Enviar',
                text: 'Se grabara la solicitud de Distribución. Desea continuar?',
                showLoaderOnConfirm: true,
                preConfirm: async () => {
                    await sleep(2000);
                    $scope.estadoRegistro = true;
                    return Swal.insertQueueStep('Se Registro Correctamente! codigo b200012');
                }
            }]);
        }
        $scope.aprobar = function () {
            if (!$scope.sol.centrocosto) {
                toast.info('Info Edi!', 'Debe de seleccionar un centro de costo.');
                return;
            }
            if (!$scope.sol.proveedor) {
                toast.info('Info Edi!', 'Debe de seleccionar un proveedor.');
                return;
            }
            const req = {
                IdDistribuciones: $scope.ticket.Id,
                Aprobar: true,
                IdProveedor: $scope.sol.proveedor.Id,
                IdUnidadOrganizativa: $scope.sol.centrocosto.Id
            };
            Swal.queue([{
                title: 'Aprobación de Distribución',
                showCancelButton: true,
                confirmButtonText: 'Grabar',
                text: 'Se Aprobara el registro de Distribución. Desea continuar?',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return DISTRIBUCION.aprobarRechazar(req).then((res) => {
                        if (res.TipoResultado === 2) Swal.insertQueueStep(res.Mensaje);
                        else {
                            Swal.insertQueueStep(res.Mensaje);
                            $scope.permisos.AprobarRechazar = false;
                        }
                    });
                }
            }]);
        }
        $scope.rechazar = function () {
            const req = {
                IdDistribuciones: $scope.ticket.Id,
                Aprobar: false
            };
            Swal.queue([{
                title: 'Rechazar de Distribución',
                input: 'text',
                showCancelButton: true,
                confirmButtonText: 'Grabar',
                text: 'Se Rechazar el registro de Distribución. Desea continuar?',
                showLoaderOnConfirm: true,
                preConfirm: (val) => {
                    req.MotivoRechazo = val;
                    return DISTRIBUCION.aprobarRechazar(req).then((res) => {
                        if (res.TipoResultado === 2) Swal.insertQueueStep(res.Mensaje);
                        else Swal.insertQueueStep(res.Mensaje);
                    });
                }
            }]);
        }
        $scope.anular = () => {
            Swal.queue([{
                title: 'Anular Registro de Distribución',
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-ban"></i> Anular',
                confirmButtonColor: '#e0070d',
                text: 'Se anulara el registro de Distribución. Desea continuar?',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    let req = {
                        "IdDistribuciones": $scope.ticketId
                    };
                    return DISTRIBUCION.anularDistribucion(req).then((res) => {
                        if (res.TipoResultado == 1) {
                            DISTRIBUCION.obtenerTicketId($scope.ticketId).then((res) => {
                                $scope.ticket = res.data;
                                $scope.permisos = res.permisos;
                                Swal.insertQueueStep(res.Mensaje);
                            });
                        } else Swal.insertQueueStep(res.Mensaje);
                    });
                }
            }]);
        }
    }

    function gdActualizacionOeCtrl($scope, $rootScope, $window, toast, DISTRIBUCION) {
        $("#BodyAsp").hide();
        const url = $("#hdnAngularApi").val();
        $scope.descargando = false;
        $scope.cargando = false;
        $scope.usr = $rootScope._usuario;
        $scope.adjuntos = [];
        $scope.plantillaOrigen = null;
        $scope.mensajeCarga = '';
        $scope.dzOptions = {
            url: 'http://localhost:4950/Adjunto/Guardar',
            paramName: 'photo',
            maxFilesize: '10',
            acceptedFiles: '.jpg,.jpeg,.png,.pdf,.xlsx',
            addRemoveLinks: true,
            autoProcessQueue: false,
            uploadMultiple: true
        };
        $scope.dzCallbacks = {};
        $scope.dzMethods = {};
        $scope.borrarAdjOrigen = function () {
            this.plantillaOrigen = undefined;
            $('#adjOrigen').val(null);
        }

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        $scope.tbDistribucion = $('#tbBandeja').DataTable({
            dom: 'Blfrtip',
            buttons: [
                {
                    text: '<i class="fas fa-download"></i> Descargar',
                    action: function (e, dt, node, config) {
                        const fila = $scope.tbDistribucion.rows('.selected').data()[0];
                        if (fila) {
                            $scope.descargando = true;
                            const xhr = new XMLHttpRequest();
                            xhr.open("GET", url + `/DIS/DescargarArchivoProveedorDistribucion?IdDistribuciones=${fila.Id}`);
                            xhr.setRequestHeader('Authorization', `Bearer ${$window.localStorage.token}`);
                            xhr.onload = () => {
                                const res = JSON.parse(xhr.response);
                                if (res.TipoResultado === 1) {
                                    $scope.descargando = false;
                                    var bin = atob(res.archivo.arrArchivo);
                                    var ab = s2ab(bin); // from example above
                                    var blob = new Blob([ab], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;'});
                                    var link = document.createElement('a');
                                    link.href = window.URL.createObjectURL(blob);
                                    link.download = res.archivo.Nombre;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                } else {
                                    toast.info('Info Edi!', res.Mensaje);
                                }
                            };
                            xhr.send();
                        } else {
                            toast.info('Info Edi!', 'Seleccione un registro.');
                        }
                    }
                },
                {
                    extend: 'excelHtml5',
                    text: 'Exp.Excel'
                }
            ],
            proccessing: true,
            serverSide: true,
            select: {
                style: 'single'
            },
            ajax: {
                url: url + '/DIS/ListarBandejaProveedorPaginado',
                type: 'POST',
                headers: {'Authorization': `Bearer ${$window.localStorage.token}`},
                data: function (d) {
                    return {
                        d: {
                            datatable: {
                                IdCliente: 62,
                                IdSolicitante: $scope.usr.Id,
                            },
                            draw: d.draw,
                            length: d.length,
                            start: d.start
                        }
                    };
                },
                dataSrc: 'data'
            },
            language: {
                url: '/Assets/js/tablas/i18n.json'
            },
            columns: [
                {title: "Codigo de Solicitud", data: "Codigo"},
                {title: "Tipo Servicio", data: "TipoServicio"},
                {title: "Solicitante", data: "Solicitante"},
                {title: "Prioridad", data: "Prioridad"},
                {title: "F.Registro", data: "FechaRegistro"}
            ],
            columnDefs: [
                {
                    render: function (data, type, row) {
                        var f;
                        if (moment(data).isValid()) {
                            f = moment(data).fromNow();
                        }
                        return f;
                    },
                    targets: 4
                }
            ]
        });

        $scope.convertir = function (file) {
            return new Promise((resolve, reject) => {
                var reader = new FileReader();
                var fileByteArray = [];
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        var arrayBuffer = evt.target.result,
                            array = new Uint8Array(arrayBuffer);
                        for (var i = 0; i < array.length; i++) {
                            fileByteArray.push(array[i]);
                        }
                        resolve(fileByteArray);
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        }

        $scope.procesar = async function () {
            $scope.cargando = true;
            const base64 = await $scope.convertir(this.plantillaOrigen);
            const req = {
                archivo: {
                    Nombre: this.plantillaOrigen.name,
                    arrArchivo: base64
                }
            }
            DISTRIBUCION.subirPlantillaActualizacionOE(req).then((res) => {
                $scope.cargando = false;
                if (res.TipoResultado === 1) {
                    toast.info('Info Edi!', res.Mensaje);
                } else {
                    toast.info('Info Edi!', res.Mensaje);
                }
            });
        }

    }

    function gdBandejaDistribucionCtrl($scope, $state, $stateParams, $rootScope, $uibModal, $window, toast, RESOURCES, DISTRIBUCION, ADMINISTRADOR) {
        $("#BodyAsp").hide();
        if ($stateParams.tipo) $scope.tipo = parseInt($stateParams.tipo);
        const url = $("#hdnAngularApi").val();
        $scope.lista = [];
        $scope.cargando = false;
        $scope.Estados = [];
        $scope.Solicitante = [];

        $scope.bigTotalItems = 0;
        $scope.bigCurrentPage = 1;

        $scope.filtro = {
            fechas: {
                startDate: moment().subtract(1, 'months'),
                endDate: moment()
            }
        };
        $scope.buscar = function () {
            $scope.obtenerBandeja();
        }

        RESOURCES.obtenerListaValores(184, null).then((res) => {
            $scope.Estados = res;
        });

        $scope.usr = $rootScope._usuario;

        $scope.obtenerSolicitante = function (search) {
            if (search !== "" && search.length > 2)
                return RESOURCES.getSolicitante({
                    idcliente: $rootScope._cliente.Id,
                    nombre: search
                }).then((res) => {
                    if (res.ListaUsuarios.length > 0) {
                        $scope.filtro.solicitante = _.find(res.ListaUsuarios, {Id: $rootScope._usuario.Id});
                    }
                    $scope.Solicitante = res.ListaUsuarios;
                });
        };

        $scope.filtro.solicitante = {
            Id: $scope.usr.Id,
            Nombre: $scope.usr.Nombre + ' ' + $scope.usr.ApellidoPaterno
        };

        async function encriptarBody(url, data) {
            if (data != null) {
                const settings = {
                    method: 'POST',
                    headers: {
                        "Accept": 'application/json',
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({
                        "Body": JSON.stringify(data),
                        "Token": "MIw3lILd1k4GwoAuelSGjwPVepY"
                    })
                };
                const fetchResponse = await fetch(`${url}/Usuario/Encriptar`, settings);
                const encry = await fetchResponse.json();
                return {
                    "data": encry
                };
            } else {
                return null;
            }
        }

        $scope.abrir = (x) => {
            if (x) {
                $state.go('rtRegistroDistribucion', {
                    id: x.Id
                });
            } else {
                toast.info('Info Edi!', 'Seleccione un registro.');
            }
        }

        $scope.calificar = () => {
            const x = _.find($scope.lista, {'Selected': true});
            if (x && x.Estado === "ENTREGADO" && x.Calificacion === null) {
                DISTRIBUCION.obtenerTicketId(x.Id).then((res) => {
                    const modal = $uibModal.open({
                        animation: true,
                        templateUrl: 'calificar.html',
                        size: 'lg',
                        resolve: {
                            ticket: function () {
                                return res;
                            }
                        },
                        controller: function ($scope, $http, $uibModalInstance, ticket) {
                            $scope.ticket = ticket;
                            $scope.max = 5;
                            $scope.enviar = () => {
                                const req = {
                                    "CodigoTabla": 1008,
                                    "IdEntidad": $scope.ticket.data.Id,
                                    "IdUsuario": $rootScope._usuario.Id,
                                    "Puntaje": $scope.calificacion.puntaje,
                                    "Comentario": $scope.calificacion.obs
                                };
                                ADMINISTRADOR.Calificar(req).then((res) => {
                                    if (res.TipoResultado === 1) {
                                        $uibModalInstance.close(res);
                                    } else {
                                        $uibModalInstance.close();
                                    }
                                });
                            }
                            $scope.cerrar = function () {
                                $uibModalInstance.close();
                            }
                        }
                    });
                    modal.result.then(function (res) {
                        if (res.TipoResultado === 1) {
                            toast.info('Info Edi!', res.Mensaje);
                            $scope.buscar();
                        }
                    });
                });
            }
        }

        $scope.obtenerBandeja = () => {
            $scope.cargando = true;
            const req = {
                d: {
                    datatable: {
                        IdCliente: 62,
                        Codigo: $scope.filtro.codigo,
                        IdSolicitante: $scope.filtro.solicitante ? $scope.filtro.solicitante.Id : undefined,
                        IdEstado: $scope.filtro.estado ? $scope.filtro.estado.Id : undefined,
                        // IdDestino: $scope.filtro.destino,
                        FechaDesde: $scope.filtro.fechas.startDate.toDate().toJSON(),
                        FechaHasta: $scope.filtro.fechas.endDate.toDate().toJSON(),
                        Anulados: $scope.filtro.anulados ? $scope.filtro.anulados : false
                    },
                    draw: $scope.bigCurrentPage,
                    length: 10,
                    start: $scope.bigCurrentPage - 1
                }
            }
            DISTRIBUCION.obtenerBandeja(req).then((res) => {
                $scope.bigTotalItems = res.recordsTotal;
                $scope.lista = res.data;
                $scope.cargando = false;
            });
        }

        $scope.nuevo = () => {
            $state.go('rtRegistroDistribucion', {
                id: 0
            });
        }
    }

    function gdBandejaOeCtrl($scope, $state, $rootScope, $uibModal, $window, RESOURCES, DISTRIBUCION) {
        $("#BodyAsp").hide();
        const url = $("#hdnAngularApi").val();
        $scope.cargando = false;
        $scope.Estados = [];
        $scope.Solicitante = [];
        $scope.filtro = {
            fechas: {
                startDate: moment().subtract(1, 'months'),
                endDate: moment()
            }
        };
        $scope.buscar = function () {
            $scope.cargando = true;
            if ($scope.tbDistribucion) {
                $scope.tbDistribucion.destroy();
                $('#tbBandeja').empty();
                $scope.definirTabla();
            } else {
                $scope.definirTabla();
            }
            $scope.cargando = false;
        }


        RESOURCES.obtenerListaValores(184, null).then((res) => {
            $scope.Estados = res;
        });

        $scope.usr = $rootScope._usuario;

        $scope.obtenerSolicitante = function (search) {
            if (search !== "" && search.length > 2)
                return RESOURCES.getSolicitante({
                    idcliente: $rootScope._cliente.Id,
                    nombre: search
                }).then((res) => {
                    if (res.ListaUsuarios.length > 0) {
                        $scope.filtro.solicitante = _.find(res.ListaUsuarios, {Id: $rootScope._usuario.Id});
                    }
                    $scope.Solicitante = res.ListaUsuarios;
                });
        };

        $scope.filtro.solicitante = {
            Id: $scope.usr.Id,
            Nombre: $scope.usr.Nombre + ' ' + $scope.usr.ApellidoPaterno
        };

        $scope.definirTabla = () => {
            $scope.cargando = true;
            $scope.tbDistribucion = $('#tbBandeja').DataTable({
                dom: 'Blfrtip',
                buttons: [
                    {
                        text: '<i class="fas fa-database"></i> Ver',
                        action: function (e, dt, node, config) {
                            const fila = $scope.tbDistribucion.rows('.selected').data()[0];
                            if (fila) {
                                $state.go('rtRegistroDistribucion', {
                                    id: fila.Id
                                });
                            } else {
                                toast.info('Info Edi!', 'Seleccione un registro.');
                            }
                        }
                    },
                    {
                        extend: 'excelHtml5',
                        text: 'Exp.Excel'
                    }
                ],
                proccessing: true,
                serverSide: true,
                select: {
                    style: 'single'
                },
                ajax: {
                    url: url + '/DIS/ListarPaginado',
                    type: 'POST',
                    headers: {'Authorization': `Bearer ${$window.localStorage.token}`},
                    data: function (d) {
                        return {
                            d: {
                                datatable: {
                                    IdCliente: 62,
                                    Codigo: $scope.filtro.codigo,
                                    IdSolicitante: $scope.filtro.solicitante.Id,
                                    IdEstado: $scope.filtro.estado ? $scope.filtro.estado.Id : undefined,
                                    // IdDestino: $scope.filtro.destino,
                                    FechaDesde: $scope.filtro.fechas.startDate.toDate().toJSON(),
                                    FechaHasta: $scope.filtro.fechas.endDate.toDate().toJSON()
                                },
                                draw: d.draw,
                                length: d.length,
                                start: d.start
                            }
                        };
                    },
                    dataSrc: 'data'
                },
                language: {
                    url: '/Assets/js/tablas/i18n.json'
                },
                columns: [
                    {title: "Nro.Solicitud", data: "Codigo"},
                    {title: "Tipo Servicio", data: "TipoServicio"},
                    {title: "Prioridad", data: "Prioridad"},
                    {title: "Solicitante", data: "Solicitante"},
                    {title: "Estado", data: "Estado"},
                    {title: "F.Registro", data: "FechaRegistro"},
                    {title: "F.Estimada", data: "FechaEstimadaAtencion"},
                    {title: "F.Entrega", data: "FechaDisponibilidad"}
                ],
                columnDefs: [
                    {
                        render: function (data, type, row) {
                            var f = '';
                            if (data) {
                                const m = moment(data);
                                if (m.isValid()) {
                                    f = m.format('DD/MM/yyyy h:mm a');
                                }
                            }
                            return f;
                        },
                        targets: 5
                    },
                    {
                        render: function (data, type, row) {
                            var f = '';
                            if (data) {
                                const m = moment(data);
                                if (m.isValid()) {
                                    f = m.format('DD/MM/yyyy h:mm a');
                                }
                            }
                            return f;
                        },
                        targets: 6
                    },
                    {
                        render: function (data, type, row) {
                            var f = '';
                            if (data) {
                                const m = moment(data);
                                if (m.isValid()) {
                                    f = m.format('DD/MM/yyyy h:mm a');
                                }
                            }
                            return f;
                        },
                        targets: 7
                    }
                ]
            });
            $scope.cargando = false;
        }
        $scope.nuevo = () => {
            $state.go('rtRegistroDistribucion', {
                id: 0
            });
        }
    }

    function gdMisSolicitudesCtrl($scope, $rootScope) {
        $("#BodyAsp").hide();
        $scope.tbMisSolicitudes = $('#tbMisSolicitudes').DataTable({
            dom: 'Blfrtip',
            data: [],
            buttons: [
                {
                    text: '<i class="fas fa-database"></i> Ver',
                    action: function (e, dt, node, config) {
                        var filas = tablaoperarios.rows('.selected').data().toArray();
                    }
                },
                {
                    extend: 'excelHtml5',
                    text: 'Exp.Excel'
                }
            ],
            initComplete: function () {

            },
            language: {
                url: '/Assets/js/tablas/i18n.json'
            },
            columns: [
                {title: "Nro.Solicitud", data: "num_sol"},
                {title: "Tipo Servicio", data: "tipo_servicio"},
                {title: "Agencia Destino", data: "agencia_destino"},
                {title: "Solicitante", data: "solicitante"},
                {title: "Nro.Orden Entrega", data: "num_orden_entrega"},
                {title: "F.Envio", data: "fenvio"},
                {title: "F.Entrega", data: "fentrega"}
            ],
            columnDefs: [
                {
                    render: function (data, type, row) {
                        return "Eulen";
                    },
                    targets: 0
                }
            ]
        });
    }

    function gdReportes($scope, $rootScope, $window, DISTRIBUCION) {
        $("#BodyAsp").hide();
        const url = $("#hdnAngularApi").val();
        $scope.cargando = false;

        $scope.filtros_extraer = {
            fechas: {
                startDate: moment().subtract(1, 'months'),
                endDate: moment()
            }
        };

        $scope.filtros = {
            fechas: {
                startDate: moment(),
                endDate: moment()
            }
        };

        $scope.filtros2 = {
            fechas: {
                startDate: moment(),
                endDate: moment()
            }
        };

        $scope.filtros3 = {
            fechas: {
                startDate: moment(),
                endDate: moment()
            }
        };

        $scope.filtros4 = {
            fechas: {
                startDate: moment().subtract(1, 'months'),
                endDate: moment()
            }
        };

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        async function encriptarBody(url, data) {
            if (data != null) {
                const settings = {
                    method: 'POST',
                    headers: {
                        "Accept": 'application/json',
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({
                        "Body": JSON.stringify(data),
                        "Token": "MIw3lILd1k4GwoAuelSGjwPVepY"
                    })
                };
                const fetchResponse = await fetch(`${url}/Usuario/Encriptar`, settings);
                const encry = await fetchResponse.json();
                return {
                    "data": encry
                };
            } else {
                return null;
            }
        }

        $scope.exportar = function () {
            $scope.cargando = true;
            let req = encriptarBody(url, {
                IdCliente: 62,
                FechaDesde: $scope.filtros_extraer.fechas.startDate.format('YYYY-MM-DD'),
                FechaHasta: $scope.filtros_extraer.fechas.endDate.format('YYYY-MM-DD')
            }).then((res) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", url + `/DIS/DescargarReporteDetallado`);
                xhr.setRequestHeader('Content-type', 'application/json')
                xhr.setRequestHeader('Authorization', `Bearer ${$window.localStorage.token}`);
                xhr.onload = () => {
                    const res = JSON.parse(xhr.response);
                    if (res.TipoResultado === 1) {
                        var bin = atob(res.archivo.arrArchivo);
                        var ab = s2ab(bin); // from example above
                        var blob = new Blob([ab], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;'});
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = res.archivo.Nombre;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } else {
                        toast.info('Info Edi!', res.Mensaje);
                    }
                    $scope.cargando = false;
                };
                xhr.send(JSON.stringify(res));
            });
        }

        $scope.buscarRpt1 = function () {
            $scope.cargando = true;
            const req = {
                IdCliente: 62,
                FechaDesde: $scope.filtros.fechas.startDate.format('YYYY-MM-DD'),
                FechaHasta: $scope.filtros.fechas.endDate.format('YYYY-MM-DD')
            }
            DISTRIBUCION.reporteOrdenesXKilo(req).then((res) => {
                $scope.cargando = false;
                var ctx1 = document.getElementById("rpt1").getContext("2d");
                $scope.chart1 = new Chart(ctx1, {
                    type: 'bar',
                    data: res,
                    options: {
                        barValueSpacing: 20,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                }
                            }]
                        }
                    }
                });
            });
        }

        $scope.buscarRpt2 = function () {
            $scope.cargando = true;
            //ENVIO 343
            //RECOJO 344
            const req = {
                IdCliente: 62,
                IdTipo: 344,
                FechaDesde: $scope.filtros2.fechas.startDate.format('YYYY-MM-DD'),
                FechaHasta: $scope.filtros2.fechas.endDate.format('YYYY-MM-DD')
            }
            DISTRIBUCION.reporteCumplimientoXZonales(req).then((res) => {
                $scope.cargando = false;
                var ctx2 = document.getElementById("rpt2").getContext("2d");
                $scope.chart2 = new Chart(ctx2, {
                    type: 'bar',
                    data: res,
                    options: {
                        barValueSpacing: 20,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                }
                            }]
                        }
                    }
                });
            });
        }

        $scope.buscarRpt3 = function () {
            $scope.cargando = true;
            const req = {
                IdCliente: 62,
                FechaDesde: $scope.filtros3.fechas.startDate.format('YYYY-MM-DD'),
                FechaHasta: $scope.filtros3.fechas.endDate.format('YYYY-MM-DD')
            }
            DISTRIBUCION.reporteSolicitudesXEstado(req).then((res) => {
                $scope.cargando = false;
                var ctx3 = document.getElementById("rpt3").getContext('2d');
                ctx3.canvas.width = 1000;
                ctx3.canvas.height = 300;
                $scope.chart3 = new Chart(ctx3, {
                    type: 'pie',
                    data: res
                });
                // $scope.chart3.data.datasets = res;
                // $scope.chart3.update();
            });
        }
        $scope.buscarRpt4 = function () {
            $scope.cargando = true;
            const req = {
                IdCliente: 62,
                FechaDesde: $scope.filtros4.fechas.startDate.format('YYYY-MM-DD'),
                FechaHasta: $scope.filtros4.fechas.endDate.format('YYYY-MM-DD')
            }
            DISTRIBUCION.reporteCalificaciones(req).then((res) => {
                $scope.cargando = false;
                var ctx4 = document.getElementById("rpt4").getContext("2d");
                $scope.chart4 = new Chart(ctx4, {
                    type: 'bar',
                    data: res,
                    options: {
                        barValueSpacing: 20
                    }
                });
            });
        }
    }

    //PREGUNTAS FRECUENTES
    function pfPreguntasCtrl($scope, $uibModal, ADMINISTRADOR, RESOURCES, toast) {
        $("#BodyAsp").hide();
        $scope.cargando = true;
        const url = $("#hdnAngularApi").val();
        let pregunta = {};
        $scope.buscar = '';
        $scope.modulos = [];
        $scope.pf = {};
        $scope.cargando = false;
        $scope.preguntasList = [];

        $scope.maxSize = 5;
        $scope.bigTotalItems = 0;
        $scope.bigCurrentPage = 1;

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        $scope.mostrarImagenes = function (item) {
            const modal = $uibModal.open({
                animation: true,
                templateUrl: 'imagenes.html',
                size: 'lg',
                resolve: {
                    item: function () {
                        return item;
                    }
                },
                controller: function ($scope, $http, $uibModalInstance, item) {
                    $scope.cargando = false;
                    $scope.adj = [];
                    $scope.data = item;
                    $scope.descargar = function (x) {
                        var bin = atob(x.arrArchivo);
                        var ab = s2ab(bin);
                        var blob = new Blob([ab], {type: 'image/png'});
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = x.Nombre;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    $scope.obtenerAdjuntos = function () {
                        $scope.cargando = true;
                        const req = {
                            CodigoTabla: 1015,
                            IdEntidad: item.Id,
                            NumeroGrupo: 0,
                            RetornarAdjuntosEnBytes: true
                        };
                        RESOURCES.postObtenerAdjunto(req).then((res) => {
                            $scope.adj = res.ListAdjuntos;
                            $scope.cargando = false;
                        });
                    }

                    $scope.obtenerAdjuntos();

                    $scope.cerrarModal = function () {
                        $uibModalInstance.close();
                    }
                }
            });
            modal.result.then(function (f) {
                if (f) {

                }
            });
        }
        ADMINISTRADOR.obtenerModulos().then((res) => {
            $scope.modulos = res;
        });
        $scope.obtenerTodo = function () {
            $scope.cargando = true;
            const req = {
                filtros: {
                    filtro: $scope.buscar !== '' ? $scope.buscar : null,
                    IdModulo: $scope.pf.Modulo != null ? $scope.pf.Modulo.Id : null
                },
                paginacion: {cantidad: $scope.maxSize, NumeroPagina: $scope.bigCurrentPage}
            };
            ADMINISTRADOR.obtenerPreguntasPaginado(req).then((res) => {
                if (res.TipoResultado === 1) {
                    $scope.bigTotalItems = res.paginacion.TotalRegistros;
                    $scope.preguntasList = res.Lista;
                }
                $scope.cargando = false;
            });
        }
        $scope.obtenerTodo();
    }

    //ADMINISTRACION
    function admPreguntasFrecuentesCtrl($scope, $rootScope, ADMINISTRADOR, RESOURCES, toast) {
        $("#BodyAsp").hide();
        $scope.cargando = false;
        $scope.mostrarEditar = true;
        $scope.pf = {};
        $scope.editarPf = {};
        $scope.modulos = [];
        $scope.preguntasList = [];
        $scope.adjuntosFile = null;

        $scope.seleccionados = [];
        $scope.adj = [];

        $scope.maxSize = 5;
        $scope.bigTotalItems = 0;
        $scope.bigCurrentPage = 1;

        $scope.obtenerTodo = function () {
            const req = {
                filtros: {},
                paginacion: {cantidad: 10, NumeroPagina: 1}
            };
            ADMINISTRADOR.obtenerPreguntasPaginado(req).then((res) => {
                if (res.TipoResultado === 1) {
                    $scope.preguntasList = res.Lista;
                }
            });
        }

        $scope.onChange = function (item) {
            var pos = $scope.seleccionados.indexOf(item);
            if (pos >= 0) {
                _.remove($scope.seleccionados, {
                    Id: item.Id
                });
            } else {
                $scope.seleccionados.push(item);
            }
            $scope.mostrarEditar = !$scope.seleccionados.length > 0;
        }

        $scope.limpiar = function () {
            $scope.pf = {};
            $scope.editarPf = {};
            $scope.adj = [];
        }

        $scope.editar = function (item) {
            if ($scope.seleccionados.length === 1) {
                $scope.editarPf = $scope.seleccionados[0];
                $scope.pf.Modulo = _.find($scope.modulos, {Nombre: $scope.editarPf.Modulo});
                $scope.pf.Pregunta = $scope.editarPf.Pregunta;
                $scope.pf.Respuesta = $scope.editarPf.Respuesta;
                $scope.pf.TodosClientes = $scope.editarPf.AplicaTodosLosClientesEstado !== 'NO';
                $scope.obtenerAdjuntos($scope.editarPf);
            } else {
                toast.info('Info Edi!', 'Solo se puede editar uno a la vez!');
            }
        }

        $scope.convertir = function (file) {
            return new Promise((resolve, reject) => {
                var reader = new FileReader();
                var fileByteArray = [];
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        var arrayBuffer = evt.target.result,
                            array = new Uint8Array(arrayBuffer);
                        for (var i = 0; i < array.length; i++) {
                            fileByteArray.push(array[i]);
                        }
                        resolve(fileByteArray);
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        }

        $scope.borrarAdjunto = function () {
            this.adjuntosFile = undefined;
            $('#adjunto').val(null);
        }

        $scope.obtenerAdjuntos = function (item) {
            $scope.cargando = true;
            const req = {
                CodigoTabla: 1015,
                IdEntidad: item.Id,
                NumeroGrupo: 0,
                RetornarAdjuntosEnBytes: true
            };
            RESOURCES.postObtenerAdjunto(req).then((res) => {
                $scope.adj = res.ListAdjuntos;
                $scope.cargando = false;
            });
        }

        $scope.enviarAdjuntos = async function (entidadId) {
            const base64 = await $scope.convertir(this.adjuntosFile);
            const req = {
                IdEntidad: entidadId,
                UsuarioLogin: $rootScope._usuario.Id,
                CodigoTabla: 1015,
                ListArchivos: [{Nombre: this.adjuntosFile.name, arrArchivo: base64}]
            };
            return RESOURCES.postGuardarAdjunto(req);
        }

        $scope.guardarPregunta = function () {
            $scope.cargando = true;
            if ($scope.editarPf.Id) {
                const req = {
                    Id: $scope.editarPf.Id,
                    IdModulo: $scope.pf.Modulo.Id,
                    Pregunta: $scope.pf.Pregunta,
                    Respuesta: $scope.pf.Respuesta,
                    AplicaTodosLosClientes: $scope.pf.TodosClientes,
                    ListIdsClientes: $scope.pf.TodosClientes ? [] : [$rootScope._cliente.Id]
                };
                ADMINISTRADOR.putPreguntas(req).then((res) => {
                    if (res.TipoResultado === 1) {
                        $scope.enviarAdjuntos($scope.editarPf.Id).then((respuesta) => {
                            this.adjuntosFile = undefined;
                            $('#adjunto').val(null);
                            $scope.adj = [];
                        });
                        $scope.pf = {};
                        toast.info('Info Edi!', res.Mensaje);
                        $scope.obtenerTodo();
                    }
                    $scope.cargando = false;
                });
            } else {
                const req = {
                    IdModulo: $scope.pf.Modulo.Id,
                    Pregunta: $scope.pf.Pregunta,
                    Respuesta: $scope.pf.Respuesta,
                    AplicaTodosLosClientes: $scope.pf.TodosClientes,
                    ListIdsClientes: $scope.pf.TodosClientes ? [] : [$rootScope._cliente.Id]
                };
                ADMINISTRADOR.postPreguntas(req).then((res) => {
                    if (res.TipoResultado === 1) {
                        $scope.enviarAdjuntos(res.Id).then((respuesta) => {
                            if (respuesta.TipoResultado === 1) {
                                toast.info('Info Edi!', res.Mensaje);
                                $scope.cargando = false;
                                $scope.pf = {};
                                this.adjuntosFile = undefined;
                                $('#adjunto').val(null);
                                $scope.obtenerTodo();
                            }
                        });
                    }
                });
            }
        }

        ADMINISTRADOR.obtenerModulos().then((res) => {
            $scope.modulos = res;
        });

        $scope.obtenerTodo();
    }

}