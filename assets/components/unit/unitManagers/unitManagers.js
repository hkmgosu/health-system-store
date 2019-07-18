(function () {
    'use strict';
    /**
     * Example
     * <ssvq-unit-managers></ssvq-unit-managers>
     */
    app.directive('ssvqUnitManagers', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                unit: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/unit/unitManagers/unitManagers.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, unitFactory) {
        var vm = this;

        vm.fields = {
            fullname: true
        };

        vm.roles = unitFactory.getRoleTypes();

        vm.getRole = valueRol => { return (_.find(vm.roles, { value: valueRol }) || {}).name; };

        vm.removeMember = idEmployeeUnit => {
            unitFactory
                .removeMember(idEmployeeUnit)
                .then((res) => {
                    if (res.ok) {
                        _.remove(vm.members, { id: res.obj.id });
                        $mdToast.showSimple('Se quito al funcionario de la Unidad');
                    }
                }, (err) => {
                    console.log(err);
                });
        };

        vm.selectManager = (employeeSelected) => {
            if (employeeSelected) {
                var coincidence = _.find(vm.members, member => {
                    return member.employee.id === employeeSelected.id && member.role === vm.role;
                });
                if (!coincidence) {
                    addMember(vm.unit.id, _.pick(employeeSelected, ['id', 'fullname']), vm.role);
                } else {
                    $mdToast.showSimple('Empleado ya cumple el rol seleccionado en esta Unidad');
                }
            }
        };

        var addMember = (unit, employee, role) => {
            unitFactory
                .setMember(unit, employee.id, role)
                .then((res) => {
                    if (res.ok) {
                        res.obj.employee = employee;
                        vm.members.push(res.obj);
                        vm.role = undefined;
                        $mdToast.showSimple('Se agregó el funcionario a la Unidad');
                    }
                }, (err) => {
                    console.log(err);
                });
        };

        var getMembers = () => {
            unitFactory
                .getMembersUnit(vm.unit.id)
                .then((res) => {
                    vm.members = res.obj.members;
                }, (err) => {
                    console.log(err);
                });
        };

        getMembers();
    }
})();