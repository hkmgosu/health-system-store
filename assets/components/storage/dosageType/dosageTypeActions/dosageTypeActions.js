(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-dosage-type-actions></ssvq-storage-dosage-type-actions>
     */
    app.directive('ssvqStorageDosageTypeActions', function() {
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
            templateUrl: '/components/storage/dosageType/dosageTypeActions/dosageTypeActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, dosageTypeFactory) {
        var vm = this;
        vm.onEditItem = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/dosageType/dosageTypeActions/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.dosageType = angular.copy(vmParent.item);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.dosageType);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataEdita => {
                if (_.isEmpty(dataEdita)) {
                    return;
                }
                $mdToast.showSimple('Guardando tipo de dosificación...');

                dosageTypeFactory.update(dataEdita).then(
                    // success
                    dataReturn => {
                        $mdToast.showSimple('Se ha actualizado el tipo');
                        vmParent.item = dataReturn.obj.dosageType;
                        vm.afterEdit && vm.afterEdit(dataReturn);
                    },
                    // fail
                    () => $mdToast.showSimple('No se pudo modificar el tipo')
                );
            });
        };

        vm.onDeleteItem = () => {
            let message = $translate.instant('DOSAGE_TYPE.DIALOG.DELETE_MESSAGE') +
                ' ' + vm.item.description;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('DOSAGE_TYPE.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('DOSAGE_TYPE.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('DOSAGE_TYPE.DIALOG.TITLE'))
                .cancel($translate.instant('DOSAGE_TYPE.DIALOG.CANCEL'))
            ).then(
                function() {
                    dosageTypeFactory.delete(vm.item.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado el tipo ' +
                                response.obj.dosageType.description);
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