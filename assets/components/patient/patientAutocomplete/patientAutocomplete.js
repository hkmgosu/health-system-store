(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-autocomplete></ssvq-patient-autocomplete>
     */
    app.directive('ssvqPatientAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                patient: '=',
                opts: '=',
                searchListCount: '=',
                onUpdate: '&?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientAutocomplete/patientAutocomplete.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, utilitiesFactory, patientFactory, RutHelper) {
        var vm = this;

        vm.identificationTypeList = utilitiesFactory.getIdType(vm.opts.idTypeVisibility);

        if (_.isEmpty(vm.patient) || !vm.patient.id) {
            vm.patient = { identificationType: 'rut' };
            vm.isNew = true;
        } else if (vm.patient.identificationType !== 'nn') {
            vm.isDisabled = true;
        }

        vm.suggestedPatientList = [];

        $scope.$watch(() => vm.suggestedPatientList, suggestedPatientList => {
            vm.searchListCount = (suggestedPatientList || []).length;
            vm.formValid = vm.searchListCount ? undefined : true;
        }, true);

        /**
         * Consulta a fuente externa de datos
         */
        let syncUp = () => {
            patientFactory.getExternalPatient({
                identificationType: vm.patient.identificationType,
                identificationNumber: vm.patient.identificationNumber
            }).then(patient => {
                vm.suggestedPatientList = [patient];
                vm.searching = false;
            }, err => {
                vm.searching = false;
                if (err && (err.obj || {}).observaciones && ((err.obj.observaciones || [])[0] || {}).codigo === '002') {
                    $mdToast.showSimple('No se encontró información desde la fuente externa de datos');
                } else {
                    $mdToast.showSimple('Ha ocurrido un error consultando la fuente externa de datos');
                }
            });
        };

        /**
         * Busca coincidencias en registro interno de pacientes
         */
        vm.getMatches = () => {
            if (!vm.patient.identificationNumber) {
                vm.searching = false;
                return;
            }
            if (vm.patient.identificationType === 'rut') {
                if (RutHelper.validate(vm.patient.identificationNumber)) {
                    vm.patient.identificationNumber = RutHelper.clean(vm.patient.identificationNumber);
                    vm.formValid = true;
                } else {
                    vm.formValid = undefined;
                }
            } else {
                vm.formValid = true;
            }
            vm.suggestedPatientList = [];
            vm.searching = true;
            patientFactory.getList({
                filter: vm.patient.identificationType + vm.patient.identificationNumber,
                paginate: { page: 1, limit: 5 }
            }).then(list => {
                vm.suggestedPatientList = list.map(patient => {
                    if (patient.birthdate) { patient.birthdate = new Date(patient.birthdate); }
                    return patient;
                });
                vm.searching = false;
            }, () => {
                if (vm.patient.identificationType === 'rut' && RutHelper.validate(vm.patient.identificationNumber)) {
                    $mdToast.showSimple('Consultando a fuente externa...');
                    syncUp();
                } else {
                    $mdToast.showSimple('No se han encontrado coincidencias');
                    vm.searching = false;
                }
            });
        };

        /** Seleccionar un paciente de los resultados de búsqueda */
        vm.selectPatient = (selectedPatient) => {
            vm.suggestedPatientList = [];

            // Si ninguno tiene, se completa con la información solamente
            if (!selectedPatient.id && !vm.patient.id) {
                selectedPatient.validated = true;
                vm.isDisabled = true;
                Object.assign(vm.patient, selectedPatient);
            }

            // Si el paciente actual tiene id, pero el seleccionado no
            // NN -> RUT válido
            else if (!selectedPatient.id && vm.patient.id) {
                selectedPatient.id = vm.patient.id;
                selectedPatient.validated = true;
                patientFactory.save(selectedPatient).then(patient => {
                    Object.assign(vm.patient, selectedPatient);
                    vm.isDisabled = true;
                    vm.onUpdate ? vm.onUpdate()() : null;
                    $mdToast.showSimple('Datos del paciente sincronizados');
                }, err => {
                    console.log(err);
                    $mdToast.showSimple('Ha ocurrido un error, intente más tarde');
                });
            }

            // Si ambos tienen id, se deben enlazar
            else if (selectedPatient.id && vm.patient.id) {
                patientFactory.identifyPatient(vm.patient.id, selectedPatient.id).then(patient => {
                    Object.assign(vm.patient, selectedPatient);
                    vm.isDisabled = true;
                    vm.onUpdate ? vm.onUpdate()() : null;
                    $mdToast.showSimple('Datos del paciente sincronizados');
                }, err => {
                    console.log(err);
                    $mdToast.showSimple('Ha ocurrido un error, intente más tarde');
                });
            }

            else if (selectedPatient.id && !vm.patient.id) {
                Object.assign(vm.patient, selectedPatient);
                vm.isDisabled = true;
            }
        };

        vm.updateIdentify = () => {
            if (vm.patient.identificationType === 'rut') {
                if (RutHelper.validate(vm.patient.identificationNumber)) {
                    vm.patient.identificationNumber = RutHelper.clean(vm.patient.identificationNumber);
                    vm.formValid = true;
                } else {
                    vm.formValid = undefined;
                    return $mdToast.showSimple('El rut ingresado es inválido');
                }
            }
            vm.updatingIdentify = true;
            patientFactory.save(_.pick(vm.patient, ['id', 'identificationNumber', 'identificationType'])).then(patient => {
                vm.updatingIdentify = false;
                vm.isDisabled = true;
                vm.onUpdate ? vm.onUpdate()() : null;
                $mdToast.showSimple('La identificación del paciente fue actualizada');
            }, err => {
                console.log(err);
                $mdToast.showSimple('Ha ocurrido un error, intente más tarde');
            });
        };

        /**
         * Condiciones necesarias para mostrar botón "Actualizar identificación"
         */
        vm.showUpdateButton = () => (
            !vm.isDisabled &&
            vm.patient.identificationType !== 'nn' &&
            vm.opts.showButtons &&
            !vm.searching &&
            !vm.searchListCount &&
            $scope.patientAutocompleteForm.$valid
        );

        /**
         * Detecta cambios manuales en el tipo de identificación
         */
        vm.onIdTypeChange = () => {
            vm.suggestedPatientList = [];
            vm.patient.identificationNumber = '';
        };
    }
})();