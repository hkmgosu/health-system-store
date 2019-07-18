(() => {
    'use strict';
    /**
     * Example
     * <ssvq-basic-evolution></ssvq-basic-evolution>
     */
    app.directive('ssvqBasicEvolution', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                basic: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/patient/patientEvolution/basicEvolution/basicEvolution.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, remFactory, utilitiesFactory) {
        var vm = this;

        vm.triages = utilitiesFactory.getTriages();

        vm.save = (data) => {
            if (data && data.id) {
                remFactory
                    .saveRemPatientBasicEvolution(data)
                    .then(
                        () => {
                            vm.saveForm.$setPristine();
                            vm.saveForm.$setUntouched();
                            $mdToast.showSimple('Datos de evolución guardados');
                        },
                        err => {
                            console.log(err);
                            $mdToast.showSimple('Ha ocurrido un error');
                        }
                    );
            } else {
                console.log('Debe existir remPatient');
            }
        };
    }
})();