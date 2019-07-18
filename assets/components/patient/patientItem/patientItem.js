(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-item patient=""></ssvq-patient-item>
     */
    app.directive('ssvqPatientItem', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                patient: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientItem/patientItem.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog) {
        var vm = this;
        vm.selectPatient = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/patient/patientItem/dialog.patientSelector.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.patient);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {},
                multiple: true,
                parent: angular.element(document.querySelector('md-dialog'))
            }).then(patient => {
                vm.patient = patient;
            }, () => {

            });
        };
    }
})();