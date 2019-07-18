(function() {
    'use strict';
    /**
     * Esta directiva recibe un id de product para obtener los pack del producto
     * y permite agregar/eliminar packs
     *
     * Example
     * <ssvq-product-pack-manager id-product=""></ssvq-product-pack-manager>
     */
    app.directive('ssvqProductPackManager', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idProduct: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/product/productPackManager/productPackManager.html'
        };
    });

    /* @ngInject */
    function ComponentController(productFactory, $mdToast, $mdDialog, $translate) {
        let vm = this;
        vm.packs = null;
        vm.parametricData = null;
        vm.indicatorContainers = ['Primario', 'Secundario', 'Terciario'];
        vm.pack = {
            code: '',
            indicatorcontainer: 'Primario'
        };
        vm.loading = false;
        vm.editPackMode = false;
        vm.createPackMode = false;
        vm.productPackList = [];
        vm.productPackSelected = false;
        let filter = {
            deleted: false,
            code: ''
        };

        // Obtener paramétricas
        productFactory.getParams().then(parametricData => vm.parametricData = parametricData);

        if (vm.idProduct) {
            vm.productPackList = false;
            productFactory
                .getPacks({
                    product: vm.idProduct,
                    filter
                }).then(productPackList => vm.productPackList = productPackList,
                    err => vm.productPackList = []);
        } else {
            $mdToast.showSimple('error: debe ingresar código de producto.')
        }

        vm.selectProductPack = (productPack) => {
            vm.productPackSelected = productPack ? Object.assign({}, { ...productPack
            }) : false;
            if (vm.productPackSelected) vm.onPackSelected(vm.productPackSelected);
            else vm.initPack();
        };

        vm.onPackSelected = pack => {
            if (pack) {
                vm.editPackMode = true;
                vm.createPackMode = false;

                // set info pack
                pack.indicatorcontainer = vm.getIndicatorContainer(pack.indicatorcontainer);
                vm.pack = Object.assign({}, { ...pack
                });
            } else {
                vm.initPack();
            }
        }

        // init state
        vm.initPack = () => {
            vm.pack = {
                code: '',
                indicatorcontainer: 'Primario'
            };
            vm.createPackMode = false;
            vm.editPackMode = false;
            vm.productPackSelected = false;
            vm.loading = false;
            if (vm.packForm) {
                vm.packForm.$setPristine();
                vm.packForm.$setUntouched();
            }
        }

        // Muestra formulario
        vm.showCreatePackForm = () => {
            vm.initPack();
            vm.createPackMode = true;
        }

        // Guardar Pack
        vm.savePack = () => {
            vm.loading = true;
            let packData = Object.assign({}, vm.pack, {
                product: vm.idProduct,
                indicatorcontainer: vm.pack.indicatorcontainer.toLowerCase()
            });
            productFactory
                .savePack(packData)
                .then(
                    (newPack) => {
                        $mdToast.showSimple('Pack del producto guardado exitosamente: ' + newPack.fantasyName);
                        let packExist = _.find(vm.productPackList, {
                            id: newPack.id
                        });
                        if (!packExist) vm.productPackList.push(newPack)
                        else {
                            _.remove(vm.productPackList, {
                                id: newPack.id
                            });
                            vm.productPackList.push(newPack);
                        }
                        vm.initPack();
                    },
                    (err) => {
                        console.log('error al crear pack: ', err);
                        $mdToast.showSimple('No se pudo guardar el pack al producto.');
                    }
                );
        };
        // Eliminar Pack
        vm.removePack = () => {
            vm.loading = true;
            $mdToast.showSimple('Eliminando pack del producto...');
            productFactory
                .removePack({
                    id: vm.pack.id,
                    product: vm.idProduct
                })
                .then(
                    () => {
                        _.remove(vm.productPackList, {
                            id: vm.pack.id
                        });
                        $mdToast.showSimple(vm.pack.fantasyName.toUpperCase() + ' eliminado del Producto');
                        vm.initPack();
                    },
                    (err) => {
                        vm.loading = false;
                        $mdToast.showSimple('Error al remover pack del producto');
                    }
                );
        };

        vm.onDeletePack = () => {
            $mdDialog.show(
                $mdDialog.confirm()
                .title($translate.instant('Eliminar Pack del Producto'))
                .textContent($translate.instant('¿Desea eliminar pack del producto?'))
                .ok($translate.instant('Eliminar'))
                .ariaLabel($translate.instant('PRODUCT.DIALOG.TITLE'))
                .cancel($translate.instant('PRODUCT.DIALOG.CANCEL'))
            ).then(() => {
                vm.removePack();
            });
        };

        vm.getIndicatorContainer = indicatorContainer => {
            for (let ic of vm.indicatorContainers) {
                if (ic.toLowerCase() === indicatorContainer.toLowerCase()) return ic;
            }
        }
    }
})();