(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-personal-data></ssvq-patient-personal-data>
     */
    app.directive('ssvqPatientPersonalData', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                personalData: '=',
                onUpdate: '&?',
                opts: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientPersonalData/patientPersonalData.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, utilitiesFactory, patientFactory, RutHelper) {
        var vm = this;
        vm.gender = utilitiesFactory.getGender();
        vm.mode = vm.mode ? vm.mode : 'complete';
        vm.today = moment.utc().format('YYYY-MM-DD');

        vm.onConfirm = () => {
            vm.loading = true;
            patientFactory.save(_.pick(vm.personalData, [
                'id', 'name', 'lastname', 'mlastname', 'gender', 'birthdate', 'estimatedYears', 'estimatedMonths', 'estimatedDays', 'phone', 'validated'
            ])).then(patient => {
                $mdToast.showSimple('Los datos del paciente fueron actualizados');
                vm.onUpdate ? vm.onUpdate()() : null;
            })
                .catch(() => $mdToast.showSimple('Ha ocurrido un error actualizando los datos del paciente'))
                .then(() => {
                    vm.loading = false;
                    $scope.patientPersonalDataForm.$setPristine();
                });
        };

        vm.canAutocomplete = () => {
            return (!vm.personalData.validated && vm.personalData.identificationType === 'rut' && RutHelper.validate(vm.personalData.identificationNumber));
        };

        vm.syncPatient = () => {
            vm.autocompleteInProcess = true;
            patientFactory.getExternalPatient({
                identificationType: vm.personalData.identificationType,
                identificationNumber: RutHelper.clean(vm.personalData.identificationNumber)
            }).then(patient => {
                vm.autocompleteInProcess = false;
                patient.birthdate = new Date(patient.birthdate);
                patient.validated = true;
                Object.assign(vm.personalData, patient);
                $scope.patientPersonalDataForm.$setDirty();
                $mdToast.showSimple('Los datos del paciente fueron autocompletados, presione "Actualizar" para confirmar');
            }, err => {
                vm.autocompleteInProcess = false;
                if (err && err.observaciones && (err.observaciones[0] || {}).codigo === '002') {
                    $mdToast.showSimple('No se encontró información desde la fuente externa de datos');
                    console.log(err);
                } else {
                    $mdToast.showSimple('Ha ocurrido un error consultando la fuente externa de datos');
                }
            });
        };

        vm.onBirthdateChange = birthdate => {
            Object.assign(vm.personalData, {
                estimatedYears: moment().diff(birthdate, 'years'),
                estimatedMonths: moment().diff(birthdate, 'months') - (12 * moment().diff(birthdate, 'years'))
            });
            var estimatedDaysAux = moment(birthdate).add(vm.personalData.estimatedYears, 'year').add(vm.personalData.estimatedMonths, 'month');
            vm.personalData.estimatedDays = Math.floor(moment.duration(moment().diff(estimatedDaysAux)).asDays());
        };
    }
})();