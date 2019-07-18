(function () {
    'use strict';
    /**
     * Example
     * <ssvq-rem-patient-item patient=""></ssvq-rem-patient-item>
     */
    app.directive('ssvqRemPatientItem', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idRem: '=',
                remPatient: '=',
                getRemVehicles: '&?'
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/rem/remPatientItem/remPatientItem.html'
        };
    });

    /* @ngInject */
    function ComponentController(remFactory, $remPatientDialog, $mdToast, $mdDialog, $element) {
        var vm = this;

        vm.showPatientDialog = ($event, remPatient) => {
            $remPatientDialog.showDialog($event, remPatient).then(() => { }).catch(() => { });
        };
        /**
         * Permite asociar el paciente a un vehículo
         */
        vm.associatePatientVehicle = (remPatient, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/rem/remPatientItem/dialog.associatePatientVehicle.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.close = () => $mdDialog.cancel();
                    vm.associate = remVehicle => $mdDialog.hide(remVehicle);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    remVehicles: vm.getRemVehicles()()
                }
            }).then(remVehicleSelected => {
                let idRemVehicle = remVehicleSelected ? remVehicleSelected.id : null;
                remFactory.saveRemPatient({
                    id: remPatient.id,
                    vehicle: idRemVehicle
                }, 'patientAssociated').then(() => {
                    vm.remPatient.vehicle = idRemVehicle;
                    $mdToast.showSimple('Paciente asociado correctamente al vehículo');
                }, () => $mdToast.showSimple('Hubo un error al guardar paciente, por favor inténtelo nuevamente'))
            });
        };
        /**
         * Permite eliminar paciente
         */
        vm.deleteRemPatient = remPatient => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('Confirmación de eliminación')
                    .textContent('¿Estás seguro de eliminar el paciente del incidente?')
                    .ok('Quitar paciente')
                    .ariaLabel('Quitar paciente')
                    .cancel('Volver')
            ).then(() => {
                remFactory
                    .saveRemPatient({
                        id: remPatient.id,
                        deleted: true
                    }, 'patientRemoved')
                    .then(() => {
                        $element.remove();
                        $mdToast.showSimple('Paciente removido del incidente');
                    })
                    .catch(() => $mdToast.showSimple('Hubo un error al quitar paciente, por favor inténtelo nuevamente'))
            }, () => { });
        };
    }
})();