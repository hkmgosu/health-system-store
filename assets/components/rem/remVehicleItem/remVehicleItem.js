(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-vehicle-item remVehicle=""></ssvq-rem-vehicle-item>
     */
    app.directive('ssvqRemVehicleItem', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                remVehicle: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remVehicleItem/remVehicleItem.html'
        };
    });

    /* @ngInject */
    function ComponentController($element, $remVehicleDialog, remFactory, $mdToast, $mdDialog, remVehicleFactory, vehicleStatusFactory) {
        var vm = this;
        vm.vehicleStatusList = [];
        /**
         * Actualización de un despacho
         */
        var saveRemVehicle = (remVehicleUpdated) => {
            remVehicleUpdated.rem = vm.remVehicle.rem;
            /**
             * Si el despacho se encuentra en estado "agregado" y se asigna un 
             * móvil, entonces se cambia el estado a "despachado"
             */
            if (remVehicleUpdated.status &&
                remVehicleUpdated.status.id === 10 &&
                (remVehicleUpdated.vehicle || remVehicleUpdated.particularDescription)
            ) {
                remVehicleUpdated.status = _.find(vm.vehicleStatusList, { id: 3 });
            }
            remFactory.saveRemVehicle(remVehicleUpdated, 'vehicleEdited')
                .then(() => {
                    $mdToast.showSimple('Despacho actualizado exitosamente');
                }, () => $mdToast.showSimple('Hubo un error al guardar despacho, por favor inténtelo nuevamente'));
        };
        vm.showVehicleDialog = ($event, remVehicle) => {
            $remVehicleDialog
                .showDialog($event, angular.copy(remVehicle))
                .then(remVehicleUpdated => {
                    if (remVehicleUpdated.deleted) {
                        remFactory.saveRemVehicle(remVehicleUpdated, 'vehicleRemoved')
                            .then(() => {
                                $element.remove();
                                $mdToast.showSimple('Despacho eliminado del incidente');
                            })
                            .catch(() => $mdToast.showSimple('Hubo un error al quitar despacho, por favor inténtelo nuevamente'));
                    } else {
                        saveRemVehicle(remVehicleUpdated);
                    }
                })
                .catch(err => console.log('Se cerró el dialog sin guardar', err));
        };
        vm.onStatusClick = (vehicle, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/rem/remVehicleItem/dialog.statusSelector.html',
                /* @ngInject */
                controller: function ($mdDialog, vehicleStatusFactory, vehicleFactory) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.newStatus);

                    vm.selectStatus = status => {
                        vm.vehicleStatusList.map(statusItem => statusItem.selected = false);
                        status.selected = true;
                        vm.newStatus = angular.copy(status);
                    };
                    vm.currentStatus = angular.copy(vm.remVehicle.status);
                    _.find(vm.vehicleStatusList, { id: vm.remVehicle.status.id }).selected = true;

                    vehicleFactory.getRemLog(vm.remVehicle.id).then(logList => {
                        logList = _.filter(logList, { type: 'vehicleStatusChanged' });
                        logList.forEach(log => {
                            _.find(vm.vehicleStatusList, { id: log.status.id }).log = log;
                        });
                    });

                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    remVehicle: vm.remVehicle,
                    vehicleStatusList: angular.copy(vm.vehicleStatusList)
                }
            }).then(vehicleStatus => {
                let idVehicle = vm.remVehicle.vehicle ? vm.remVehicle.vehicle.id : null;
                remVehicleFactory
                    .updateStatus(vm.remVehicle.id, idVehicle, vehicleStatus.id)
                    .then(() => {
                        vm.remVehicle.status = vehicleStatus;
                        $mdToast.showSimple('Estado del despacho actualizado exitosamente');
                    }).catch(() => {
                        $mdToast.showSimple('Ocurrió un error actualizando el estado de despacho');
                    });
            }).catch(() => { });
        };

        vehicleStatusFactory
            .getAll(['ensalida', 'salidafinalizada'])
            .then(data => vm.vehicleStatusList = data)
            .catch(() => vm.vehicleStatusList = []);
    }
})();