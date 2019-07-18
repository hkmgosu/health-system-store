(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-administration-way-actions></ssvq-storage-administration-way-actions>
     */
    app.directive('ssvqStorageAdministrationWayActions', function() {
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
            templateUrl: '/components/storage/administrationWay/administrationWayActions/administrationWayActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, administrationWayFactory) {
        var vm = this;
        vm.onEditItem = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/administrationWay/administrationWayActions/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.administrationWay = angular.copy(vmParent.item);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.administrationWay);
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(dataEdita => {
                if (_.isEmpty(dataEdita)) {
                    return;
                }
                $mdToast.showSimple('Guardando Via d Administración...');

                administrationWayFactory.update(dataEdita).then(
                    // success
                    dataReturn => {
                        $mdToast.showSimple('Se ha actualizado via de administración');
                        vmParent.item = dataReturn.obj.administrationWay;
                        vm.afterEdit && vm.afterEdit(dataReturn);
                    },
                    // fail
                    () => $mdToast.showSimple('No se pudo modificar')
                );
            });
        };

        vm.onDeleteItem = () => {
            let message = $translate.instant('ADMINISTRATION_WAY.DIALOG.DELETE_MESSAGE') +
                ' ' + vm.item.description;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('ADMINISTRATION_WAY.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('ADMINISTRATION_WAY.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('ADMINISTRATION_WAY.DIALOG.TITLE'))
                .cancel($translate.instant('ADMINISTRATION_WAY.DIALOG.CANCEL'))
            ).then(
                function() {
                    administrationWayFactory.delete(vm.item.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado via de administración' +
                                response.obj.administrationWay.description);
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