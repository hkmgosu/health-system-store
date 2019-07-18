(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-evolution></ssvq-patient-evolution>
     */
    app.directive('ssvqPatientEvolution', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idRemPatient: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientEvolution/patientEvolution.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();