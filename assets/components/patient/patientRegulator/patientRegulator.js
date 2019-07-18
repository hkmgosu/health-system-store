(function () {
    'use strict';
    /**
     * Example
     * <ssvq-patient-regulator></ssvq-patient-regulator>
     */
    app.directive('ssvqPatientRegulator', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idRemPatient: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientRegulator/patientRegulator.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, $translate, remFactory) {
        var vm = this;
        vm.observations = [];
        var getObservations = () => {
            if (!vm.idRemPatient) { return; }
            remFactory.getRegulatorObservations(vm.idRemPatient).then(
                observations => vm.observations = observations || [],
                err => console.log(err));
        };

        getObservations();

        vm.addComment = () => {
            vm.commentForm.$submitted = true;
            if (!vm.idRemPatient || !vm.commentForm.$valid ) { return; }
            vm.temp.remPatient = vm.idRemPatient;
            remFactory.saveRegulatorObservations(vm.temp).then(() => {
                vm.temp = {};
                vm.commentForm.$setPristine();
                vm.commentForm.$setUntouched();
                $mdToast.showSimple($translate.instant('PATIENT.REGULATOR.SAVEOBSERVATIONS'));
                getObservations();
            }, err => console.log(err));
        };
    }
})();