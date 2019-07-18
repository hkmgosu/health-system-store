(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-cenabast-admin></ssvq-storage-cenabast-admin>
     */
    app.directive('ssvqStorageCenabastAdmin', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/planCenabast/planCenabastAdmin/planCenabastAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, $mdDialog, planCenabastFactory) {
        var vm = this;
        var vmParent = this;

        vm.product = null;
        vm.plans = [];
        vm.searchText = null;
        vm.year = (new Date).getFullYear();
        vm.month = null;
        vm.months = [
            ["01", "Enero"],
            ["02", "Febrero"],
            ["03", "Marzo"],
            ["04", "Abril"],
            ["05", "Mayo"],
            ["06", "Junio"],
            ["07", "Julio"],
            ["08", "Agosto"],
            ["09", "Septiembre"],
            ["10", "Octubre"],
            ["11", "Noviembre"],
            ["12", "Diciembre"]
        ];
        vm.planCenabast = {};

        // requerido para imagen de producto
        vm.timestamp = product => moment((product || {}).updatedAt).format('X');

        vm.onSelectMonth = month => {
            vm.month = month;
            vm.searchText = null;
            if (!vm.month) return;

            vm.plans = null;
            planCenabastFactory.getAll({
                    where: {
                        year: vm.year,
                        month: Number(vm.month[0])
                    }
                }).then(res => {
                    vm.plans = res.obj.planCenabasts.sort((a, b) => {
                        if (a.product.description == b.product.description) return 0;
                        return a.product.description < b.product.description ? -1 : 1;
                    });
                    $scope.$apply();
                })
                .catch(err => $mdToast.showSimple('Error al buscar plan del mes.' + (console.error(err) || '')));
        };

        vm.addProduct = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                bindToController: true,
                controllerAs: 'vm',
                templateUrl: '/components/storage/planCenabast/planCenabastAdmin/dialogProducto.html',
                controller($mdDialog, $mdToast, planCenabastFactory) {
                    let vm = this;
                    vm.planCenabast = {};
                    vm.timestamp = vmParent.timestamp;
                    vm.exclude = vmParent.plans.reduce((acum, el) => acum.concat(el.product.id), []);

                    vm.onProductSelected = product => {};
                    vm.clean = () => vm.planCenabast.product = null;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => {
                        vm.planCenabast.year = vmParent.year;
                        vm.planCenabast.month = Number(vmParent.month[0]);
                        vm.planCenabast.product = vm.planCenabast.product.id;
                        planCenabastFactory.create(vm.planCenabast)
                            .then(res => {
                                vmParent.plans.push(res.obj.planCenabast);
                                $mdDialog.hide();
                            })
                            .catch(err => $mdToast.showSimple('Error al agregar producto.' + (console.error(err) || '')));
                    }
                }
            });
        };

        vm.editProduct = ($event, $index) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                bindToController: true,
                controllerAs: 'vm',
                templateUrl: '/components/storage/planCenabast/planCenabastAdmin/dialogProducto.html',
                controller($mdDialog, $mdToast, planCenabastFactory) {
                    let vm = this;
                    vm.planCenabast = Object.assign({}, vmParent.plans[$index]);
                    vm.timestamp = vmParent.timestamp;

                    vm.clean = () => null;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => {
                        vm.planCenabast.product = vm.planCenabast.product.id;
                        planCenabastFactory.update(vm.planCenabast)
                            .then(res => {
                                vmParent.plans.splice($index, 1, res.obj.planCenabast);
                                $mdDialog.hide();
                            })
                            .catch(err => $mdToast.showSimple('Error al modificar producto.' + (console.error(err) || '')));
                    }
                }
            });
        };

        vm.delete = ($event, $index) => {
            $mdDialog.show($mdDialog.confirm()
                .title('Plan de Cenabast')
                .ariaLabel('Plan para el producto')
                .textContent('Desea eliminar el registro?')
                .ok('Eliminar')
                .cancel('Cancelar')
            ).then(
                yes => planCenabastFactory.delete(vm.plans[$index].id)
                .then(res => {
                    vm.plans.splice($index, 1);
                    $mdToast.showSimple('Se quitó el producto');
                })
                .catch(err => $mdToast.showSimple('No se quito el producto' + (console.error(err) || ''))),
                no => {}
            );
        };

        vm.timeSearch = null;
        vm.searchProduct = () => {
            if (vm.timeSearch) clearTimeout(vm.timeSearch);
            if (!vm.searchText) {
                vm.plans = [];
                return vm.onSelectMonth(vm.month);
            };

            vm.timeSearch = setTimeout(() => {
                vm.month = null;
                // buscar en todos los productos
                vm.plans = null;
                planCenabastFactory.getAll({
                        filter: vm.searchText,
                        where: {
                            year: vm.year
                        }
                    })
                    .then(res => {
                        vm.plans = res.obj.planCenabasts;
                        $scope.$apply();
                    })
                    .catch(err => $mdToast.showSimple('Error al consultar productos.' + (console.error(err) || '')));
            }, 500);
        };


        $scope.$watch('vm.searchText', vm.searchProduct);
        $scope.$watch('vm.year', vm.searchProduct);
    }
})();