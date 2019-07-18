(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-movement-type-actions></ssvq-storage-movement-type-actions>
     */
    app.directive('ssvqStorageMovementTypeActions', function() {
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
            templateUrl: '/components/storage/movementType/movementTypeActions/movementTypeActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, movementTypeFactory) {
        var vm = this;
        vm.onEditItem = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/movementType/movementTypeActions/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.movementType = angular.copy(vmParent.item);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.movementType);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataEdita => {
                if (_.isEmpty(dataEdita)) {
                    return;
                }
                $mdToast.showSimple('Guardando tipo de movimiento...');

                movementTypeFactory.update(dataEdita).then(
                    // success
                    dataReturn => {
                        $mdToast.showSimple('Se ha actualizado el tipo');
                        vmParent.item = dataReturn.obj.movementType;
                        vm.afterEdit && vm.afterEdit(dataReturn);
                    },
                    // fail
                    () => $mdToast.showSimple('No se pudo modificar el tipo')
                );
            });
        };

        vm.onDeleteItem = () => {
            let message = $translate.instant('MOVEMENT_TYPE.DIALOG.DELETE_MESSAGE') +
                ' ' + vm.item.description;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('MOVEMENT_TYPE.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('MOVEMENT_TYPE.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('MOVEMENT_TYPE.DIALOG.TITLE'))
                .cancel($translate.instant('MOVEMENT_TYPE.DIALOG.CANCEL'))
            ).then(
                function() {
                    movementTypeFactory.delete(vm.item.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado el tipo ' +
                                response.obj.movementType.description);
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