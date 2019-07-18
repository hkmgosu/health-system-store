(function () {
    'use strict';
    /**
     * Example
     * <ssvq-vehicle-maintainer></ssvq-vehicle-maintainer>
     */
    app.directive('ssvqVehicleMaintainer', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/vehicle/vehicleMaintainer/vehicleMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, vehicleFactory, vehicleStatusFactory, $mdSidenav, $mdMedia, leafletData) {
        var vm = this;
        vm.page = 1;
        vm.limit = 200;
        vm.searchText = '';

        let onDelete = id => _.remove(vm.vehicleList, { id: id });

        var vehicleMap = L.map('ssvqMap', {
            scrollWheelZoom: false,
            maxZoom: 18,
            minZoom: 3
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vehicleMap);

        var vehicleMarkerList = L.markerClusterGroup({
            disableClusteringAtZoom: 16
        });

        vehicleMap.addLayer(vehicleMarkerList);

        vm.vehicleSelected = {};

        vm.selectView = view => {
            vm.selectedView = view;
            if (view === 'map') {
                setTimeout(() => {
                    vehicleMap.invalidateSize();
                    vm.updateBounds();
                });
            }
        };

        vm.get = () => {
            vehicleFactory.get({
                filter: vm.searchText,
                page: vm.page,
                limit: vm.limit,
                sort: { updatedAt: 0 }
            }).then(data => {
                // Limpiar marcadores actuales
                vehicleMarkerList.clearLayers();
                // Agregar marcadores al mapa
                data.vehicles.forEach(vehicle => {
                    if (!_.isEmpty(vehicle.position)) {
                        let marker = L.marker(L.latLng(vehicle.position.coordinates[1], vehicle.position.coordinates[0]), {
                            id: vehicle.id,
                            icon: L.divIcon({
                                className: 'vehicle-marker',
                                iconSize: L.point(40, 50),
                                html: '<div class="vehicle-pin animated bounceIn layout-align-center-center layout-column">' +
                                    '<span class="md-caption vehicle-name">' + vehicle.name + '</span>' +
                                    '<md-icon class="layout-align-center-center layout-row zmdi zmdi-truck vehicle-status vehicle-icon ' + vehicle.status.type + '"></md-icon>' +
                                    '</div>'
                            })
                        });
                        marker.on('click', (e) => {
                            vm.onVehicleItemClick(_.find(vm.vehicleList, { id: e.target.options.id }));
                        });
                        vehicleMarkerList.addLayer(marker);
                    }
                });
                vm.updateBounds();

                vm.vehicleList = data.vehicles;
                vm.count = data.count;
            });
        };

        if ($mdMedia('xs')) {
            vm.selectedView = 'list';
        }

        vm.updateBounds = () => {
            if (_.isEmpty(vehicleMarkerList.getLayers())) { return; }
            vehicleMap.fitBounds(vehicleMarkerList.getBounds().pad(0.005));
        };

        vm.onVehicleItemClick = (vehicle) => {
            if (vehicle.position) {
                vehicleMap.setView(L.latLng(vehicle.position.coordinates[1], vehicle.position.coordinates[0]), 15);
            } else {
                $mdToast.showSimple('Vehículo sin ubicación GPS');
            }
        };

        vm.onVehicleItemEditClick = (vehicle, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                multiple: true,
                clickOutsideToClose: true,
                templateUrl: '/components/vehicle/vehicleMaintainer/dialog.save.tmpl.html',
                /* @ngInject */
                controller: function DialogController($mdDialog, vehicleFactory) {
                    var vm = this;
                    vm.save = () => {
                        $mdDialog.hide(vm.temp);
                    };
                    vm.participantListOpts = {
                        onlyRead: true,
                        employeeFields: {
                            job: true
                        }
                    };
                    vm.cancel = () => $mdDialog.cancel();
                    vm.delete = () => {
                        $mdDialog.show(
                            $mdDialog.confirm()
                                .parent(angular.element(document.querySelector('#vehicle-dialog')))
                                .clickOutsideToClose(true)
                                .title('¿Estás seguro de eliminar el vehículo?')
                                .textContent('La información del vehículo será eliminada permanentemente')
                                .ariaLabel('¿Estás seguro de eliminar el vehículo?')
                                .ok('Eliminar vehículo')
                                .cancel('Volver')
                                .multiple(true)
                        ).then(() => {
                            vehicleFactory.delete(vm.temp.id)
                                .then(() => {
                                    vm.onDelete(vm.temp.id);
                                    $mdToast.showSimple('Vehículo eliminado');
                                }, () => {
                                    $mdToast.showSimple('El vehículo no pudo ser eliminado');
                                });
                            $mdDialog.hide();
                        });
                    };
                    // Obtener historial REMS de vehículo
                    vehicleFactory.getRemHistory(vm.temp.id).then(remVehicles => vm.remVehicles = remVehicles);

                    // Obtener turno en curso
                    vehicleFactory.getCurrentCareTeam(vm.temp.id).then(
                        careTeam => vm.currentCareTeam = careTeam,
                        err => vm.currentCareTeam = 'Not Found'
                    );
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    temp: angular.copy(vehicle),
                    onDelete: onDelete
                }
            }).then(vehicle => {
                if (!vehicle) { return; }
                $mdToast.showSimple($translate.instant('VEHICLE.OTHERS.SAVING'));
                if (!vehicle.id) {
                    vehicle.status = _.find(vm.vehicleStatusList, { id: 2 });
                }
                vehicleFactory.save({
                    id: vehicle.id,
                    name: vehicle.name,
                    idGPS: vehicle.idGPS,
                    establishment: vehicle.establishment.id
                }).then(vehicleSaved => {
                    if (vehicle.id) {
                        _.merge(_.find(vm.vehicleList, { id: vehicle.id }), vehicle);
                        $mdToast.showSimple('Vehículo actualizado exitosamente');
                    } else {
                        vehicle.id = vehicleSaved.id;
                        vm.vehicleList.unshift(vehicle);
                        vm.count++;
                        $mdToast.showSimple('Vehículo creado exitosamente');
                    }
                }, (err) => {
                    debugger;
                });
            });
        };

        vehicleStatusFactory
            .getAll(['disponible', 'nodisponible', 'ensalida'])
            .then(vehicleStatusList => vm.vehicleStatusList = vehicleStatusList)
            .catch(() => vm.vehicleStatusList = []);

        $scope.$watch('vm.searchText', () => {
            vm.vehicleList = null;
            vm.get();
        });

        vm.onStatusClick = vehicle => {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/vehicle/vehicleMaintainer/dialog.statusChanged.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.currentStatus);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    vehicle: vehicle,
                    vehicleStatusList: _.filter(vm.vehicleStatusList, status => {
                        return (['disponible', 'nodisponible'].indexOf(status.type) !== -1)
                    })
                }
            }).then(vehicleStatus => {
                vehicleFactory.updateStatus(vehicle.id, vehicleStatus.id).then(() => {
                    vehicle.status = vehicleStatus;
                    $mdToast.showSimple('Estado actualizado correctamente');
                }, () => {
                    $mdToast.showSimple('Hubo un error actualizando estado de vehículo, lo sentimos.');
                });
            }).catch(() => { });
        };

        vehicleFactory.watch().then(() => { });

        io.socket.on('vehicle', function (event) {
            switch (event.verb) {
                case 'updated':
                    let vehicle = event.data;
                    Object.assign(_.find(vm.vehicleList, { id: vehicle.id }), vehicle);
                    let vehicleMarker = _.find(vehicleMarkerList.getLayers(), layer => layer.options.id === vehicle.id);
                    if (!_.isEmpty(vehicleMarker)) {
                        vehicleMarker.setLatLng(L.latLng(vehicle.position.coordinates[1], vehicle.position.coordinates[0]));
                    }
                    $scope.$apply();
                    break;
            }
        });
    }
})();