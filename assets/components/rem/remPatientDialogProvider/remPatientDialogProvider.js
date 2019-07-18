(function () {
    'use strict';
    app.provider('$remPatientDialog', () => {
        return {
            $get: customProvider
        };
    });

    /* @ngInject */
    function customProvider($mdDialog) {
        return {
            showDialog: ($event, remPatient) => $mdDialog.show({
                targetEvent: $event || null,
                clickOutsideToClose: true,
                escapeToClose: true,
                templateUrl: '/components/rem/remPatientDialogProvider/remPatientDialogProvider.html',
                /* @ngInject */
                controller: function ($remPatientFactory, $mdToast, remFactory) {
                    var vm = this;
                    vm.createRemPatient = () => {
                        $remPatientFactory.create(vm.remPatient).then(remPatientCreated => {
                            vm.remPatient.id = remPatientCreated.id;
                            vm.remPatient.patient.id = remPatientCreated.patient.id;
                            vm.dialogForm.$setPristine();
                            $mdToast.showSimple('El paciente fue agregado al incidente');
                        }, err => {
                            console.log(err);
                            if (err.error === 'E_VALIDATION') {
                                $mdToast.showSimple('Ya existe registro del paciente');
                            } else if (err.error === 'E_INVALID') {
                                $mdToast.showSimple('Rut no válido');
                            } else {
                                $mdToast.showSimple('Ha ocurrido un error');
                            }
                        });
                    };

                    vm.idTypeVisibility = { newborn: false };

                    vm.createLog = () => {
                        if (vm.remPatient.id) {
                            remFactory.saveRemPatient({ id: vm.remPatient.id }, 'patientEdited').then(() => { }, () => { });
                        }
                    };
                    vm.cancel = () => $mdDialog.cancel();
                },
                controllerAs: 'vm',
                locals: { remPatient: angular.copy(remPatient) },
                bindToController: true
            })
        };
    }
})();