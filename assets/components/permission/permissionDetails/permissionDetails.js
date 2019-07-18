(function () {
    'use strict';
    /**
     * Example
     * <ssvq-permission-details></ssvq-permission-details>
     */
    app.directive('ssvqPermissionDetails', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/permission/permissionDetails/permissionDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $stateParams, $mdToast, $mdDialog, $permissionFactory, $workflowFactory) {
        var vm = this;
        vm.canChangeStatus = false;
        vm.idPermission = $stateParams.id;
        vm.permission = $stateParams.permission;

        vm.goBack = () => {
            if (window.history.length > 1) { return window.history.back(); }
            window.location.href = "#/permisos";
        };

        $permissionFactory.getDetails($stateParams.id).then(permission => {
            vm.permission = permission;
            getEnabledStatusList();
        }, () => vm.goBack());

        var getEnabledStatusList = () => {
            $workflowFactory.getEnabledStatusList(vm.idPermission, 'permission').then(
                enabledStatusList => vm.enabledStatusList = enabledStatusList,
                () => vm.enabledStatusList = null
            );
        };

        vm.changeStatus = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/permission/permissionDetails/dialog.changeStatus.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide({
                            statusSelected: vm.statusSelected,
                            comment: vm.comment
                        });
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    statusList: vm.enabledStatusList,
                    currentStatus: vm.permission.status
                },
            }).then(opts => {
                $permissionFactory.setStatus({
                    id: vm.idPermission,
                    idStatus: opts.statusSelected.id,
                    comment: opts.comment
                }).then(() => {
                    $mdToast.showSimple('Estado del permiso actualizado correctamente');
                    vm.permission.status = opts.statusSelected;
                    getEnabledStatusList();
                }, () => $mdToast.showSimple('Ha ocurrido un error'));
            });
        };

        vm.sendComment = (comment) => new Promise((resolve, reject) => {
            comment.idModelModule = $stateParams.id;
            comment.modelModule = 'permission';
            $permissionFactory.addComment(comment).then(resolve, reject);
        });

        var socketRequest = (event) => {
            if (event.id == vm.idPermission) {
                let log = event.data.data;
                if (log.status) { vm.permission.status = log.status; }
                getEnabledStatusList();
            }
        };

        io.socket.on('permission', socketRequest);
        $scope.$on('$destroy', () => io.socket.off('permission', socketRequest));
    }
})();