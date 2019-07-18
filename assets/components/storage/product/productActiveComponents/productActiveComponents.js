(function() {
    'use strict';
    /**
     * Esta directiva recibe un id de product, obtiene sus parámetros de stock según unidad
     * y permite agregar/eliminar unidades más rango de stocks
     *
     * Example
     * <ssvq-product-active-components id-product=""></ssvq-product-active-components>
     */
    app.directive('ssvqProductActiveComponents', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idProduct: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/product/productActiveComponents/productActiveComponents.html'
        };
    });

    /* @ngInject */
    function ComponentController(unitFactory, activeComponentFactory, productFactory, $mdToast) {
        var vm = this;
        window.__vm = this;
        vm.productActiveComponents = null;
        vm.activeComponents = null;
        vm.loading = true;

        activeComponentFactory.getAll().then(results => {
            console.log("active components", results);
            if (!results.ok) {
                vm.activeComponents = [];
                return $mdToast.showSimple('error al buscar componentes activos');
            }
            vm.activeComponents = results.obj.activeComponents;
            vm.loading = false;
        }, err => {
            vm.loading = false;
            console.log("error al buscar componentes activos", err);
            vm.activeComponents = [];
            $mdToast.showSimple('error al buscar componentes activos');
        });

        if (vm.idProduct) productFactory
            .getProductActiveComponents({
                product: vm.idProduct
            })
            .then(
                results => {
                    vm.loading = false;
                    console.log(results);
                    if (results.ok === false) {
                        vm.productActiveComponents = [];
                        return $mdToast.showSimple('error al buscar componentes activos del producto');
                    }
                    vm.productActiveComponents = results.productActiveComponents;
                },
                err => {
                    vm.loading = false;
                    $mdToast.showSimple('error al buscar componentes activos');
                    console.log('error al buscar componentes activos del producto');
                    vm.productActiveComponents = [];
                }
            );

        // Agregar Parámetros
        vm.addProductActiveComponent = () => {
            vm.loading = true;
            if (_.find(vm.productActiveComponents, {
                    activeComponent: {
                        id: vm.productActiveComponent.activeComponent
                    }
                })) {
                return $mdToast.showSimple('el componente ya existe para el producto')
            }
            productFactory
                .saveProductActiveComponent({
                    product: vm.idProduct,
                    activeComponent: vm.productActiveComponent.activeComponent
                })
                .then(
                    (result) => {
                        vm.loading = false;
                        vm.productActiveComponents.push(result);
                        vm.productActiveComponent = {};
                        // vm.productActiveComponentForm.$setPristine();
                        vm.productActiveComponentForm.$setUntouched();
                        $mdToast.showSimple('Componente Activo agregado al producto');
                    },
                    (err) => {
                        vm.loading = false;
                        console.log('Error agregando configuración', err);
                        $mdToast.showSimple('Error agregando configuración');
                    }
                );
        };
        // Eliminar Active Component
        vm.removeProductActiveComponent = (productActiveComponent) => {
            vm.loading = true;
            $mdToast.showSimple('Eliminando componente activo del producto...');
            productFactory
                .removeProductActiveComponent(productActiveComponent)
                .then(
                    () => {
                        vm.loading = false;
                        _.remove(vm.productActiveComponents, {
                            id: productActiveComponent.id
                        });
                        $mdToast.showSimple('Componente activo eliminado del Producto');
                    },
                    (err) => {
                        vm.loading = false;
                        console.log('Error eliminando Componente Activo', err);
                        $mdToast.showSimple('Error eliminando Componente Activo');
                    }
                );
        };
    }
})();