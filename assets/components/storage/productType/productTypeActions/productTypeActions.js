(function() {
    'use strict';
    /**
     * Example
     * <ssvq-product-type-actions></ssvq-product-type-actions>
     */
    app.directive('ssvqProductTypeActions', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                productType: '=',
                onReload: '&?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/productType/productTypeActions/productTypeActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $translate, $mdToast, productTypeFactory, accountFactory) {
        var vm = this;
        let reload = vm.onReload;
        vm.editItem = () => {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/storage/productType/productTypeMaintainer/dialog.saveProductType.html',
                controller($mdDialog) {
                    let vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.productType);
                    accountFactory.getAll({}).then(
                        // success
                        response => {
                            if (response.ok) {
                                vm.found = response.obj.found;
                                vm.accounts = response.obj.accounts;
                            } else {
                                vm.accounts = [];
                            }
                        },
                        // fail
                        err => {
                            debugger;
                        }
                    );
                },

                bindToController: true,
                controllerAs: 'vm',
                locals: {
                    productType: angular.copy(vm.productType)
                }
            }).then(productType => {
                if (_.isEmpty(productType)) {
                    return;
                }
                $mdToast.showSimple('Guardando Tipo de Producto...');
                productTypeFactory.save(productType).then(
                    productType => {
                        $mdToast.showSimple('Se ha actualizado el tipo de producto');
                        reload()();
                        $scope.$apply();
                    },
                    () => $mdToast.showSimple('No se pudo modificar el tipo de producto')
                );
            });
        }
        /**
         * Eliminar Tipo de Producto
         */
        vm.deleteItem = () => {
            $mdDialog.show(
                $mdDialog.confirm()
                .title($translate.instant('STORAGE.PRODUCT_TYPE.DELETE.TITLE'))
                .textContent($translate.instant('STORAGE.PRODUCT_TYPE.DELETE.TEXT_CONTENT'))
                .ok($translate.instant('STORAGE.PRODUCT_TYPE.DELETE.OK'))
                .ariaLabel($translate.instant('STORAGE.PRODUCT_TYPE.DELETE.TITLE'))
                .cancel($translate.instant('STORAGE.PRODUCT_TYPE.DELETE.CANCEL'))
            ).then(() => {
                $mdToast.showSimple($translate.instant('STORAGE.PRODUCT_TYPE.OTHERS.DELETING'));
                productTypeFactory.delete(vm.productType.id).then(
                    () => {
                        $mdToast.showSimple($translate.instant('STORAGE.PRODUCT_TYPE.OTHERS.DELETED'));
                        reload()();
                    },
                    () => {
                        $mdToast.showSimple($translate.instant('STORAGE.PRODUCT_TYPE.OTHERS.DELETE_FAILED'));
                    }
                );
            });
        };
    }
})();