(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-patient></ssvq-adverse-event-patient>
     */
    app.directive('ssvqAdverseEventPatient', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventDialog/adverseEventPatient/adverseEventPatient.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, utilitiesFactory) {
        var vm = this;
        vm.gender = utilitiesFactory.getGender();
        vm.typePatient = utilitiesFactory.getTypePatient();
        vm.today = moment.utc().format('YYYY-MM-DD');//TODO: traer date del servidor
        vm.data.patient = vm.data.patient || {};
        vm.relationships = utilitiesFactory.getRelationships();
        vm.patientForm = $scope.$parent.patientForm;

        vm.opts = {
            hideAddressInfo: true,
            required: {
                name: undefined,
                lastname: undefined,
                mlastname: undefined
            }
        }

        /**
         * Función para formateo de datos para la vista
         */
        var prepareData = (data) => {
            //Tipo de identificacion paciente
            data.patient.identificationType = (data.patient || {}).identificationType || undefined;
            if (!data.patient.identificationType) delete data.patient.identificationType;
            //Format a fecha de ingreso
            if (data.patientAdmissionAt) data.patientAdmissionAt = new Date(data.patientAdmissionAt);

            return data;
        };

        vm.data = prepareData(vm.data);

        $scope.$watch(()=> {return vm.data.patient.identificationType}, (newVal, oldVal) => {
            if (newVal !== oldVal) {
                vm.opts.required = {
                    name: newVal !== 'newborn' && newVal !== 'nn',
                    lastname: newVal !== 'newborn' && newVal !== 'nn',
                    mlastname: newVal !== 'newborn' && newVal !== 'nn' && newVal !== 'passport' && newVal !== 'foreign',
                    gender: true
                }
            }
        });

    }
})();