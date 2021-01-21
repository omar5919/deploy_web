var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
if (isChrome) {
    'use strict';
    var app = angular.module('APPservice', ['ui.router']);

    async function encriptar(url, data) {
        if (data != null) {
            const settings = {
                method: 'POST',
                headers: {
                    "Accept": 'application/json',
                    "Content-Type": 'application/json'
                    //application/json;charset=UTF-8
                },
                body: JSON.stringify({
                    "Body": data.toString(),
                    "Token": "MIw3lILd1k4GwoAuelSGjwPVepY"
                })
            };
            const fetchResponse = await fetch(`${url}/Usuario/Encriptar`, settings);
            return await fetchResponse.json();
        } else {
            return null;
        }
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

    app.factory('toast', function () {
        toastr.options = {
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-bottom-right'
        };
        return {
            ok: function (titulo, texto) {
                toastr.success(texto, titulo);
            },
            err: function (titulo, texto) {
                toastr.error(texto, titulo);
            },
            info: function (titulo, texto) {
                toastr.info(texto, titulo);
            },
            info2: function (titulo, texto) {
                toastr.info(texto, titulo, {timeOut: 10000});
            },
            clear: function () {
                toastr.clear();
            }
        };
    });
    app.factory('minPanel', function () {
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
        };
    });
    app.factory('BMS', ($http, $q, $rootScope) => {
        const url = $rootScope.appapi;
        return {
            listarEquipos: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/BMS/ListarEquiposAireAcondicionadosBMS', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            encenderEquipos: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/BMS/CambiarEncendidoAireAcondicionadoBMS', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            modificarTemperaturaEquipos: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/BMS/CambiarTemperaturaACondicionadoBMS', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            obtenerEquiposPorInmueble: async function (inmuebleId) {
                let defered = $q.defer();
                let promise = defered.promise;
                inmuebleId = await encriptar(url, inmuebleId);
                $http.get(url + `/BMS/ListarEquiposSensorEnergia?IdInmueble=${inmuebleId}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerGraficoBms: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/BMS/ListarEquiposElectricosGrafico', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            }
        };
    });
    app.factory('RESOURCES', ($http, $q, $rootScope) => {
        const url = $("#hdnAngularApi").val();
        return {
            obtenerListaValores: async (idLista, idCliente) => {
                let defered = $q.defer();
                let promise = defered.promise;
                idLista = await encriptar(url, idLista);
                idCliente = await encriptar(url, idCliente);
                $http.get(url + `/ADM/ListaValores/ListarActivosxIdLista?pIdLista=${idLista}&pIdCliente=${idCliente}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data.ListaEntidadComun);
                    });
                return promise;
            },
            getClientesPorUsuario: function () {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.get(url + '/ADM/Cliente/ListarActivosxUsuario')
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getSolicitante: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req.idcliente = await encriptar(url, req.idcliente);
                req.nombre = await encriptar(url, req.nombre);
                $http.get(url + '/SEG/Usuario/ListarActivosXClienteyNombre?IdCliente=' + req.idcliente + '&Nombre=' + req.nombre + '')
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getTipoSolicitud: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req.idcliente = await encriptar(url, req.idcliente);
                $http.get(url + '/SOL/TipoSolicitud/ListarActivosxUsuario?pIdCliente=' + req.idcliente)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getGrupoUnidad: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/ADM/UnidadMantenimiento/BuscarGrupoUnidadMantenimientoActivos', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getClasificacionDelProblema: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req.idgrupo = await encriptar(url, req.idgrupo);
                req.idunidad = await encriptar(url, req.idunidad);
                $http.get(url + '/SOL/Parametros/ListarClasificacionProblemaActivos?IdGrupoMantenimiento=' + req.idgrupo + '&IdUnidadMantenimiento' + req.idunidad + '')
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getTipoRiesgo: function () {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.get(url + '/SOL/Parametros/ListarTipoRiesgoActivos')
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            validarGrupoUnidad: async function (unidadMantenimientId) {
                let defered = $q.defer();
                let promise = defered.promise;
                unidadMantenimientId = await encriptar(url, unidadMantenimientId);
                $http.get(url + '/ADM/UnidadMantenimiento/ObtenerDatosSolicitud?pIdUnidadMantenimiento=' + unidadMantenimientId)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getArbolInmuebles: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/INM/ListarActivosEnFormatoArbol', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            getArbolGrupoUnidad: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/ADM/UnidadMantenimiento/BuscarGrupoUnidadMantenimientoArbolActivos', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            getInmuebles: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req.idcliente = await encriptar(url, req.idcliente);
                req.filtro = await encriptar(url, req.filtro);
                $http.get(url + '/INM/ListarActivosxClienteyUsuario?pIdCliente=' + req.idcliente + '&Nombre=' + req.filtro)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getEdificios: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req.idinmueble = await encriptar(url, req.idinmueble);
                $http.get(url + '/INM/Edificio/ListarActivosxInmueble?pIdInmueble=' + req.idinmueble + '')
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getNiveles: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req.idedificio = await encriptar(url, req.idedificio);
                $http.get(url + '/INM/Nivel/ListarActivosxEdificio?pIdEdificio=' + req.idedificio + '')
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getAmbientes: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req.idnivel = await encriptar(url, req.idnivel);
                $http.get(url + '/INM/Area/ListarActivosxNivel?pIdNivel=' + req.idnivel + '')
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getInfoBaseSolicitud: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/SOL/ObtenerInfoBaseRegistroSolicitud', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            postGuardarAdjunto: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/ADM/Adjunto/Guardar', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            postGuardarSolicitud: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/SOL/Grabar', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            postObtenerAdjunto: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/ADM/Adjunto/Listar', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            postBuscarEquipoXnombre: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/INM/Equipo/BuscarEquipoSolicitud', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            postObtenerAprobadores: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/SOL/ReglaAsignacion/ObtenerAprobadoresRequerimiento', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            obtenerArbolEnCombo: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/INM/ListarUbicacionEnFormatoArbol', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerLogAcciones: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req.tabla = await encriptar(url, req.tabla);
                req.entidad = await encriptar(url, req.entidad);
                $http.get(url + '/SEG/LogAccion/ListarxEntidad?CodigoTabla=' + req.tabla + '&IdEntidad=' + req.entidad)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            guardarSesion: function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.get('../../Handlers/Sesiones.ashx?id=' + req).then((res, err) => {
                    if (err) defered.reject(err);
                    else defered.resolve(res.data);
                });
                return promise;
            }
        };
    });
    app.factory('DISTRIBUCION', ($http, $q, $rootScope) => {
        const url = $("#hdnAngularApi").val();
        return {
            obtenerAgencias: async (idCliente, buscar) => {
                //caso que el tipo de Origen sea Sede principal : ObtenerInmueblePrincipal
                let defered = $q.defer();
                let promise = defered.promise;
                idCliente = await encriptar(url, idCliente);
                buscar = await encriptar(url, buscar);
                $http.get(url + `/INM/ListarporClienteGeneral?pIdCliente=${idCliente}&Nombre=${buscar}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerInmueblePrincipal: async (idCliente) => {
                //caso que el tipo de Origen sea Sede principal : ObtenerInmueblePrincipal
                let defered = $q.defer();
                let promise = defered.promise;
                idCliente = await encriptar(url, idCliente);
                $http.get(url + `/DIS/ObtenerInmueblePrincipal?IdCliente=${idCliente}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerAlmacenes: async (idCliente) => {
                //ListarAlmacenesActivosxCiente en caso el origen sea almacén
                let defered = $q.defer();
                let promise = defered.promise;
                idCliente = await encriptar(url, idCliente);
                $http.get(url + `/MAT/ListarAlmacenesActivosxCiente?IdCliente=${idCliente}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerProveedores: async (idCliente) => {
                //ObtenerProveedorCourier en el caso que el origen sea Proveedor
                let defered = $q.defer();
                let promise = defered.promise;
                idCliente = await encriptar(url, idCliente);
                $http.get(url + `/DIS/ObtenerProveedorCourier?IdCliente=${idCliente}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerCentroCosto: async (idCliente) => {
                //ObtenerProveedorCourier en el caso que el origen sea Proveedor
                let defered = $q.defer();
                let promise = defered.promise;
                idCliente = await encriptar(url, idCliente);
                $http.get(url + `/ADM/Cliente/ListarUnidadesOrganizativas?IdCliente=${idCliente}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerUbigeo: async (buscar) => {
                let defered = $q.defer();
                let promise = defered.promise;
                buscar = await encriptar(url, buscar);
                $http.get(url + `/ADM/Ubigeo/ListarxFiltro?filtro=${buscar}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            grabarDistribucion: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + `/DIS/Grabar`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            anularDistribucion: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + `/DIS/Anular`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerUsuariosPorInmueble: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptar(url, req);
                $http.get(url + `/SEG/Usuario/ListarxInmueble?IdInmueble=${req}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerBandeja: (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.post(url + `/DIS/ListarPaginado`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerTicketId: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptar(url, req);
                $http.get(url + `/DIS/ObtenerPorId?IdDistribuciones=${req}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerProveedoresDistribucion: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptar(url, req);
                $http.get(url + `/DIS/ObtenerProveedores?IdCliente=${req}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            aprobarRechazar: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + `/DIS/AprobarRechazarSolicitud`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            subirPlantilla: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + `/DIS/ValidarArchivoRegistroMasivo`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            subirPlantillaActualizacionOE: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + `/DIS/ProcesarArchivoDeActualizacion`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            descargarArchivoProveedores: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptar(url, req);
                $http.get(url + `/DIS/DescargarArchivoProveedorDistribucion?IdDistribuciones=${req}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerOrdenEntregaPorId: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptar(url, req);
                $http.get(url + `/DIS/ObtenerOrdenEntregaxId?IdOrdenEntrega=${req}`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            reporteOrdenesXKilo: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + `/DIS/Reportes/ListarReporteOrdenesKilos`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            reporteCumplimientoXZonales: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + `/DIS/Reportes/ListarCumplimientoxZonales`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            reporteCalificaciones: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + `/DIS/Reportes/Calificaciones`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            reporteSolicitudesXEstado: async (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + `/DIS/Reportes/ListarCantidadSolicitudesxEstado`, req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            validarCalificacion: (req) => {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.get(url + `/DIS/ValidarPendientesCalificacion`)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            }
        };
    });
    app.factory('ADMINISTRADOR', ($http, $q, $rootScope) => {
        const url = $("#hdnAngularApi").val();
        return {
            obtenerModulos: async function () {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.get(url + '/ADM/Preguntas/ListarModulos')
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            obtenerPreguntasPaginado: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/ADM/Preguntas/ListarPaginado', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            getPreguntas: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/ADM/Preguntas', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            postPreguntas: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/ADM/Preguntas', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            Calificar: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/ADM/Calificacion/RealizarCalificacion', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            putPreguntas: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.put(url + '/ADM/Preguntas', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
        };
    });
    app.factory('SOLICITUD', function ($http, $q) {
        const url = $("#hdnAngularApi").val();
        return {
            getObtenerMisPendientes: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/SOL/ListarMisPendientesPaginado', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            aprobarRechazarMasiva: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/SOL/Aprobar', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            conformidad: async function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                req = await encriptarBody(url, req);
                $http.post(url + '/SOL/ListarMisPendientesPaginado', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(res.data);
                    });
                return promise;
            },
            setSolicitud: async function (sol) {
                let defered = $q.defer();
                let promise = defered.promise;
                sol = await encriptarBody(url, sol);
                $http.post(api + '/api/solicitud/solicitud', sol)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            setHistorial: async function (historial) {
                let defered = $q.defer();
                let promise = defered.promise;
                historial = await encriptarBody(url, historial);
                $http.post(api + '/api/solicitud/historico', historial)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getSolicitudPorId: function (id) {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.get(api + '/api/solicitud/getsolicitud', {params: {id: id}})
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getPermisosPorUsuarioId: function () {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.get(api + '/api/solicitud/getPermisos')
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getBandejaSolicitudes: function (id) {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.get(api + '/api/solicitud/getBandeja', {params: {id: id}})
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            getUtiles: function (id) {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.get(api + '/api/solicitud/getUtiles', {params: {id: id}})
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            }
        };
    });
    app.factory('SEGURIDAD', function ($http, $rootScope, $window, $q) {
        const url = $("#hdnAngularApi").val();

        function changeUser(user) {
            angular.extend(currentUser, user);
        }

        function urlBase64Decode(str) {
            let output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            let token = $window.localStorage.token;
            let user = {};
            if (typeof token !== 'undefined') {
                const encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        function getPermisos() {
            return {};
        }

        var currentUser = getUserFromToken();

        return {
            validarPermisos: function (permisos) {
                return getPermisos(permisos);
            },
            iniciarApp: function (req) {
                let defered = $q.defer();
                let promise = defered.promise;
                $http.post(url + '/Autenticacion', req)
                    .then((res, err) => {
                        if (err) defered.reject(err);
                        else defered.resolve(JSON.parse(res.data));
                    });
                return promise;
            },
            validarCredenciales: function () {
                var deferred = $q.defer();
                $http.get(api + '/api/login/validarToken')
                    .success(function (res) {
                        deferred.resolve(JSON.parse(res));
                    })
                    .error(function (err) {
                        console.log(err);
                        deferred.reject('ERROR');
                    });
                return deferred.promise;
            },
            salir: function () {
                changeUser({});
                delete $window.localStorage.token;
                $window.location.href = api === '' ? '/' : api;
            }
        };
    });
    app.directive('gps', function () {
        return {
            restrict: 'E',
            link: function (scope, element, attrs) {
                var gps = new google.maps.Geocoder();
                var latlng = new google.maps.LatLng(attrs.lat, attrs.lon);
                gps.geocode({
                    'latLng': latlng
                }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            element.text(results[1].formatted_address);
                        } else {
                            element.text('Location not found');
                        }
                    } else {
                        element.text('Geocoder failed due to: ' + status);
                    }
                });
            },
            replace: true
        };
    });
}