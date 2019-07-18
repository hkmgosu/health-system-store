(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-settings-view></ssvq-request-settings-view>
     */
    app.directive('ssvqRequestSettingsView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestSettingsView/requestSettingsView.html'
        };
    });

    /* @ngInject */
    function ComponentController(unitFactory, $mdDialog, $mdToast) {
        var vm = this;
        unitFactory
            .getRequestUnits()
            .then(units => {
                vm.publicUnits = _.filter(units, { requestType: 'public' });
                vm.privateUnits = _.filter(units, { requestType: 'private' });
            });

        vm.addPublicUnit = unit => {
            if (!unit) { return; }
            unitFactory.save({
                id: unit.id,
                requestType: 'public'
            }).then(() => {
                $mdToast.showSimple('Unidad agregada a lista pública');
                vm.publicUnits.push(_.merge(unit, { requestType: 'public' }));
            });
        };
        vm.addPrivateUnit = unit => {
            if (!unit) { return; }
            unitFactory.save({
                id: unit.id,
                requestType: 'private'
            }).then(() => {
                $mdToast.showSimple('Unidad agregada a lista privada');
                vm.privateUnits.push(_.merge(unit, { requestType: 'private' }));
            });
        };
        vm.rmPublicUnit = unit => {
            if (!unit) { return; }
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('¿Deseas quitar la unidad seleccionada de la lista pública?')
                    .textContent('La unidad seleccionada no podrá recibir solicitudes públicas')
                    .ok('Quitar unidad')
                    .ariaLabel('Quitar unidad de lista pública')
                    .cancel('Volver')
            ).then(() => {
                unitFactory.save({
                    id: unit.id,
                    requestType: null
                }).then(unit => {
                    $mdToast.showSimple('Unidad quitada de lista pública');
                    _.remove(vm.publicUnits, { id: unit.id });
                });
            });
        };
        vm.rmPrivateUnit = unit => {
            if (!unit) { return; }
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('¿Deseas quitar la unidad seleccionada de la lista privada?')
                    .textContent('La unidad seleccionada no podrá recibir derivaciones de solicitud')
                    .ok('Quitar unidad')
                    .ariaLabel('Quitar unidad de lista privada')
                    .cancel('Volver')
            ).then(() => {
                unitFactory.save({
                    id: unit.id,
                    requestType: null
                }).then(unit => {
                    $mdToast.showSimple('Unidad quitada de lista privada');
                    _.remove(vm.privateUnits, { id: unit.id });
                });
            });
        };

        vm.showSupervisors = (unit, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/request/requestSettingsView/dialog.unitSupervisors.html',
                controller: function (unitFactory) {
                    var vm = this;
                    vm.close = () => $mdDialog.hide();
                    unitFactory
                        .getSupervisors(vm.unit.id)
                        .then(supervisors => vm.supervisors = supervisors);

                    vm.addSupervisor = employee => {
                        unitFactory.addSupervisor(employee.id, vm.unit.id).then(() => {
                            vm.supervisors.push(employee);
                            vm.unit.supervisorsCount++;
                            $mdToast.showSimple('Supervisor agregado exitosamente');
                        });
                    };
                    vm.rmSupervisor = employee => {
                        unitFactory.rmSupervisor(employee.id, vm.unit.id).then(() => {
                            _.remove(vm.supervisors, { id: employee.id });
                            vm.unit.supervisorsCount--;
                            $mdToast.showSimple('Supervisor removido exitosamente');
                        });
                    };
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { unit: unit }
            });
        };
    }
})();