(() => {
    'use strict';
    /**
      * Example
      * <ssvq-rem-access-view></ssvq-rem-access-view>
      */
    app.directive('ssvqRemAccessView', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/rem/remAccessView/remAccessView.html'
        };
    });

    /* @ngInject */
    function ComponentController(remAccessFactory, $scope) {
        var vm = this;

        vm.updateTable = () => {
            if (!vm.idRem) { return; }
            // Obtener listado
            remAccessFactory.get(vm.idRem).then(remAccessList => {
                vm.remAccessList = remAccessList;
                $scope.$apply();
            }, () => {
                vm.remAccessList = [];
                $scope.$apply();
            });
        };

        vm.accessDate = new Date();

        vm.onDateChange = () => vm.updateEmployeeTable(vm.employee);

        vm.updateEmployeeTable = (employee) => {
            if (!employee || !moment(vm.accessDate).isValid()) { return; }
            // Obtener listado
            remAccessFactory.getEmployeeAccessList(employee.id, vm.accessDate).then(employeeAccessList => {
                vm.employeeAccessList = employeeAccessList;
                $scope.$apply();
            }, () => {
                vm.employeeAccessList = [];
                $scope.$apply();
            });
        };
    }
})();