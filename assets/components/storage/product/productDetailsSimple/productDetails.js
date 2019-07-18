(function() {
    'use strict';
    /**
     * Example
     * <ssvq-storage-product-details></ssvq-sotrage-product-details>
     */
    app.directive('ssvqStorageProductDetailsSimple', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/product/productDetailsSimple/productDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $stateParams, $location, $mdToast, productFactory, unitProductsManagerFactory) {
        let idProduct = parseInt($stateParams.id);
        let vm = this;
        vm.product = {
            id: idProduct
        };

        vm.allowedUnits = false;
        vm.parametricData = {
            productTypes: [],
            drugTypes: [],
            administrationWays: [],
            presentationTypes: [],
            dosageTypes: [],
            categories: [],
            companies: []
        }
        vm.originalProductData = null;
        vm.timestamp = product => moment((product || {}).updatedAt).format('X');

        vm.showAll = false;
        vm.setShowAll = () => {
            vm.showAll = true;
            vm.commentsView = vm.comments;
        };

        // tipo de producto si es farmaceutico o general
        vm.isPharmaceutical = true;
        vm.productTypeSelected = typeId => {
            let productType = _.find(vm.parametricData.productTypes, {
                id: typeId
            });
            vm.isPharmaceutical = productType.isPharmaceutical;
            if (!vm.isPharmaceutical) {
                vm.product.drugType = '';
                vm.product.administrationWay = '';
                vm.product.dosage = parseFloat(0);
                vm.product.dosageType = '';
            }
        }

        // Obtener paramétricas
        productFactory.getParams().then(parametricData => vm.parametricData = parametricData);

        // Obtener las unidades asignadas al usuario
        unitProductsManagerFactory.getAllowedUnits().then(obj => {
            vm.allowedUnits = obj.units;
        });

        if (!idProduct) {
            $mdToast.showSimple('Ingrese código de busqueda');
            window.location.href = '#/bodega/productos';
        } else {
            productFactory.get(idProduct).then(product => {
                vm.product = product;
                vm.originalProductData = product; // para volver al state inicial del productgo
                vm.product.dosage = parseFloat(vm.product.dosage);
                vm.onCategoryChange(vm.product.category);
                vm.getProductType(vm.product.productType);
                vm.getProductDrugType(vm.product.drugType);
                vm.productDescription = vm.product.description;
                vm.productTypeSelected(vm.product.productType);
                $scope.$apply();
            }, () => {
                $mdToast.showSimple('El producto no existe');
                window.location.href = '#/bodega/productos';
            });
        }


        vm.getProductType = id => {
            if (id) {
                vm.productTypeDescription = (_.find(vm.parametricData.productTypes, {
                    id
                }) || {}).description
            }
        }

        vm.getProductDrugType = id => {
            if (id) {
                vm.productDrugTypeDescription = (_.find(vm.parametricData.drugTypes, {
                    id
                }) || {}).description
            }
        }

        /* 
         * CATEGORY / SUBCATEGORY LOGIC
         */

        vm.onCategoryChange = categoryId => {
            if (categoryId) {
                vm.parametricData.subCategories = _.filter(vm.parametricData.categories, {
                    category: categoryId
                });
            }
        }
    }
})();