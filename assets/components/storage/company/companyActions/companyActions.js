(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-company-actions></ssvq-storage-company-actions>
     */
    app.directive('ssvqStorageCompanyActions', function() {
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
            templateUrl: '/components/storage/company/companyActions/companyActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, companyFactory) {
        var vm = this;
        vm.onEditItem = $event => {
            let vmParent = vm;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/company/companyActions/dialogSave.html',

                controller: function($mdDialog) {
                    var vm = this;
                    vm.company = angular.copy(vmParent.item);
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => vm.save(vm.company);

                    vm.save = dataEdita => {
                        if (_.isEmpty(dataEdita)) {
                            return;
                        }
                        $mdToast.showSimple('Guardando compañía...');

                        companyFactory.update(dataEdita).then(
                            // success
                            dataReturn => {
                                $mdToast.showSimple('Se ha actualizado la compañía');
                                vmParent.item = dataReturn.obj.company;
                                vm.afterEdit && vm.afterEdit(dataReturn);
                                $mdDialog.hide();
                            },
                            // fail
                            () => $mdToast.showSimple('No se pudo modificar la compañía')
                        );
                    };
                },

                bindToController: true,
                controllerAs: 'vm'
            }).then(() => {});
        };



        vm.onDeleteItem = () => {
            let message = $translate.instant('COMPANY.DIALOG.DELETE_MESSAGE') +
                ' ' + vm.item.name;

            $mdDialog.show($mdDialog.confirm()
                .title($translate.instant('COMPANY.DIALOG.TITLE'))
                .textContent(message)
                .ok($translate.instant('COMPANY.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('COMPANY.DIALOG.TITLE'))
                .cancel($translate.instant('COMPANY.DIALOG.CANCEL'))
            ).then(
                function() {
                    companyFactory.delete(vm.item.id).then(
                        // exito
                        response => {
                            $mdToast.showSimple('Se ha eliminado la compañía ' +
                                response.obj.company.name);
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