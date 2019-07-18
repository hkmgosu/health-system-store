(function () {
    'use strict';
    /**
     * Example
     * <ssvq-public-toolbar></ssvq-public-toolbar>
     */
    app.directive('ssvqPublicToolbar', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: true,
            restrict: 'E',
            scope: {},
            templateUrl: '/views/public/modules/toolbar/toolbar.tmpl.html'
        };
    });

    /* @ngInject */
    function ComponentController($rootScope, $scope, $mdDialog, $mdUtil, $mdSidenav) {
        var vm = this;

        vm.employee = _.isEmpty(employee) ? null : employee;

        vm.showEmployeeProfile = employeeSelected => {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/views/public/modules/toolbar/employee-profile.tmpl.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog, localEmployee, showEstablishment) {
                        var vm = this;
                        vm.close = function () {
                            $mdDialog.hide();
                        };
                        vm.employee = localEmployee;
                        vm.showEstablishment = showEstablishment;
                    },
                controllerAs: 'vm',
                locals: {
                    localEmployee: angular.copy(employeeSelected),
                    showEstablishment: showEstablishment
                }
            });
        };

        vm.openSideNav = (navID) => {
            $mdUtil.debounce(function () {
                $mdSidenav(navID).toggle();
            }, 300)();
        };

        var showEstablishment = function (establishment) {
            $rootScope.$broadcast('establishment/focus', establishment);
            $mdDialog.hide();
        };
    }
})();