(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-account-actions></ssvq-storage-account-actions>
     */
    app.directive('ssvqStorageAccountActions', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                item: '=',
                onDelete: '&',
                hiddenEdit: '@',
                hiddenDelete: '@'
            },
            restrict: 'E',
            templateUrl: '/components/storage/accountPlan/accountPlanActions/accountActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, accountFactory) {
        var vm = this;
        angular.extend($scope, {
            onEditItem() {
                let $scopeParent = $scope;
                $scope.accountPlan = angular.copy($scope.item);
                $mdDialog.show({
                    clickOutsideToClose: true,
                    scope: $scope,
                    preserveScope: true,
                    templateUrl: '/components/storage/accountPlan/accountPlanActions/dialogSave.html',

                    controller($scope, $mdDialog) {
                        $scope.cancel = () => $mdDialog.cancel();
                        $scope.confirm = () => $mdDialog.hide($scope.accountPlan);
                    }, //controller

                    bindToController: true,
                    controllerAs: 'vm'
                }).then(accountPlan => {
                    if (_.isEmpty(accountPlan)) {
                        return;
                    }
                    $mdToast.showSimple('Guardando cuenta...');

                    accountFactory.update(accountPlan).then(
                        // success
                        accountPlan => {
                            $mdToast.showSimple('Se ha actualizado la cuenta');
                            if ($scopeParent.reload) $scopeParent.reload();
                        },
                        // fail
                        () => $mdToast.showSimple('No se pudo modificar la cuenta')
                    );
                });
            },

            // onEditItem() {
            // 	console.log('onEditItem',$scope);
            // 	location.href = "#/bodega/cuenta-contable/" + vm.accountPlan.id;
            // },

            onDeleteItem() {
                let $scopeParent = $scope;
                let message = $translate.instant('ACCOUNT_PLAN.DIALOG.DELETE_MESSAGE') +
                    ' ' + $scope.item.year + ':' + $scope.item.code;

                $mdDialog.show($mdDialog.confirm()
                    .title($translate.instant('ACCOUNT_PLAN.DIALOG.TITLE'))
                    .textContent(message)
                    .ok($translate.instant('ACCOUNT_PLAN.DIALOG.DELETE_OK'))
                    .ariaLabel($translate.instant('ACCOUNT_PLAN.DIALOG.TITLE'))
                    .cancel($translate.instant('ACCOUNT_PLAN.DIALOG.CANCEL'))
                ).then(
                    function() {
                        accountFactory.delete($scope.item.id).then(
                            // exito
                            response => {
                                $mdToast.showSimple(`Se ha eliminado la cuenta ${response.obj.accountPlan.year}:${response.obj.accountPlan.code} ${response.obj.accountPlan.description}`);
                                if ($scopeParent.reload) $scopeParent.reload();
                            },
                            // fail
                            err => {
                                $mdToast.showSimple('Hubo un problema al eliminar');
                                console.log(err);
                            }
                        );
                    },
                    function() {
                        console.log($scope);
                    } // cancelo
                );
            }
        });
    }
})();