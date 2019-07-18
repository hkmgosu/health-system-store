(function () {
    'use strict';
    /**
     * Example
     * <ssvq-unit-supervisors></ssvq-unit-supervisors>
     */
    app.directive('ssvqUnitSupervisors', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                unit: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/unit/unitSupervisors/unitSupervisors.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, employeeFactory) {
        var vm = this;

        vm.fields = {
            fullname: true
        };

        $scope.$watch(
            () => { return vm.employeeSelected; },
            (employeeSelected) => {
                if (employeeSelected) {
                    var coincidence = _.find(vm.employees, function (employee) {
                        return employee.id === employeeSelected.id;
                    });
                    if (!coincidence) {
                        addEmployee(vm.unit.id, _.pick(employeeSelected, ['id', 'fullname']));
                    } else {
                        $mdToast.showSimple('Empleado ya se encuentra en esta Unidad');
                    }
                }
            },
            true
        );

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

        vm.addSupervisor = (employee) => {
            unitFactory
                .addSupervisor(vm.unit.id, employee.id)
                .then((res) => {
                    if (res.ok) {
                        vm.employees.push(_.extend(res.obj, employee));
                        vm.unit.employees = vm.employees;
                        $mdToast.showSimple('Se agregó el funcionario a la Unidad');
                    }
                }, (err) => {
                    console.log(err);
                });
        };

        var getSupervisors = () => {
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