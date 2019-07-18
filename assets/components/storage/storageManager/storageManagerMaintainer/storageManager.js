(function() {
    'use strict';
    /**
     * Example
     * <ssvq-storage-manager></ssvq-storage-manager>
     */
    app.directive('ssvqStorageManager', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/storageManager/storageManagerMaintainer/storageManager.html'
        };
    });

    /* @ngInject */
    function ComponentController(storageManagerFactory, $mdDialog, $mdToast) {
        var vm = this;

        vm.storageUnit = {
            unit: null,
            storage: false,
            isPharmaceutical: false
        };

        vm.loading = true;

        storageManagerFactory
            .getStorageUnits()
            .then(res => {
                    vm.loading = false;
                    vm.storageUnits = res;
                },
                err => {
                    vm.loading = false;
                    $mdToast.showSimple(`Error al buscar Bodegas, intente nuevamente...`);
                    console.log('storageUnits error', err);
                }
            );

        vm.saveStorageUnit = () => {

            if (_.find(vm.storageUnits, {
                    id: vm.storageUnit.unit.id
                })) return $mdToast.showSimple(`Unidad ${vm.storageUnit.unit.name} ya existe en la configuración.`);

            $mdToast.showSimple('agregando unidad...');
            vm.loading = true;
            storageManagerFactory.saveStorageUnit({
                unit: vm.storageUnit.unit.id,
                storage: true,
                isPharmaceutical: vm.storageUnit.isPharmaceutical
            }).then(() => {
                vm.loading = false;
                $mdToast.showSimple('Unidad agregada a la configuración');
                vm.storageUnits.push(_.merge(vm.storageUnit.unit, {
                    storage: true,
                    isPharmaceutical: vm.storageUnit.isPharmaceutical,
                    storageManagerListCount: 0
                }));
            }, err => {
                vm.loading = false;
                $mdToast.showSimple('Unidad no se agregró a la configuración');
                console.log("error agregar unidad a bodega", err);
            });
        };

        vm.rmStorageUnit = unit => {
            if (!unit) {
                return;
            }
            $mdDialog.show(
                $mdDialog.confirm()
                .title('¿Deseas quitar la unidad seleccionada?')
                .textContent('La unidad seleccionada no podrá crear productos')
                .ok('Quitar unidad')
                .ariaLabel('Quitar unidad de bodega')
                .cancel('Volver')
            ).then(() => {
                $mdToast.showSimple('quitando unidad...');
                vm.loading = true;
                storageManagerFactory.saveStorageUnit({
                    unit: unit.id,
                    storage: false,
                    isPharmaceutical: false
                }).then(unit => {
                    vm.loading = false;
                    $mdToast.showSimple('Unidad quitada de la configuración');
                    _.remove(vm.storageUnits, {
                        id: unit.id
                    });
                }, err => {
                    vm.loading = false;
                    $mdToast.showSimple(`No se pudo actualizar Unidad`);
                    console.log("No se pudo actualizar Unidad", err);
                });
            });
        };

        vm.showStorageManagers = (unit, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/storage/storageManager/storageManagerMaintainer/dialog.unitSupervisors.html',
                controller: function(storageManagerFactory) {
                    var vm = this;
                    vm.close = () => $mdDialog.hide();

                    vm.loading = true;
                    storageManagerFactory
                        .getStorageManagers(vm.unit.id)
                        .then(response => {
                            vm.loading = false;
                            vm.storageManagers = response.obj.storageManagers;
                        });

                    vm.addStorageManager = employee => {
                        vm.loading = true;
                        if (_.find(vm.storageManagers, {
                                employee: {
                                    id: employee.id
                                }
                            })) {
                            vm.loading = false;
                            return $mdToast.showSimple('Usuario ya existe en la configuración')
                        }
                        storageManagerFactory.addStorageManager(employee.id, vm.unit.id).then(data => {
                            if (!data.ok) $mdToast.showSimple('No se pudo agregar a la configuración');
                            vm.loading = false;
                            vm.storageManagers.push(data.obj);
                            vm.unit.storageManagerListCount++;
                            $mdToast.showSimple('Usuario agregado exitosamente');
                        }, err => {
                            vm.loading = false;
                            $mdToast.showSimple(`No se pudo actualizar`);
                            console.log("No se pudo actualizar Unidad", err);
                        });
                    };
                    vm.rmStorageManager = employee => {
                        let initManagers = vm.storageManagers;
                        vm.storageManagers = null;
                        vm.loading = true;
                        storageManagerFactory.rmStorageManager(employee.id, vm.unit.id).then(() => {
                            vm.loading = false;
                            vm.storageManagers = initManagers;
                            _.remove(vm.storageManagers, {
                                employee: {
                                    id: employee.id
                                }
                            });
                            vm.unit.storageManagerListCount = vm.storageManagers.length;
                            $mdToast.showSimple('Administrador removido exitosamente');
                        }, err => {
                            vm.loading = false;
                            $mdToast.showSimple(`No se pudo actualizar la Unidad`);
                            console.log("No se pudo actualizar Unidad", err);
                        });
                    };
                    vm.updateUnit = () => {
                        $mdToast.showSimple('actualizando unidad...');
                        vm.loading = true;
                        storageManagerFactory.saveStorageUnit({
                            storage: true,
                            unit: vm.unit.id,
                            isPharmaceutical: vm.unit.isPharmaceutical
                        }).then(() => {
                            vm.loading = false
                            let toastMsg = vm.unit.isPharmaceutical ? "como Farmacia" : "como Economato";
                            toastMsg = vm.unit.storage ? toastMsg : '';
                            $mdToast.showSimple(`Unidad actualizada ${toastMsg}`);
                        }, err => {
                            vm.loading = false;
                            $mdToast.showSimple(`No se pudo actualizar la configuración`);
                            console.log("No se pudo actualizar Unidad", err);
                        });
                    }
                    vm.updateStorageManager = item => {
                        $mdToast.showSimple('actualizando usuario...');
                        vm.loading = true;
                        storageManagerFactory.updateStorageManager({
                            unit: vm.unit.id,
                            employee: item.employee.id,
                            isAdmin: item.isAdmin,
                            isPharmacyBoss: item.isPharmacyBoss
                        }).then(() => {
                            vm.loading = false
                            $mdToast.showSimple(`Usuario actualizado`);
                        }, err => {
                            vm.loading = false;
                            $mdToast.showSimple(`No se pudo actualizar la configuración`);
                            console.log("No se pudo actualizar Unidad", err);
                        });
                    }
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    unit: unit
                }
            });
        };
    }
})();