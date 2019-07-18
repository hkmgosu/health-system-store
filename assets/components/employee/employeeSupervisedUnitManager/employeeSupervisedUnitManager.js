(function () {
    'use strict';
    /**
     * Esta directiva recibe un objeto employee, obtiene sus unidades
     * supervisadas y permite agregar/eliminar unidades
     *
     * Example
     * <ssvq-employee-supervised-unit-manager employee=""></ssvq-employee-supervised-unit-manager>
     */
    app.directive('ssvqEmployeeSupervisedUnitManager', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idEmployee: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/employee/employeeSupervisedUnitManager/employeeSupervisedUnitManager.html'
        };
    });

    /* @ngInject */
    function ComponentController(employeeFactory, $mdToast) {
        var vm = this;
        // Obtener unidades supervisadas de funcionario
        employeeFactory
            .getSupervisedUnits(vm.idEmployee)
            .then(
                obj => vm.supervisedUnits = obj,
                err => console.log(err)
            );
        // Agregar unidad supervisada
        vm.addUnit = (unit) => {
            if (!unit) {
                return;
            }
            if (_.find(vm.supervisedUnits, { id: unit.id })) {
                return $mdToast.showSimple('La unidad ya existe en la lista de supervisión')
            }
            employeeFactory
                .addSupervisedUnit(vm.idEmployee, unit.id)
                .then(
                    () => {
                        vm.supervisedUnits.push(unit);
                        $mdToast.showSimple('Unidad agregada a lista de supervisión');
                    },
                    (err) => {
                        console.log('Error agregando unidad supervisada', err);
                        $mdToast.showSimple('Error agregando unidad supervisada');
                    }
                );
        };
        // Eliminar unidad supervisada
        vm.removeUnit = (unit) => {
            unit.wip = true;
            employeeFactory
                .removeSupervisedUnit(vm.idEmployee, unit.id)
                .then(
                    () => {
                        _.remove(vm.supervisedUnits, { id: unit.id });
                        $mdToast.showSimple('Unidad eliminada de lista de supervisión');
                    },
                    (err) => {
                        unit.wip = false;
                        console.log('Error eliminando unidad supervisada', err);
                        $mdToast.showSimple('Error eliminando unidad supervisada');
                    }
                );
        };
    }
})();