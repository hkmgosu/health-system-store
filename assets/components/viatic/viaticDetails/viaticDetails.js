(function () {
    'use strict';
    /**
     * Example
     * <ssvq-viatic-details key=""></ssvq-viatic-details>
     */
    app.directive('ssvqViaticDetails', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/viatic/viaticDetails/viaticDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($viaticFactory, $workflowFactory, $stateParams, $mdDialog, $mdToast, $scope) {
        var vm = this;

        vm.idViatic = $stateParams.id;

        vm.goBack = () => {
            if (window.history.length > 1) { return window.history.back(); }
            window.location.href = "#/viaticos";
        };

        $viaticFactory.getDetails(vm.idViatic).then(viatic => {
            vm.viatic = viatic;
            getEnabledStatusList();
        }, () => vm.goBack());

        var getEnabledStatusList = () => {
            $workflowFactory.getEnabledStatusList(vm.idViatic, 'viatic').then(
                enabledStatusList => vm.enabledStatusList = enabledStatusList,
                () => vm.enabledStatusList = null
            );
        };

        vm.changeStatus = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/viatic/viaticDetails/dialog.changeStatus.html',
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
                    currentStatus: vm.viatic.status
                }
            }).then(opts => {
                $viaticFactory.changeStatus({
                    id: vm.viatic.id,
                    idStatus: opts.statusSelected.id,
                    comment: opts.comment
                }).then(() => {
                    $mdToast.showSimple('Estado de viático actualizado correctamente');
                    vm.viatic.status = opts.statusSelected;
                    getEnabledStatusList();
                }, () => $mdToast.showSimple('Ha ocurrido un error'));
            });
        };

        vm.sendComment = comment => new Promise((resolve, reject) => {
            comment.idModelModule = vm.idViatic;
            comment.modelModule = 'viatic';
            $viaticFactory.addComment(comment).then(resolve, reject);
        });

        var onSocket = function (event) {
            if (event.id != vm.idViatic) { return; }
            let eventData = event.data;
            switch (eventData.message) {
                case 'viaticLog': {
                    vm.viatic.status = eventData.data.status;
                    getEnabledStatusList();
                    break;
                }
            }
            $scope.$apply();
        };
        io.socket.on('viatic', onSocket);
        $scope.$on('$destroy', function () {
            io.socket.off('viatic', onSocket);
        });
    }
})();