(function () {
    'use strict';
    /**
     * Example
     * <ssvq-unit-employees></ssvq-unit-employees>
     */
    app.directive('ssvqUnitEmployees', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                unit: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/unit/unitEmployees/unitEmployees.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, employeeFactory) {
        var vm = this;

        vm.fields = {
            fullname: true
        };

        vm.rmEmployee = (employee) => {
            employee.unit = null;
            employeeFactory
                .setUnit(_.pick(employee, ['id', 'unit']))
                .then((res) => {
                    if (res.ok) {
                        _.remove(vm.employees, { id: res.obj.id });
                        vm.unit.employees = vm.employees;
                        $mdToast.showSimple('Se quito al funcionario de la Unidad');
                    }
                }, (err) => {
                    console.log(err);
                });
        };

        vm.addEmployee = employeeSelected => {
            let coincidence = _.find(vm.employees, function (employee) {
                return employee.id === employeeSelected.id;
            });
            if (coincidence) { return $mdToast.showSimple('El funcionario ya se encuentra en esta Unidad'); }
            employeeSelected.unit = vm.unit.id;
            employeeFactory
                .setUnit(_.pick(employeeSelected, ['id', 'unit']))
                .then((res) => {
                    if (res.ok) {
                        vm.employees.push(_.extend(res.obj, employeeSelected));
                        vm.unit.employees = vm.employees;
                        $mdToast.showSimple('Se agregó el funcionario a la Unidad');
                    }
                }, (err) => {
                    console.log(err);
                    $mdToast.showSimple('Ha ocurrido un error agregando al funcionario');
                });
        };

        var getEmployees = () => {
            employeeFactory
                .getPerUnit({ unit: vm.unit.id })
                .then((res) => {
                    vm.employees = res.obj.employees;
                }, (err) => {
                    console.log(err);
                });
        };

        getEmployees();
    }
})();