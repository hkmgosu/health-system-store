(function () {
    'use strict';
    /**
     * Example
     * <any ssvq-employee-profile-link id-employee=""></any>
     */
    app.directive('ssvqEmployeeProfileLink', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                idEmployee: '@?'
            },
            restrict: 'E',
            scope: {}
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, employeeFactory, $element) {
        var vm = this;

        $element.on('click', ($event) => {
            employeeFactory
                .getProfileById(vm.idEmployee)
                .then(
                    employeeProfile => {
                        $mdDialog.show({
                            targetEvent: $event,
                            multiple: true,
                            clickOutsideToClose: true,
                            templateUrl: '/components/employee/employeeProfileLink/dialog.employeeProfile.html',
                            controller:
                                /* @ngInject */
                                function DialogController($mdDialog, employeeProfile) {
                                    var vm = this;
                                    vm.close = () => $mdDialog.hide();
                                    vm.employee = employeeProfile;
                                },
                            controllerAs: 'vm',
                            locals: {
                                employeeProfile: employeeProfile
                            }
                        });
                    }
                );
        });
    }
})();