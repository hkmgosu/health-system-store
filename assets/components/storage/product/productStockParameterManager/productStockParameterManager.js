(function() {
    'use strict';
    /**
     * Esta directiva recibe un id de product, obtiene sus parámetros de stock según unidad
     * y permite agregar/eliminar unidades más rango de stocks
     *
     * Example
     * <ssvq-product-stock-parameter-manager id-product=""></ssvq-product-stock-parameter-manager>
     */
    app.directive('ssvqProductStockParameterManager', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idProduct: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/product/productStockParameterManager/productStockParameterManager.html'
        };
    });

    /* @ngInject */
    function ComponentController(productFactory, unitFactory, $mdToast, $mdDialog, $translate) {
        var vm = this;
        vm.parametricData = {
            units: null
        };
        vm.loading = false;
        vm.editStockParameterMode = false;
        vm.createStockParameterMode = false;
        vm.stockParameterList = [];
        vm.stockParameterSelected = false;


        // Obtener parámetros de stock del producto por unidad
        productFactory
            .getStockParameters(vm.idProduct)
            .then(
                obj => vm.stockParameterList = obj,
                err => console.log(err)
            );

        // Unidadades Permitidas para Stock
        unitFactory
            .getUnitsForStorageManagement()
            .then(
                res => res.ok ? vm.parametricData.units = res.obj.units : $mdToast.showSimple('Error al buscar Unidades Administrativas'),
                err => console.log(err)
            );

        vm.selectStockParameter = (stockParameter) => {
            console.log('stockParameter selected', stockParameter);
            vm.stockParameterSelected = stockParameter ? Object.assign({}, { ...stockParameter
            }) : false;
            if (vm.stockParameterSelected) vm.onStockParameterSelected(vm.stockParameterSelected);
            else vm.initStockParameter();
        };

        vm.onStockParameterSelected = stockParameter => {
            if (stockParameter) {
                vm.editStockParameterMode = true;
                vm.createStockParameterMode = false;

                // set info stockParameter
                vm.stockParameter = Object.assign({}, { ...stockParameter
                }, {
                    minStock: Number(stockParameter.minStock),
                    maxStock: Number(stockParameter.maxStock),
                    unit: stockParameter.unit.id
                });
            } else {
                vm.initStockParameter();
            }
        }

        // init state
        vm.initStockParameter = () => {
            vm.stockParameter = {};
            vm.createStockParameterMode = false;
            vm.editStockParameterMode = false;
            vm.stockParameterSelected = false;
            vm.loading = false;
            if (vm.stockParameterForm) {
                vm.stockParameterForm.$setPristine();
                vm.stockParameterForm.$setUntouched();
            }
        }

        // Muestra formulario
        vm.showCreateStockParameterForm = () => {
            vm.initStockParameter();
            vm.createStockParameterMode = true;
        }


        // Agregar Parámetros
        vm.saveStockParameter = () => {
            let stockParameter = Object.assign({}, { ...vm.stockParameter
            });
            stockParameter.product = parseInt(vm.idProduct);
            productFactory
                .saveStockParameter(stockParameter)
                .then(
                    (result) => {
                        let newStock = _.find(vm.stockParameterList, {
                            id: result.obj.stockParameter.id
                        })
                        if (newStock) {
                            newStock.minStock = result.obj.stockParameter.minStock;
                            newStock.maxStock = result.obj.stockParameter.maxStock;
                            $mdToast.showSimple('Configuración Actualizada');
                        } else {
                            vm.stockParameterList.push(result.obj.stockParameter);
                            $mdToast.showSimple('Configuración Creada');
                        }
                        vm.initStockParameter();
                    },
                    (err) => {
                        $mdToast.showSimple('Error agregando Stock');
                    }
                );
        };
        // Eliminar Stock
        vm.removeStockParameter = () => {
            $mdToast.showSimple('Eliminando parámetro de stock...');
            productFactory
                .removeStockParameter(vm.stockParameter.id)
                .then(
                    () => {
                        _.remove(vm.stockParameterList, {
                            id: vm.stockParameter.id
                        });
                        $mdToast.showSimple('Parámetro de Stock eliminado del Producto');
                        vm.initStockParameter();
                    },
                    (err) => {
                        $mdToast.showSimple('Error eliminando Parámetro de Stock');
                    }
                );
        };

        vm.onDeleteStockParameter = () => {
            $mdDialog.show(
                $mdDialog.confirm()
                .title($translate.instant('Eliminar Parámetros de stock del Producto'))
                .textContent($translate.instant('¿Desea eliminar los parámetros para la unidad?'))
                .ok($translate.instant('Eliminar'))
                .ariaLabel($translate.instant('PRODUCT.DIALOG.TITLE'))
                .cancel($translate.instant('PRODUCT.DIALOG.CANCEL'))
            ).then(() => {
                vm.removeStockParameter();
            });
        };
    }
})();