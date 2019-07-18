(function () {
    'use strict';
    /**
     * Example
     * <ssvq-viatic-list-view></ssvq-viatic-list-view>
     */
    app.directive('ssvqViaticListView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/viatic/viaticListView/viaticListView.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $viaticFactory, $workflowFactory, $state, $mdToast) {
        var vm = this;

        /**
         * Abrir vista para crear nuevo viático
         */
        vm.showSaveDialog = $event => {
            $workflowFactory.canCreate().then(() => {
                $mdDialog.show({
                    targetEvent: $event,
                    clickOutsideToClose: true,
                    templateUrl: '/components/viatic/viaticListView/dialog.new.html',
                    controller: DialogController,
                    controllerAs: 'vm',
                    locals: {}
                }).then(viatic => {
                    // Limpiar días sin seleccionar
                    _.remove(viatic.daysDetails, { type: '' });

                    $viaticFactory.create(viatic).then(viatic => {
                        $state.go('triangular.mi-ssvq.viatic-details', {
                            id: viatic.id,
                            viatic: viatic
                        });
                    }, () => $mdToast.showSimple('Ha ocurrido un error ingresando el viático'));
                });
            }, err => {
                $mdDialog.show(
                    $mdDialog.alert({
                        title: 'Alerta',
                        textContent: err || 'No puedes realizar una solicitud de viático',
                        ok: 'Aceptar',
                        targetEvent: $event
                    })
                );
            });
        };
    }
    /* @ngInject */
    function DialogController($scope, $mdDialog, $timeout, $viaticFactory) {
        var vm = this;
        vm.cancel = () => $mdDialog.cancel();
        vm.save = () => $mdDialog.hide(vm.viatic);
        vm.transportTypeList = [{
            id: 1,
            name: "Bus"
        }, {
            id: 2,
            name: "Ferrocarril"
        }, {
            id: 3,
            name: "Avión"
        }, {
            id: 4,
            name: 'Vehículo propio',
        }, {
            id: 5,
            name: 'Vehículo SSVQ'
        }];
        vm.itemOptions = [
            { index: 1, label: 'Parcial', quantity: 0.5, value: 'midday', unity: 'day' },
            { index: 2, label: 'Diario', quantity: 1, value: 'day', unity: 'day' },
            { index: 3, label: 'Sin seleccionar' }
        ];

        vm.onFromDateChanged = fromDate => {
            if ((!vm.viatic.toDate || (fromDate > vm.viatic.toDate))) {
                vm.viatic.toDate = angular.copy(fromDate);
            }
        };

        vm.onToDateChanged = toDate => {
            if (!vm.viatic.fromDate || (vm.viatic.fromDate > toDate)) {
                vm.viatic.fromDate = angular.copy(toDate);
            }
        };

        vm.nextStep = () => {
            if (vm.initForm.$invalid) {
                vm.initForm.$submitted = true;
                vm.addressForm.$submitted = true;
            } else {
                $scope.ssvqWizard.currentStep = 1;
            }
        };

        $viaticFactory.getTypeList().then(typeList => vm.typeList = typeList, () => { });

        // Opciones generales del calendario
        vm.calendarOptions = {
            watchUntilDate: true,
            editMode: true
        };

        vm.opts = { required: true };

        vm.calendarExtraData = {};
        vm.formDisabled = true;

        var timeoutPromise;
        $scope.$watch('vm.viatic.daysDetails', days => {
            if (_.isEmpty(days)) { return; }
            $timeout.cancel(timeoutPromise);
            timeoutPromise = $timeout(function () {
                Object.assign(vm.viatic, {
                    completeDayQuantity: _.filter(days, day => day.value && day.value.label === 'Diario').length,
                    partialDayQuantity: _.filter(days, day => day.value && day.value.label === 'Parcial').length
                });

                if (vm.viatic.completeDayQuantity === 0 && vm.viatic.partialDayQuantity === 0) {
                    vm.formDisabled = true;
                } else {
                    vm.formDisabled = false;
                }
            }, 600);
        }, true);
    }
})();