(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-inventory-admin></ssvq-storage-inventory-admin>
     */
    app.directive('ssvqStorageInventoryAdmin', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/storage/inventory/inventoryAdmin/inventoryAdmin.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, $mdSidenav, $mdDialog, inventoryFactory, unitProductsManagerFactory) {
        //
        var vm = this;
        vm.limit = 15;
        vm.page = 0;
        vm.allowedUnits = false;
        vm.searchUnits = false;
        vm.loading = false;
        vm.inventory = false;
        vm.inventories = false;

        // $mdSidenav('inventories-filter').toggle();

        unitProductsManagerFactory.getAllowedUnits().then(obj => {
            vm.allowedUnits = obj.units;
            vm.searchUnits = [];
            // dejarlas seleccionadas
            for (let i = 0; i < obj.units.length; ++i) {
                vm.searchUnits.push(obj.units[i].id);
            }
            vm.refreshSearch();
        });

        vm.toggleUnit = unit => {
            if (vm.searchUnits === false) vm.searchUnits = [];

            let idx = vm.searchUnits.indexOf(unit.id); // existe en array?
            if (idx == -1) {
                vm.searchUnits.push(unit.id); // agregar al array
            } else {
                vm.searchUnits.splice(idx, 1); // quitar del array
            }

            vm.refreshSearch();
        };

        // ------ buscar los inventarios ----------
        vm.nextPage = () => new Promise((resolve, reject) => {
            if (vm.found && Math.ceil(vm.found / vm.limit) <= vm.page) {
                return resolve();
            }
            vm.page += 1;

            vm.promise = inventoryFactory.getAll({
                limit: vm.limit,
                page: vm.page,
                where: {
                    units: vm.searchUnits
                }
            }).then(res => {
                vm.inventories = (vm.inventories || []).concat(res.obj.inventories);
                vm.inventoryIsValid();
                vm.found = res.obj.found;
                $scope.$apply();
                resolve();
            }).catch(err => {
                console.error(err);
                reject(err);
            });
        });

        vm.refreshSearch = () => {
            vm.page = 0;
            vm.inventories = null;
            vm.nextPage().then(() => {}, () => {});
        };

        // limpiar el filtro
        vm.cleanFilter = () => {
            vm.searchUnits = [];
            vm.page = 0;
            vm.inventories = null;
            for (let i = 0; i < vm.allowedUnits.length; ++i) {
                vm.searchUnits.push(vm.allowedUnits[i].id);
            }
            vm.nextPage().then(() => {}, () => {});
        };

        vm.inventoryIsValid = () => {
            let inventories = [];
            vm.inventories.forEach(inventory => {
                let inventoryValid = true;
                inventory.detail.forEach(detail => {
                    if (detail.realStock === null) inventoryValid = false;
                });
                inventories.push({ ...inventory,
                    isValid: inventoryValid
                });
            });
            vm.inventories = inventories;
        }

        vm.showCreateInventory = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/inventory/inventoryAdmin/dialogCreate.html',
                controller: function($mdDialog) {
                    let vm = this;

                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.inventory);
                },
                bindToController: true,
                controllerAs: 'vm',
                locals: {
                    allowedUnits: vm.allowedUnits,
                    inventories: vm.inventories
                }
            }).then(
                // dialog confirm
                dataConfirm => {
                    if (_.isEmpty(dataConfirm)) {
                        return;
                    }
                    $mdToast.showSimple('Creando Inventario...');
                    inventoryFactory.create(dataConfirm).then(
                        // success
                        created => {
                            $mdToast.showSimple('Se ha creado el inventario');
                            vm.inventories = [created.obj.inventory, ...vm.inventories];
                            vm.found++;
                            vm.inventoryIsValid();
                            $mdDialog.hide();
                            $scope.$apply();
                        },
                        // fail
                        error => $mdToast.showSimple(error.raw ? error.raw.message : error.msg)
                    );
                }
            );
        };

        /// 
    }
})();