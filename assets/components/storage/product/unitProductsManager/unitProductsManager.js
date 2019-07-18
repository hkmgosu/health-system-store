(function() {
    'use strict';
    /**
     * Esta directiva recibe un id de product, obtiene sus parámetros de stock según unidad
     * y permite agregar/eliminar unidades más rango de stocks
     *
     * Example
     * <ssvq-unit-products-manager id-product=""></ssvq-unit-products-manager>
     */
    app.directive('ssvqUnitProductsManager', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                product: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/product/unitProductsManager/unitProductsManager.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, unitFactory, productFactory, unitProductsManagerFactory, $mdToast) {
        var vm = this;
        window.__vm = this;
        vm.unitProductsManagers = null;
        vm.parametricData = {
            units: null
        };

        // Obtener paramétricas
        productFactory.getParams().then(parametricData => vm.parametricData = parametricData);

        vm.idProduct = vm.product.id;
        productFactory.get(vm.idProduct).then(product => vm.product = product);

        if (vm.idProduct) unitProductsManagerFactory
            .getProductUnits(vm.idProduct)
            .then(
                obj => vm.unitProductsManagers = obj.list,
                err => console.log(err)
            );

        // Unidades Permitidas
        unitFactory
            .getUnitsForStorageManagement()
            .then(
                res => res.ok ? vm.parametricData.units = res.obj.units : $mdToast.showSimple('Error al buscar Unidades Administrativas'),
                err => console.log(err)
            );

        // Agregar Parámetros
        vm.addUnitProductsManager = () => {
            let unitProductsManager = vm.unitProductsManager;
            unitProductsManager.product = vm.idProduct;

            if (_.find(vm.unitProductsManagers, {
                    unit: {
                        id: unitProductsManager.unit
                    }
                })) {
                return $mdToast.showSimple('La unidad ya existe en la configuración')
            }

            let productType = _.find(vm.parametricData.productTypes, {
                id: vm.product.productType
            });
            let invalidUnit = false;
            vm.parametricData.unit.forEach(elm => {
                if (elm.id === unitProductsManager.unit && !elm.isPharmaceutical === productType.isPharmaceutical) invalidUnit = true
            });
            if (invalidUnit) return $mdToast.showSimple('La unidad no compatible con el tipo de producto');
            unitProductsManagerFactory
                .save(unitProductsManager)
                .then(
                    (result) => {
                        vm.unitProductsManagers.push(result.unitProductsManager);
                        vm.unitProductsManager = {};
                        vm.unitProductsManagerForm.$setPristine();
                        vm.unitProductsManagerForm.$setUntouched();
                        $mdToast.showSimple('Unidad agregada a la configuración');
                    },
                    (err) => {
                        console.log('Error agregando configuración', err);
                        $mdToast.showSimple('Error agregando configuración');
                    }
                );
        };
        // Eliminar Stock
        vm.removeUnitProductsManager = (unitProductsManager) => {
            $mdToast.showSimple('Eliminando unidad de la configuración...');
            unitProductsManagerFactory
                .delete(unitProductsManager.id)
                .then(
                    () => {
                        _.remove(vm.unitProductsManagers, {
                            id: unitProductsManager.id
                        });
                        $mdToast.showSimple('Unidad eliminada de la configuración del Producto');
                    },
                    (err) => {
                        console.log('Error eliminando Unidad', err);
                        $mdToast.showSimple('Error eliminando Unidad');
                    }
                );
        };
    }
})();