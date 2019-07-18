(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-drug-type-actions></ssvq-storage-drug-type-actions>
     */
    app.directive('ssvqStorageDrugTypeActions', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                item: '=',
                hiddenEdit: '@',
                hiddenDelete: '@',
                afterEdit: '&?',
                afterDelete: '&?'
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/drugType/drugTypeActions/drugTypeActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, drugTypeFactory) {
        var vm = this;
        vm.onEditItem = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/drugType/drugTypeActions/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.drugType = angular.copy(vmParent.item);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.drugType);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataEdita => {
                if (_.isEmpty(dataEdita)) {
                    return;
                }
                $mdToast.showSimple('Guardando tipo de droga...');

                drugTypeFactory.update(dataEdita).then(
                    // success
                    dataReturn => {
                        $mdToast.showSimple('Se ha actualizado tipo de droga');
                        vmParent.item = dataReturn.obj.drugType;
                        vm.afterEdit && vm.afterEdit(dataReturn);
                    },
                    // fail
                    () => $mdToast.showSimple('No se pudo modificar')
                );
            });
        };

        vm.onDeleteItem = () => {
            let message = $translate.instant('DRUG_TYPE.DIALOG.DELETE_MESSAGE') +
                ' ' + vm.item.description;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('DRUG_TYPE.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('DRUG_TYPE.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('DRUG_TYPE.DIALOG.TITLE'))
                .cancel($translate.instant('DRUG_TYPE.DIALOG.CANCEL'))
            ).then(
                function() {
                    drugTypeFactory.delete(vm.item.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado tipo de droga' +
                                response.obj.drugType.description);
                            vm.afterDelete && vm.afterDelete()(response);
                        },
                        // fail
                        err => {
                            $mdToast.showSimple('Hubo un problema al eliminar');
                            console.log(err);
                        }
                    );
                },
                function() {
                    console.log(vm, $scope);
                } // cancelo
            );
        };
    }
})();