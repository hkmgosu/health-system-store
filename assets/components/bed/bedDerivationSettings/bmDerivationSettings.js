(function () {
    'use strict';
    /**
     * Example
     * <ssvq-bm-derivation-settings key=""></ssvq-bm-derivation-settings>
     */
    app.directive('ssvqBmDerivationSettings', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/bed/bedDerivationSettings/bmDerivationSettings.html'
        };
    });

    /* @ngInject */
    function ComponentController(establishmentFactory, $mdDialog, $mdToast) {
        var vm = this;

        // Obtener lista de establecimientos GC
        establishmentFactory.get({ bedManagementModuleAvailable: true }).then(
            establishmentList => vm.establishmentList = establishmentList || []
        );

        // Agregar un establecimiento a la lista GC
        vm.addEstablishment = establishment => {
            establishmentFactory.setBedManagementModuleAvailable(establishment.id, true).then(
                () => {
                    vm.establishmentList.push(establishment);
                    $mdToast.showSimple('Establecimiento agregado exitosamente');
                },
                err => console.log(err)
            );
        };

        // Quitar un establecimiento de la lista GC
        vm.removeEstablishment = establishment => {
            establishmentFactory.setBedManagementModuleAvailable(establishment.id, false).then(
                () => {
                    _.remove(vm.establishmentList, { id: establishment.id });
                    $mdToast.showSimple('Establecimiento removido exitosamente');
                },
                err => console.log(err)
            );
        };

        // Abrir popup para gestionar supervisores de establecimiento
        vm.manageSupervisors = (establishment, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/bed/bedDerivationSettings/dialog.establishmentSupervisors.html',
                /* @ngInject */
                controller: function ($mdDialog, establishmentFactory, $mdToast, $derivationFactory) {
                    var vm = this;

                    // Obtener lista de supervisores GC de establecimiento
                    establishmentFactory.getBedManagementSupervisors(vm.establishment.id)
                        .then(supervisors => vm.supervisors = supervisors);

                    // Agregar supervisor GC de establecimiento
                    vm.addBedManagementSupervisor = employee => {
                        establishmentFactory.addBedManagementSupervisor(vm.establishment.id, employee.id)
                            .then(() => {
                                vm.supervisors.push(employee);
                                vm.establishment.bedManagementSupervisorsCount++;
                                $mdToast.showSimple('Supervisor agregado exitosamente');
                            });
                    };

                    // Quitar supervisor GC de establecimiento
                    vm.removeBedManagementSupervisor = employee => {
                        establishmentFactory.removeBedManagementSupervisor(vm.establishment.id, employee.id)
                            .then(() => {
                                _.remove(vm.supervisors, { id: employee.id });
                                vm.establishment.bedManagementSupervisorsCount--;
                                $mdToast.showSimple('Supervisor removido exitosamente');
                            });
                    };

                    // Obtener lista de unidades GC del establecimiento
                    $derivationFactory.getUnitListAvailable(vm.establishment.id)
                        .then(
                            unitList => vm.unitList = unitList || [],
                            err => vm.unitList = []
                        );

                    // Agregar unidad GC de establecimiento
                    vm.addUnit = unit => {
                        $derivationFactory.setUnitDerivationModuleAvailable(unit.id, true)
                            .then(() => {
                                vm.unitList.push(unit);
                                $mdToast.showSimple('Unidad agregada exitosamente');
                            });
                    };

                    // Quitar unidad GC de establecimiento
                    vm.removeUnit = unit => {
                        $derivationFactory.setUnitDerivationModuleAvailable(unit.id, false)
                            .then(() => {
                                _.remove(vm.unitList, { id: unit.id });
                                $mdToast.showSimple('Unidad removida exitosamente');
                            });
                    };

                    // Volver
                    vm.cancel = () => $mdDialog.hide();
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    establishment: establishment
                }
            });
        };
    }
})();