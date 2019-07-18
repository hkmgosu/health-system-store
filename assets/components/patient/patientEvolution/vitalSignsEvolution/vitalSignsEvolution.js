(function () {
    'use strict';
    /**
     * Example
     * <ssvq-vital-signs-evolution></ssvq-vital-signs-evolution>
     */
    app.directive('ssvqVitalSignsEvolution', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idRemPatient: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientEvolution/vitalSignsEvolution/vitalSignsEvolution.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, remFactory, $remPatientFactory) {
        var vm = this;
        vm.vitalSigns = [];

        //Obtiene las opciones ECG para signos vitales         
        remFactory.getEcg().then(ecgList => vm.ecg = ecgList || []);

        $remPatientFactory.getVitalSignsEvolution(vm.idRemPatient).then(
            vitalSignsEvolutionList => vm.vitalSigns = vitalSignsEvolutionList
        );

        vm.save = (data) => {
            if (!vm.idRemPatient) { return; }
            remFactory.saveRemPatientVitalSigns({
                id: vm.idRemPatient,
                vitalSigns: data
            }).then((response) => {
                vm.vitalSigns.push(response);
                vm.tempVitalSigns = {};
                vm.saveForm.$setPristine();
                vm.saveForm.$setUntouched();
                $mdToast.showSimple('Los nuevos signos vitales fueron agregados');
            }, err => {
                console.log(err);
                $mdToast.showSimple('Ha ocurrido un error agregando nuevos signos vitales');
            });
        };
    }
})();