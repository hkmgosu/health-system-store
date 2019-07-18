(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-age patient=""></ssvq-patient-age>
     */
    app.directive('ssvqPatientAge', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                patient: '=',
                withMonth: '@',
                watchMode: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientAge/patientAge.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $translate) {
        var vm = this;

        var patientAge = (patient) => {
            let age = '';
            if (patient.estimatedYears) {
                let yearsText = (patient.estimatedYears === 1) ? 'PATIENT.TABLE.YEAR' : 'PATIENT.TABLE.YEARS';
                age += patient.estimatedYears ? patient.estimatedYears + ' ' + $translate.instant(yearsText) + ' ' : '';
                if (vm.withMonth === 'true') {
                    let monthsText = (patient.estimatedMonths === 1) ? 'PATIENT.TABLE.MONTH' : 'PATIENT.TABLE.MONTHS';
                    age += patient.estimatedMonths ? patient.estimatedMonths + ' ' + $translate.instant(monthsText) + ' ' : '';
                }
            } else {
                let monthsText = (patient.estimatedMonths === 1) ? 'PATIENT.TABLE.MONTH' : 'PATIENT.TABLE.MONTHS';
                let daysText = (patient.estimatedDays === 1) ? 'PATIENT.TABLE.DAY' : 'PATIENT.TABLE.DAYS';
                age += patient.estimatedMonths ? patient.estimatedMonths + ' ' + $translate.instant(monthsText) + ' ' : '';
                age += patient.estimatedDays ? patient.estimatedDays + ' ' + $translate.instant(daysText) + ' ' : '';
            }
            vm.age = age || 's/edad';
        };

        if (vm.watchMode === 'collection') {
            $scope.$watchCollection('vm.patient', patient => {
                patientAge(patient);
            });
        } else {
            $scope.$watch('vm.patient', patient => {
                if (patient) { patientAge(patient); }
            });
        }
    }
})();