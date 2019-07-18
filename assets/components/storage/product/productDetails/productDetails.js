(function() {
    'use strict';
    /**
     * Example
     * <ssvq-storage-product-details></ssvq-sotrage-product-details>
     */
    app.directive('ssvqStorageProductDetails', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/product/productDetails/productDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $stateParams, $location, $mdToast, productFactory, unitProductsManagerFactory) {
        let idProduct = parseInt($stateParams.id);
        let vm = this;
        vm.product = {
            id: idProduct
        };

        vm.isPharmaceutical = false;
        vm.allowedUnits = false;
        vm.comments = null;
        vm.commentsView = [];
        vm.commentDictionary = {
            generalChanged: 'modificó datos generales del producto',
            clasificationChanged: 'modificó la clasificación',
            imageDeleted: 'eliminó la imagen del producto',
            imageChanged: 'modificó la imagen del producto',
            stocksChanged: 'modificó el stock en las unidades',
            unitsChanged: 'modificó las unidades de distribución',
            comment: 'agregó un comentario',
            created: 'creó el producto'
        };

        vm.showAllLogs = false;
        vm.productLogs = [];
        vm.productTimeline = [];
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

        vm.afterDelete = () => {
            $location.url('/bodega/productos');
        }

        // Obtener paramétricas
        productFactory.getParams().then(parametricData => vm.parametricData = parametricData);

        // Obtener las unidades asignadas al usuario
        unitProductsManagerFactory.getAllowedUnits().then(obj => {
            vm.allowedUnits = obj.units;
        });

        // obtener los comentarios
        productFactory.getComments($stateParams.id).then(
            response => vm.comments = response.obj.comments,
            err => $mdToast.showSimple('Error al obtener los comentarios')
        );

        // Obtener Log de historial
        vm.reloadLogs = () => {
            productFactory.getLogs(idProduct).then(obj => {
                vm.showAllLogs = false;
                vm.productLogs = obj.productLogs;
                vm.productTimeline = obj.productLogs.slice(-3);
                $scope.$apply();
            });
        };
        vm.reloadLogs();

        $scope.$watch('vm.showAllLogs', showAllLogs => {
            vm.productTimeline = showAllLogs ? vm.productLogs : vm.productLogs.slice(-3);
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
                // filtrar unidades segun tipo de producto

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

        /**
         * Guardar cambios
         */
        vm.saveGeneralDataForm = () => {
            $mdToast.showSimple('Actualizando información general...');
            console.log("save general", vm.product);
            productFactory.save(_.pick(vm.product, [
                'id', 'description', 'public'
            ])).then(obj => {
                vm.generalDataForm.$setPristine();
                vm.generalDataForm.$setUntouched();
                $mdToast.showSimple('La información general fue actualizada');

                // Obtener Log de historial
                vm.reloadLogs();
            }, err => {
                if (err.raw.message) return $mdToast.showSimple('Error: ' + err.raw.message);
                return $mdToast.showSimple('No se pudo actualizar la información del producto');
            });
        };

        vm.saveClasificationDataForm = () => {
            $mdToast.showSimple('Actualizando información de clasificación...');
            let productToSave = !vm.isPharmaceutical ? Object.assign({}, _.pick(vm.product, [
                'id',
                'productType',
                'category',
                'subCategory',
                'presentationType'
            ])) : _.pick(vm.product, [
                'id', 'productType', 'drugType', 'dosageType', 'dosage', 'presentationType', "administrationWay", "category", "subCategory", "isControlled"
            ]);
            productFactory.save(productToSave).then(obj => {
                vm.clasificationDataForm.$setPristine();
                vm.clasificationDataForm.$setUntouched();
                $mdToast.showSimple('Clasificación del producto actualizada');

                // Obtener Log de historial
                vm.reloadLogs();

            }, err => {
                if (err.raw.message) return $mdToast.showSimple('Error: ' + err.raw.message);
                return $mdToast.showSimple('No se pudo actualizar la clasificación del producto');
            });
        };


        vm.sendComment = comment => new Promise((resolve, reject) => {
            comment.table = 'product';
            comment.idRecord = vm.product.id;
            productFactory.createComment(comment).then(resolve, reject);
        });

        // SOCKET
        vm.socket = event => {
            if (event.id !== Number($stateParams.id)) return;
            switch (event.data.message) {
                case 'product:new-general':
                    vm.product = Object.assign(vm.product, event.data.data);
                    break;
                case 'product:new-clasification':
                    vm.product = Object.assign(vm.product, event.data.data);
                    break;
                case 'product:new-image':
                    break;
                case 'product:new-units':
                    break;
                case 'product:new-stock':
                    break;
                case 'product:new-comment':
                    // agrega comentario al inicio del array
                    vm.comments.unshift(event.data.data);
                    break;
                default:
                    console.warn('Unrecognized socket event (`%s`) from server:', event.verb, event);
                    break;
            }
            $scope.$apply();
        };

        io.socket.on('product', vm.socket);
        $scope.$on("$destroy", () => {
            if (vm.product.id) {
                productFactory.unsubscribe(vm.product.id);
            }
            io.socket.off('product', vm.socket);
        });
        $scope.$watchCollection(function() {
            return vm.comments;
        }, comments => {
            if (comments) {
                if (vm.showAll) {
                    vm.commentsView = comments;
                } else {
                    // obtiene los primeros 3 elementos
                    vm.commentsView = comments.slice(0, 3);
                }
            }
        });
        // FIN SOCKET
    }
})();