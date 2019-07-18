(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-product-actions></ssvq-storage-product-actions>
     */
    app.directive('ssvqStorageProductActions', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                item: '=',
                hiddenDelete: '@',
                afterDelete: '&?',
                allowedUnits: '='
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/product/productActions/productActions.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $translate, productFactory) {
        var vm = this;

        /**
         * Mostrar y gestionar parámetros de stock del producto por unidad administrativa 
         */
        vm.showStockParameters = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/product/productActions/dialog.stockParameter.tmpl.html',
                /* @ngInject */
                controller: function($mdDialog) {
                    var vm = this;
                    vm.close = () => $mdDialog.cancel();
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    product: vm.item
                }
            });
        };

        /**
         * Mostrar y gestionar parámetros de stock del producto por unidad administrativa 
         */
        vm.showProductPacks = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/product/productActions/dialog.productPack.tmpl.html',
                /* @ngInject */
                controller: function($mdDialog) {
                    var vm = this;
                    vm.close = () => $mdDialog.cancel();
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    product: vm.item
                }
            });
        };

        vm.onDeleteItem = () => {
            $mdDialog.show(
                $mdDialog.confirm()
                .title($translate.instant('PRODUCT.DIALOG.DELETE_TITLE'))
                .textContent($translate.instant('PRODUCT.DIALOG.DELETE_MESSAGE'))
                .ok($translate.instant('PRODUCT.DIALOG.DELETE_OK'))
                .ariaLabel($translate.instant('PRODUCT.DIALOG.TITLE'))
                .cancel($translate.instant('PRODUCT.DIALOG.CANCEL'))
            ).then(() => {
                $mdToast.showSimple($translate.instant('Eliminando Producto...'));
                productFactory.delete(vm.item.id).then(
                    response => {
                        $mdToast.showSimple('Se ha eliminado el Producto ' +
                            response.obj.product.description);
                        vm.afterDelete && vm.afterDelete()(response);
                    },
                    err => {
                        if (err.raw.message) return $mdToast.showSimple('Error: ' + err.raw.message);
                        return $mdToast.showSimple('El Producto no pudo ser eliminado');
                    }
                );
            });
        };
    }
})();