(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-item-list patient="" fields=""></ssvq-patient-item-list>
     */
    app.directive('ssvqPatientItemList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                patient: '=',
                fields: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientItemList/patientItemList.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;

        _.defaults(vm.fields, {
            rut: false,
            age: false
        });
    }
})();