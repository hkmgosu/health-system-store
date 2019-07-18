(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-cost-center-actions></ssvq-storage-cost-center-actions>
     */
    app.directive('ssvqStorageCostCenterActions', function() {
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
            templateUrl: '/components/storage/costCenter/costCenterActions/costCenterActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, costCenterFactory) {
        var vm = this;
        vm.onEditItem = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/costCenter/costCenterActions/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.costCenter = angular.copy(vmParent.item);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.costCenter);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataEdita => {
                if (_.isEmpty(dataEdita)) {
                    return;
                }
                $mdToast.showSimple('Guardando centro de costos...');

                costCenterFactory.update(dataEdita).then(
                    // success
                    dataReturn => {
                        $mdToast.showSimple('Se ha actualizado centro de costos');
                        vmParent.item = dataReturn.obj.costCenter;
                        vm.afterEdit && vm.afterEdit(dataReturn);
                    },
                    // fail
                    () => $mdToast.showSimple('No se pudo modificar')
                );
            });
        };

        vm.onDeleteItem = () => {
            let message = $translate.instant('COST_CENTER.DIALOG.DELETE_MESSAGE') +
                ' ' + vm.item.description;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('COST_CENTER.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('COST_CENTER.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('COST_CENTER.DIALOG.TITLE'))
                .cancel($translate.instant('COST_CENTER.DIALOG.CANCEL'))
            ).then(
                function() {
                    costCenterFactory.delete(vm.item.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado centro de costos' +
                                response.obj.costCenter.description);
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