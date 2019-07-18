(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-active-component-actions></ssvq-storage-active-component-actions>
     */
    app.directive('ssvqStorageActiveComponentActions', function() {
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
            templateUrl: '/components/storage/activeComponent/activeComponentActions/activeComponentActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, activeComponentFactory) {
        var vm = this;
        vm.onEditItem = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/activeComponent/activeComponentActions/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.activeComponent = angular.copy(vmParent.item);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.activeComponent);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataEdita => {
                if (_.isEmpty(dataEdita)) {
                    return;
                }
                $mdToast.showSimple('Guardando componente activo...');

                activeComponentFactory.update(dataEdita).then(
                    // success
                    dataReturn => {
                        $mdToast.showSimple('Se ha actualizado el componente activo');
                        vmParent.item = dataReturn.obj.activeComponent;
                        vm.afterEdit && vm.afterEdit(dataReturn);
                    },
                    // fail
                    () => $mdToast.showSimple('No se pudo modificar el componente activo')
                );
            });
        };

        vm.onDeleteItem = () => {
            let message = $translate.instant('ACTIVE_COMPONENT.DIALOG.DELETE_MESSAGE') +
                ' ' + vm.item.description;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('ACTIVE_COMPONENT.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('ACTIVE_COMPONENT.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('ACTIVE_COMPONENT.DIALOG.TITLE'))
                .cancel($translate.instant('ACTIVE_COMPONENT.DIALOG.CANCEL'))
            ).then(
                function() {
                    activeComponentFactory.delete(vm.item.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado el componente activo ' +
                                response.obj.activeComponent.description);
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