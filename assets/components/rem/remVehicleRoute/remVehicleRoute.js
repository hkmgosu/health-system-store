(() => {
    'use strict';
    /**
      * Example
      * <ssvq-rem-vehicle-route></ssvq-rem-vehicle-route>
      */
    app.directive('ssvqRemVehicleRoute', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { idRemVehicle: '=' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/rem/remVehicleRoute/remVehicleRoute.html'
        };
    });

    /* @ngInject */
    function ComponentController(leafletData, vehicleFactory, $scope) {
        var vm = this;

        var vehicleRouteMap = L.map('ssvqVehicleRouteMap', {
            scrollWheelZoom: false,
            maxZoom: 18,
            minZoom: 3
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vehicleRouteMap);

        let routeGroup = L.featureGroup().addTo(vehicleRouteMap);

        let mapStatusColor = [
            { id: 10, color: '#E74C3C', name: 'Agregado' },
            { id: 3, color: '#9B59B6', name: 'Despachado' },
            { id: 4, color: '#2980B9', name: 'En salida' },
            { id: 5, color: '#fab486', name: 'En el lugar' },
            { id: 6, color: '#27AE60', name: 'En traslado' },
            { id: 11, color: '#F1C40F', name: 'Llegada a CA' },
            { id: 12, color: '#D35400', name: 'Recepción de PAC' },
            { id: 9, color: '#BDC3C7', name: 'Camilla retenida' },
            { id: 7, color: '#f58f57', name: 'Vuelta hacia base' },
            { id: 13, color: '#e557f5', name: 'Llegada a base' },
            { id: 8, color: '#7c00c7', name: 'Finalizada' }
        ];

        // Obtener color de estado
        let getStatusColor = idStatus => _.find(mapStatusColor, { id: idStatus })['color'];

        // Actualizar información de listado y rutas mapa
        let updateData = () => {
            // Limpiar información actual
            vm.remLogVehicle = [];
            if (!_.isEmpty(routeGroup.getLayers())) { routeGroup.clearLayers(); }

            vm.routeStatus = 'loading';

            // Obtener información nueva
            async.parallel({
                statusLog: cb => {
                    vehicleFactory.getRemLog(vm.idRemVehicle).then(
                        logList => {
                            let logTmp = _.sortBy(_.filter(logList || [], 'status') || [], 'createdAt');
                            logTmp.forEach(logItem => logItem.style = { color: getStatusColor(logItem.status.id) });
                            vm.remLogVehicle = logTmp;
                            cb(null, vm.remLogVehicle);
                        },
                        err => cb(err || new Error('Error desconocido'))
                    );
                },
                route: cb => {
                    vehicleFactory.getRemVehicleRoute(vm.idRemVehicle).then(
                        route => cb(null, _.sortBy(route || [], 'emittedAt')),
                        err => cb(err || new Error('Error desconocido'))
                    );
                }
            }, (err, results) => {
                if (err) { return console.log(err); }
                let { statusLog, route } = results;
                if (_.isEmpty(route)) {
                    return (vm.routeStatus = 'empty');
                }

                vm.routeStatus = 'loaded';
                statusLog.forEach((statusLogItem, index) => {
                    if (statusLogItem.status) {
                        let tmpPath = [];
                        if (statusLog[index + 1]) {
                            tmpPath = _.remove(route, routeItem => (new Date(routeItem.emittedAt) < new Date(statusLog[index + 1].createdAt)));
                        } else {
                            tmpPath = route || [];
                        }
                        let coordinates = [];
                        tmpPath = _.sortBy(tmpPath || [], 'emittedAt');
                        if (tmpPath.length > 1) {
                            tmpPath.forEach(pathItem => {
                                coordinates.push(L.latLng(pathItem.position.coordinates[1], pathItem.position.coordinates[0]));
                            });
                        }
                        if (_.isEmpty(coordinates)) { return; }

                        routeGroup.addLayer(L.polyline(coordinates, {
                            id: statusLogItem.id,
                            color: statusLogItem.style.color,
                            opacity: 1,
                            weight: 4
                        }));
                    }
                });

                vm.updateBounds();
            });
        };

        // Actualizar bordes del mapa con rutas
        vm.updateBounds = () => {
            if (!_.isEmpty(routeGroup.getLayers())) {
                vehicleRouteMap.fitBounds(routeGroup.getBounds());
            }
        };

        // Hacer click sobre un item list de estado
        vm.selectStatus = (log) => {
            let routeSelected = _.find(routeGroup.getLayers(), route => route.options.id === log.id);
            if (routeSelected) {
                vehicleRouteMap.fitBounds(routeSelected.getBounds());
            }
        };

        // Escuchar cambios sobre id de remVehicle para actualizar data
        $scope.$watch('vm.idRemVehicle', idRemVehicle => {
            if (idRemVehicle) { updateData(idRemVehicle); }
        });
    }
})();