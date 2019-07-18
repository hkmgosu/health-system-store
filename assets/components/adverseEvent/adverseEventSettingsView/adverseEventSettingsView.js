(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-settings-view></ssvq-adverse-event-settings-view>
     */
    app.directive('ssvqAdverseEventSettingsView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventSettingsView/adverseEventSettingsView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, $mdDialog, establishmentFactory, unitFactory) {
        var vm = this;
        vm.establishments = [];
        var saving = 0;

        (() => {
            establishmentFactory
                .getAdverseEventModuleAvailable()
                .then((result) => {
                    vm.establishments = result.obj;
                }, err => {
                    console.log(err);
                    vm.establishments = [];
                });
        })();

        vm.addEstablishment = item => {
            if (!item) { return; }
            establishmentFactory.save({
                id: item.id,
                adverseEventModuleAvailable: true
            }).then(() => {
                $mdToast.showSimple('Establecimiento agregado al módulo');
                vm.establishments.push(_.merge(item, { adverseEventModuleAvailable: true }));
            });
        };

        vm.rmEstablishment = item => {
            if (!item) { return; }
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('¿Deseas quitar el establecimiento seleccionado del módulo de eventos adversos?')
                    .textContent('El establecimiento seleccionado no podrá recibir notificaciones')
                    .ok('Quitar establecimiento')
                    .ariaLabel('Quitar establecimiento')
                    .cancel('Volver')
            ).then(() => {
                establishmentFactory.save({
                    id: item.id,
                    adverseEventModuleAvailable: false
                }).then(() => {
                    $mdToast.showSimple('Establecimiento quitado del módulo');
                    _.remove(vm.establishments, { id: item.id });
                });
            });
        };

        vm.getUnitsEstablishment = establishment => {
            vm.onLoadUnits = true;
            vm.activeEstablishment = establishment;
            unitFactory
                .getUnitsEstablishment(establishment)
                .then(result => {
                    vm.units = result.obj;
                }, err => {
                    console.log(err);
                    vm.units = [];
                });
        };

        vm.finished = () => {
            vm.onLoadUnits = false;
        };

        vm.onChange = (item, option) => {
            if (option !== undefined) {
                item.adverseEvent = option ? true : null;
            }
            saving = saving + 1;
            unitFactory.save(item)
                .then((result) => {
                    saving = saving - 1;
                    if (saving === 0) {
                        $mdToast.showSimple('Cambios guardados');
                    }
                })
                .catch(() => {
                    saving = saving - 1;
                    $mdToast.showSimple('Ha ocurrido un error');
                });
        };

        vm.showSupervisors = (item, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/adverseEvent/adverseEventSettingsView/dialog.supervisors.html',
                controller: function (establishmentFactory) {
                    var vm = this;
                    vm.establishment = vm.toSupervise;
                    vm.close = () => $mdDialog.hide();
                    establishmentFactory
                        .getAdverseEventSupervisors(vm.establishment.id)
                        .then(response => vm.supervisors = response.obj.supervisors);

                    vm.addSupervisor = employee => {
                        establishmentFactory.addAdverseEventSupervisors(employee.id, vm.establishment.id).then(() => {
                            vm.supervisors.push(employee);
                            vm.establishment.adverseEventSupervisorsCount++;
                            $mdToast.showSimple('Supervisor agregado exitosamente');
                        });
                    };
                    vm.rmSupervisor = employee => {
                        establishmentFactory.rmAdverseEventSupervisors(employee.id, vm.establishment.id).then(() => {
                            _.remove(vm.supervisors, { id: employee.id });
                            vm.establishment.adverseEventSupervisorsCount--;
                            $mdToast.showSimple('Supervisor removido exitosamente');
                        });
                    };
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { toSupervise: item }
            });
        };

        vm.showUnitSupervisors = (item, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/adverseEvent/adverseEventSettingsView/dialog.supervisors.html',
                controller: function (unitFactory) {
                    var vm = this;
                    vm.unit = vm.toSupervise;
                    vm.close = () => $mdDialog.hide();
                    unitFactory
                        .getAdverseEventSupervisors(vm.unit.id)
                        .then(response => vm.supervisors = response.obj.supervisors);

                    vm.addSupervisor = employee => {
                        unitFactory.addAdverseEventSupervisors(employee.id, vm.unit.id).then(() => {
                            vm.supervisors.push(employee);
                            vm.unit.adverseEventSupervisorsCount++;
                            $mdToast.showSimple('Supervisor agregado exitosamente');
                        });
                    };
                    vm.rmSupervisor = employee => {
                        unitFactory.rmAdverseEventSupervisors(employee.id, vm.unit.id).then(() => {
                            _.remove(vm.supervisors, { id: employee.id });
                            vm.unit.adverseEventSupervisorsCount--;
                            $mdToast.showSimple('Supervisor removido exitosamente');
                        });
                    };
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { toSupervise: item }
            });
        };
    }
})();