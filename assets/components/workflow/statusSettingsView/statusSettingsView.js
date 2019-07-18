(() => {
    'use strict';
    /**
     * Example
     * <ssvq-workflow-status-settings-view></ssvq-workflow-status-settings-view>
     */
    app.directive('ssvqWorkflowStatusSettingsView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                module: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/workflow/statusSettingsView/statusSettingsView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $workflowFactory, $mdDialog, $mdToast) {
        var vm = this;

        if (vm.module) {
            $workflowFactory.getStatus(vm.module, true)
                .then(result => {
                    vm.status = result.status;
                })
                .catch(err => {
                    console.log(err);
                    vm.status = [];
                });
        }

        vm.showSupervisors = (item, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/workflow/statusSettingsView/dialog.supervisors.html',
                controller: function (status) {
                    var vm = this;
                    vm.status = status;
                    vm.supervisors = status.supervisors;

                    vm.close = () => $mdDialog.hide();
                    vm.addSupervisor = employee => {
                        $workflowFactory
                            .addSupervisor(employee.id, status.id)
                            .then(() => {
                                vm.supervisors.push(employee);
                                vm.status.supervisorsCount++;
                                $mdToast.showSimple('Supervisor agregado exitosamente');
                            })
                            .catch(err => console.log(err));
                    };
                    vm.rmSupervisor = employee => {
                        $workflowFactory
                            .rmSupervisor(employee.id, status.id)
                            .then(() => {
                                _.remove(vm.supervisors, { id: employee.id });
                                vm.status.supervisorsCount--;
                                $mdToast.showSimple('Supervisor removido exitosamente');
                            })
                            .catch(err => console.log(err));
                    };
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: { status: item }
            });
        };
    }
})();