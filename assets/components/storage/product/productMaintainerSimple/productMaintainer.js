(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-product></ssvq-storage-product>
     */
    app.directive('ssvqStorageProductSimple', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            templateUrl: '/components/storage/product/productMaintainerSimple/productMaintainer.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $mdToast, $mdSidenav, $timeout, $location, productFactory, unitProductsManagerFactory) {
        let vm = this;
        let vmParent = this;
        vm.viewMode = 'list';
        vm.page = 1;
        vm.limit = 15;
        vm.products = null;
        vm.allowedUnits = false;
        vm.promise = null;
        vm.searchText = '';
        vm.searchUnits = [];
        vm.parametricData = {
            subCategories: []
        }

        vm.timestamp = product => moment((product || {}).updatedAt).format('X');

        /**
         * Obtener paramétricas
         */
        productFactory.getParams().then(parametricData => {
            vm.parametricData = parametricData;
        });

        /* 
         * CATEGORY / SUBCATEGORY LOGIC
         */

        vm.onCategoryChange = categoryId => vm.parametricData.subCategories = _.filter(vm.parametricData.categories, {
            category: categoryId
        });

        // Obtener las unidades asignadas al usuario
        unitProductsManagerFactory.getAllowedUnits().then(obj => {
            vm.allowedUnits = obj.units;
            // dejarlas seleccionadas
            for (let i = 0; i < obj.units.length; ++i) {
                vm.searchUnits.push(obj.units[i].id);
            }

            // despues de tener las unidades, buscar los productos
            vm.searchProducts();
        });

        // tickear o destickear checkbox
        vm.toggleUnit = unit => {
            if (vm.searchUnits === false) vm.searchUnits = [];

            let idx = vm.searchUnits.indexOf(unit.id); // existe en array?
            if (idx == -1) {
                vm.searchUnits.push(unit.id); // agregar al array
            } else {
                vm.searchUnits.splice(idx, 1); // quitar del array
            }

            // realizar busqueda
            vm.searchProducts();
        };

        vm.toggleFilter = () => {
            $mdSidenav('products-filter').toggle();
        };

        vm.cleanFilter = () => {
            vm.searchText = '';
            vm.searchUnits = [];
            for (let i = 0; i < vm.allowedUnits.length; ++i) {
                vm.searchUnits.push(vm.allowedUnits[i].id);
            }
            vm.searchProducts();
        };

        // funcion que actualiza resultado de productos
        vm.timeSearch = null;
        vm.searchProducts = () => {
            if (vm.timeSearch) clearTimeout(vm.timeSearch);
            vm.timeSearch = setTimeout(() => {
                vm.page = 0;
                vm.products = null;
                vm.found = 0;
                vm.nextPage().then(() => {}, () => {});
            }, 500);
        };

        // Create Product Dialog 
        vm.onCreate = $event => {
            let list = vm.parametricData;
            let onCategoryChange = vm.onCategoryChange;
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/product/productMaintainer/dialogSave.html',
                controller: function($mdDialog) {
                    let vm = this;
                    vm.parametricData = list;
                    vm.onCategoryChange = onCategoryChange;
                    vm.allowedUnits = false;
                    vm.isPharmaceutical = true;
                    unitProductsManagerFactory.getAllowedUnits().then(results => vm.allowedUnits = results.units);

                    vm.productTypeSelected = typeId => {
                        let productType = _.find(vm.parametricData.productTypes, {
                            id: typeId
                        });
                        vm.isPharmaceutical = productType ? productType.isPharmaceutical : true;
                        if (!vm.isPharmaceutical) {
                            vm.product.drugType = '';
                            vm.product.administrationWay = '';
                            vm.product.dosage = parseFloat(0);
                            vm.product.dosageType = '';
                        }
                    }

                    // product autocomplete onselect method
                    vm.onSelectProduct = product => {
                        if (product) {
                            vm.product = false;
                            console.log('product selected', product);
                            vm.product = Object.assign({}, _.pick(product, [
                                'description',
                                'productCode',
                                'productType',
                                'category',
                                'subCategory',
                                'presentationType',
                                'administrationWay',
                                'dosage',
                                'dosageType',
                                'drugType'
                            ]));
                            vm.product.drugType = product.drugType ? product.drugType.id : null;
                            vm.product.productType = product.productType.id;
                            vm.product.productCode = product.productCode;
                            vm.createForm.basicForm.productCode.$setValidity('productCode', false);
                            vm.createForm.basicForm.productCode.$setTouched();
                            vm.onCategoryChange(product.category);

                            if (vm.allowedUnits) {
                                let assignCalls = [];
                                vm.allowedUnits.forEach(unit => {
                                    assignCalls.push(unitProductsManagerFactory.save({
                                        unit: unit.id,
                                        product: product.id
                                    }));
                                });
                                Promise.all(assignCalls).then(result => $mdToast.showSimple('Producto se ha asignado a las Unidades del usuario'),
                                    err => console.log('unit assign err', err));
                            }
                        }
                    }

                    // product get by code
                    vm.getProductByCode = code => {
                        $timeout(() => productFactory.validateProductCode(code).then(
                            obj => {
                                vm.createForm.basicForm.productCode.$setValidity('productCode', !obj.productCode);
                                vm.createForm.basicForm.productCode.$setTouched();
                                $scope.$apply();
                            },
                            err => $mdToast.showSimple('No se pudo obtener los productos.' + (console.log(err) || ''))
                        ), 300);
                    }

                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => {
                        if (_.isEmpty(vm.product)) return;
                        let productToCreate = !vm.isPharmaceutical ? Object.assign({}, _.pick(vm.product, [
                            'description',
                            'productCode',
                            'productType',
                            'category',
                            'subCategory',
                            'presentationType'
                        ])) : vm.product;
                        $mdToast.showSimple('Creando producto...');
                        console.log('creando producto', productToCreate);
                        productFactory.create(productToCreate).then(
                            // success
                            created => {
                                $mdToast.showSimple('Se ha creado el Producto y se a asignado a sus Unidades');
                                $location.path('/bodega/producto/detalles/' + created.obj.product.id);
                                $mdDialog.hide();
                            },
                            // fail
                            err => {
                                if (err.summary) {
                                    console.log('err create product: ' + err.summary);
                                    return $mdToast.showSimple('Error: no se pudo crear el producto, intente nuevamente.');
                                }
                                if (err.msg) return $mdToast.showSimple("No se pudo crear el Producto " + err.msg);
                                return $mdToast.showSimple("No se pudo crear el Producto.");
                            }
                        );
                    }; // confirm
                },
                bindToController: true,
                controllerAs: 'vm'
            }).then(() => $mdDialog.hide());
        };

        vm.nextPage = () => new Promise((resolve, reject) => {
            if (vm.found && Math.ceil(vm.found / vm.limit) <= vm.page) {
                return resolve();
            }
            vm.page += 1;
            vm.promise = productFactory.getAllowedProducts({
                filter: vm.searchText,
                units: vm.searchUnits,
                page: vm.page,
                limit: vm.limit
            }, true).then(result => {
                vm.products = (vm.products || []).concat(result.products);
                vm.found = result.found;
                $scope.$apply();
                resolve();
            }, () => {
                if (vm.products === null) vm.products = [];
                $scope.$apply();
                reject();
            });
        });

        vm.nextTable = () => {
            vm.page--;
            vm.products = null;
            vm.nextPage().then(() => {}, () => {});
        };

        vm.viewChange = () => {
            vm.viewMode = vm.viewMode == 'list' ? 'table' : 'list';
            if (vm.viewMode == 'list') {
                vm.page = 0;
                vm.products = null;
                vm.nextPage().then(() => {}, () => {});
            } else {
                vm.page--;
                vm.products = null;
                vm.nextPage().then(() => {}, () => {});
            }
        };

    }

})();