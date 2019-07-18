(function () {
    'use strict';
    /**
     * Example
     * <ssvq-employee-avatar employee=""></ssvq-employee-avatar>
     */
    app.directive('ssvqEmployeeAvatar', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                employee: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/employee/employeeAvatar/employeeAvatar.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
        vm.timestamp = moment((vm.employee || {}).updatedAt).format('X');
    }
})();