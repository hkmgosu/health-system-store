(() => {
    'use strict';
    /**
     * Example
     * <ssvq-patient-clinical-history-item-details></ssvq-patient-clinical-history-item-details>
     */
    app.directive('ssvqPatientClinicalHistoryItemDetails', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientClinicalHistoryItemDetails/patientClinicalHistoryItemDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
    }
})();