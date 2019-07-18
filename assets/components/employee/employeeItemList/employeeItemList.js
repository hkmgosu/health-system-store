(function () {
    'use strict';
    /**
     * Example
     * <ssvq-employee-item-list employee="" fields=""></ssvq-employee-item-list>
     */
    app.directive('ssvqEmployeeItemList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                employee: '=',
                fields: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/employee/employeeItemList/employeeItemList.tmpl.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;

        _.defaults(vm.fields, {
            job: false,
            establishment: false,
            contact: false
        });
    }
})();