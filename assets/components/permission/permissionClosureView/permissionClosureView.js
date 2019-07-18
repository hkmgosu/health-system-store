(() => {
    'use strict';
    /**
     * Example
     * <ssvq-permission-closure-view></ssvq-permission-closure-view>
     */
    app.directive('ssvqPermissionClosureView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/permission/permissionClosureView/permissionClosureView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $state, $mdDialog, $mdToast, $permissionFactory, $permissionClosureFactory) {
        var vm = this;

        /**
         * Abrir vista para crear nuevo cierre
         */
        vm.createClosure = () => {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/permission/permissionClosureView/dialog.new.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;

                        $permissionFactory.getSupervised({
                            filter: {
                                status: { order: 3 },
                                closure: null
                            }
                        }).then(res => {
                            var approved = res.permissions;
                            approved = _.sortBy(approved, 'createdAt');
                            vm.fromDate = approved[0].createdAt;
                            vm.untilDate = approved[approved.length - 1].createdAt;
                            vm.minDate = new Date(vm.fromDate);
                            vm.maxDate = new Date(vm.untilDate);
                            vm.tempApproved = angular.copy(approved);
                        });

                        vm.filter = () => {
                            vm.tempApproved = _.filter(approved, permission => {
                                let date = new Date(permission.createdAt).getTime();
                                let fromDate = new Date(vm.fromDate);
                                let untilDate = new Date(vm.untilDate);
                                fromDate.setHours(0, 0, 0);
                                untilDate.setHours(24, 0, 0);
                                if (date >= fromDate.getTime() && date <= untilDate.getTime()) return permission;
                            });
                        };

                        vm.remove = permission => {
                            _.remove(vm.tempApproved, { id: permission.id });
                        };

                        vm.close = () => $mdDialog.cancel();
                        vm.save = () => $mdDialog.hide({
                            permissions: angular.copy(vm.tempApproved),
                            observation: vm.observation
                        });
                    },
                controllerAs: 'vm',
                bindToController: true
            }).then(closure => {
                $permissionClosureFactory.createClosure(closure).then(closureCreated => {
                    $state.go('triangular.mi-ssvq.permission-closure-details', {
                        id: closureCreated.id,
                        closure: closureCreated
                    });
                }).catch(err => {
                    console.log(err);
                    $mdToast.showSimple('Ha ocurrido un error: ' + err);
                });
            });
        };
    }
})();