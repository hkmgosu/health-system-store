(() => {
    'use strict';
    /**
      * Example
      * <ssvq-rem-settings></ssvq-rem-settings>
      */
    app.directive('ssvqRemSettings', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/rem/remSettings/remSettings.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, remFactory, remStatusFactory, $scope, $mdToast, $timeout) {
        var vm = this;

        vm.statusList = [];

        vm.changeSupervisors = ($event, statusSelected) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/rem/remSettings/dialog.statusSupervisor.html',
                /* @ngInject */
                controller: function ($mdDialog, $mdToast, remStatusFactory) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide();

                    vm.jobList = [];

                    remStatusFactory.getSupervisorList(vm.statusSelected.id).then((jobList) => {
                        vm.jobList = jobList;
                    }, () => { });

                    vm.addSupervisor = job => {
                        remStatusFactory.addSupervisor(vm.statusSelected.id, job.id).then(() => {
                            vm.jobList.unshift(job);
                            $mdToast.showSimple('Cargo agregado exitosamente');
                        }, () => { });
                    };

                    vm.removeSupervisor = job => {
                        remStatusFactory.removeSupervisor(vm.statusSelected.id, job.id).then(() => {
                            _.remove(vm.jobList, { id: job.id });
                            $mdToast.showSimple('Cargo removido exitosamente');
                        }, () => { });
                    };
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    statusSelected: statusSelected
                }
            }).finally(refreshStatusList);
        };

        var timeoutPromise;
        vm.changeOrder = (status, type) => {
            switch (type) {
                case 'up':
                    let prevStatus = vm.statusList.find(item => item.order === status.order - 1);
                    prevStatus.order++;
                    status.order--;
                    prevStatus.orderUpdated = true;
                    status.orderUpdated = true;
                    break;
                case 'down':
                    let nextStatus = vm.statusList.find(item => item.order === status.order + 1);
                    nextStatus.order--;
                    status.order++;
                    nextStatus.orderUpdated = true;
                    status.orderUpdated = true;
                    break;
            }
            vm.statusList = vm.statusList.sort((a, b) => (a.order > b.order) ? 1 : -1);

            $timeout.cancel(timeoutPromise);
            timeoutPromise = $timeout(function () {
                remStatusFactory.updateOrder(vm.statusList.filter(status => status.orderUpdated)).then(() => {
                    $mdToast.showSimple('Orden actualizado correctamente');
                }, () => $mdToast.showSimple('Ha ocurrido un error'));
            }, 2000);
        };

        vm.addStatus = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/rem/remSettings/dialog.addStatus.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.status);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {}
            }).then((status) => {
                status.order = Math.max(...vm.statusList.map(status => status.order)) + 1;
                remStatusFactory.create(status).then(() => {
                    refreshStatusList();
                });
            });
        };

        var refreshStatusList = () => {
            remFactory.getRemStatus().then(
                (statusList) => vm.statusList = statusList.sort((a, b) => (a.order > b.order) ? 1 : -1),
                (err) => console.error('remFactory.getRemStatus', err)
            );
        };

        refreshStatusList();

    }
})();