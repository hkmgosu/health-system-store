(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-profile patient=""></ssvq-patient-profile>
     */
    app.directive('ssvqPatientProfile', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                patient: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientProfile/patientProfile.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();