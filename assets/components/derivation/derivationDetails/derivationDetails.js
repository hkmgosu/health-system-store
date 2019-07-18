(function () {
    'use strict';
    /**
     * Example
     * <ssvq-derivation-details key=""></ssvq-derivation-details>
     */
    app.directive('ssvqDerivationDetails', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/derivation/derivationDetails/derivationDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $derivationFactory, $derivationStatusFactory, $stateParams, $mdDialog, $mdToast) {
        var vm = this;
        vm.idDerivation = parseInt($stateParams.id);
        $derivationFactory.get($stateParams.id).then(derivation => {
            vm.derivation = derivation;
        });

        $derivationStatusFactory.getList().then(derivationStatusList => vm.derivationStatusList = derivationStatusList);

        vm.changeStatus = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/derivation/derivationDetails/dialog.statusChange.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide({ statusSelected: vm.statusSelected, comment: vm.comment });
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    derivationStatusList: vm.derivationStatusList,
                    statusSelected: vm.derivation.status
                },
                multiple: true
            }).then(opts => {
                $derivationFactory.update({
                    id: vm.derivation.id, status: opts.statusSelected.id
                }, {
                        type: 'statusUpdated',
                        comment: opts.comment,
                        obj: opts.statusSelected
                    }
                ).then(derivationUpdated => {
                    $mdToast.showSimple('Estado de la derivación actualizado correctamente');
                    vm.derivation.status = opts.statusSelected;
                });
            }, () => { });
        };

        vm.editToEstablishment = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/derivation/derivationDetails/dialog.toEstablishment.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.derivation);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    derivation: _.pick(vm.derivation, ['id', 'toEstablishment', 'toUnit']),
                },
                multiple: true
            }).then(derivation => {
                $derivationFactory.update({
                    id: derivation.id,
                    toEstablishment: derivation.toEstablishment.id,
                    toUnit: derivation.toUnit.id
                }, { type: 'toEstablishmentUpdated' }).then(() => { });
            }, () => { });
        };

        vm.editFromEstablishment = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/derivation/derivationDetails/dialog.fromEstablishment.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.derivation);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    derivation: _.pick(vm.derivation, ['id', 'fromEstablishment', 'fromUnit']),
                },
                multiple: true
            }).then(derivation => {
                $derivationFactory.update({
                    id: derivation.id,
                    fromEstablishment: derivation.fromEstablishment.id,
                    fromUnit: derivation.fromUnit.id
                }, { type: 'fromEstablishmentUpdated' }).then(() => { });
            }, () => { });
        };

        vm.showPatientDetails = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/derivation/derivationDetails/dialog.patientDetails.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.derivation);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    derivation: _.pick(vm.derivation, ['patient']),
                },
                multiple: true
            }).then(derivation => {
                debugger;
            }, () => { });
        };

        let onSocketMessage = (event) => {
            let { id, data } = event;
            if (id === vm.idDerivation) {
                _.extend(vm.derivation, data.derivation);
                $scope.$apply();
            }
        };
        io.socket.on('derivation', onSocketMessage);
        $scope.$on('$destroy', () => {
            $derivationFactory.unsubscribe(vm.idDerivation);
            io.socket.off('derivation', onSocketMessage)
        });

        vm.sendComment = (comment) => new Promise((resolve, reject) => {
            comment.idModelModule = vm.idDerivation;
            comment.modelModule = 'derivation';
            $derivationFactory.addComment(comment).then(resolve, reject);
        });
    }
})();