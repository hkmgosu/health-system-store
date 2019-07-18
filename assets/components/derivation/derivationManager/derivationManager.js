(function () {
    'use strict';
    /**
     * Example
     * <ssvq-derivation-manager></ssvq-derivation-manager>
     */
    app.directive('ssvqDerivationManager', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/derivation/derivationManager/derivationManager.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $derivationFactory, $state, establishmentFactory) {
        var vm = this;
        $derivationFactory.getMySupervisedEstablishmentList().then(list => {
            vm.mySupervisedEstablishmentList = list;
        });

        vm.filter = {
            fromEstablishment: [],
            toEstablishment: []
        };

        vm.getMySupervisedEstablishmentList = () => vm.mySupervisedEstablishmentList;

        vm.cleanFilters = () => vm.filter = {
            fromEstablishment: [],
            toEstablishment: []
        };

        vm.newPatientTransfer = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/derivation/derivationManager/dialog.createDerivation.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog, $derivationFactory) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.derivation);
                        vm.riskList = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3'];

                        //TODO
                        vm.getRequiredEquipmentList = $derivationFactory.getRequiredEquipmentList;
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    mySupervisedEstablishmentList: vm.mySupervisedEstablishmentList
                },
                multiple: true,
                parent: angular.element(document.querySelector('md-dialog'))
            }).then(derivation => {
                derivation.attachments = _.map(derivation.attachments, 'id');
                $derivationFactory.create(derivation).then(derivationCreated => {
                    console.log('Derivación creada', derivationCreated);
                    $state.go('triangular.mi-ssvq.bed-manager-patient-transfer-details', {
                        id: derivationCreated.id,
                        derivation: derivationCreated
                    });
                });
            }, () => {

            });
        };

        vm.getEstablishmentList = searchText => establishmentFactory.get({
            name: { contains: searchText || '' },
            bedManagementModuleAvailable: true
        });
    }
})();