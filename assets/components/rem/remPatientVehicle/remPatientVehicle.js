(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-patient-vehicle idRem=""></ssvq-rem-patient-vehicle>
     */
    app.directive('ssvqRemPatientVehicle', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idRem: '@',
                remVehicleCount: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remPatientVehicle/remPatientVehicle.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, remFactory, $remPatientDialog, $remVehicleDialog, vehicleStatusFactory) {
        var vm = this;

        vm.vehicleStatusList = [];

        /**
         * Obtener info de REM
         */
        remFactory.getVehiclePatientList(vm.idRem)
            .then(
                vehiclePatientList => {
                    vm.remVehicles = vehiclePatientList.remVehicles || [];
                    vm.remPatients = vehiclePatientList.remPatients || [];
                    vm.loaded = true;
                },
                err => {
                    console.log('remFactory.getVehiclePatientList', err)
                    vm.remVehicles = [];
                    vm.remPatients = [];
                    vm.loaded = true;
                });

        vm.showNewRemPatientDialog = ($event) => {
            $remPatientDialog.showDialog($event, {
                rem: vm.idRem,
                patient: { identificationType: 'rut' }
            }).then(() => { }, () => { });
        };

        /**
         * Abrir ventana para ingresar un nuevo despacho
         */
        vm.showCreateRemVehicleDialog = $event => {
            $remVehicleDialog.showDialog($event, {
                rem: vm.idRem,
                participantList: []
            }).then(newRemVehicle => {
                if (newRemVehicle.vehicle || newRemVehicle.particularDescription) {
                    newRemVehicle.status = _.find(vm.vehicleStatusList, { id: 3 });
                } else {
                    newRemVehicle.status = _.find(vm.vehicleStatusList, { id: 10 });
                }
                remFactory.saveRemVehicle(newRemVehicle, 'vehicleEdited').then(
                    () => $mdToast.showSimple('Despacho creado exitosamente'),
                    () => $mdToast.showSimple('Hubo un error al guardar vehículo, por favor inténtelo nuevamente')
                );
            }, err => console.log(err));
        };

        var afterCreateMultiplePatients = patientsCreated => {
            patientsCreated.forEach(remPatient => {
                if (!_.some(vm.remPatients, { id: remPatient.id })) {
                    vm.remPatients.push(remPatient)
                }
            });
            $mdToast.showSimple(patientsCreated.length + ' pacientes agregados');
            $mdDialog.hide();
        };

        /**
         * Permite abrir una ventana para seleccionar cantidad de pacientes
         * a crear simultáneamente
         */
        vm.createMultiplePatients = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/rem/remPatientVehicle/dialog.multiplePatients.html',
                /* @ngInject */
                controller: function ($mdDialog, remFactory, idRem, cb) {
                    var vm = this;
                    vm.close = () => $mdDialog.hide();
                    vm.patientsToCreate = 2;
                    vm.save = () => {
                        if (vm.patientsToCreate <= 0) {
                            return;
                        }
                        remFactory.createMultiplePatients(vm.patientsToCreate, idRem)
                            .then(
                                patientsCreated => cb(patientsCreated),
                                err => console.log(err)
                            );
                    };
                },
                controllerAs: 'vm',
                locals: {
                    idRem: vm.idRem,
                    cb: afterCreateMultiplePatients
                }
            });
        };

        vm.getRemVehicles = () => vm.remVehicles;

        var socketRem = function (event) {
            if (event.id == vm.idRem) {
                let data = event.data.data,
                    message = event.data.message;
                switch (message) {
                    case 'remLogVehicle':
                        let logVehicle = data.log;
                        let remVehicle = data.remVehicle;
                        switch (logVehicle.type) {
                            case 'vehicleCreated':
                                if (!_.some(vm.remVehicles, { id: remVehicle.id })) {
                                    vm.remVehicles.push(remVehicle);
                                }
                                break;
                            case 'vehicleEdited':
                                Object.assign(_.find(vm.remVehicles, { id: remVehicle.id }), remVehicle);
                                break;
                            case 'vehicleRemoved':
                                _.remove(vm.remVehicles, { id: remVehicle.id });
                                break;
                            case 'vehicleStatusChanged':
                                Object.assign(_.find(vm.remVehicles, { id: remVehicle.id }), remVehicle);
                                break;
                        }
                        $scope.$apply();
                        break;
                    case 'remLogPatient':
                        let logPatient = data.log;
                        let remPatient = data.remPatient;
                        switch (logPatient.type) {
                            case 'patientCreated':
                                if (!_.some(vm.remPatients, { id: remPatient.id })) {
                                    vm.remPatients.push(remPatient);
                                }
                                break;
                            case 'patientEdited':
                                _.merge(_.find(vm.remPatients, { id: remPatient.id }), remPatient);
                                break;
                            case 'patientRemoved':
                                _.remove(vm.remPatients, { id: remPatient.id });
                                break;
                            case 'patientBasicEvolution':
                                _.merge(_.find(vm.remPatients, { id: remPatient.id }), remPatient);
                                break;
                        }
                        $scope.$apply();
                        break;
                    case 'multiplePatientsCreated':
                        data.forEach(remPatient => {
                            if (!_.some(vm.remPatients, { id: remPatient.id })) {
                                vm.remPatients.push(remPatient)
                            }
                        });
                        $scope.$apply();
                        break;
                }
            }
        };
        io.socket.on('rem', socketRem);
        $scope.$on('$destroy', function () {
            io.socket.off('rem', socketRem);
        });

        vm.currentFilter = remVehicle => {
            if (remVehicle.deleted === false && remVehicle.status && remVehicle.status.type === 'ensalida') {
                return remVehicle;
            }
        };
        vm.finishedFilter = remVehicle => {
            if (remVehicle.deleted === false && remVehicle.status && remVehicle.status.type === 'salidafinalizada') {
                return remVehicle;
            }
        };

        $scope.$watch('vm.remVehicles', remVehicles => vm.remVehicleCount = remVehicles ? remVehicles.length : 0, true);

        vehicleStatusFactory
            .getAll(['ensalida', 'salidafinalizada'])
            .then(data => vm.vehicleStatusList = data)
            .catch(() => vm.vehicleStatusList = []);
    }
})();