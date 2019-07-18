(function () {
    'use strict';
    /**
     * Example
     * <ssvq-permission-list-view></ssvq-permission-list-view>
     */
    app.directive('ssvqPermissionListView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/permission/permissionListView/permissionListView.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $permissionFactory, $workflowFactory, $state, $mdToast, $mdSidenav) {
        var vm = this;

        /**
         * Obtener lista de tipos de permiso
         */
        $permissionFactory.getPermissionTypeList().then(
            permissionTypeList => vm.permissionTypeList = permissionTypeList || []
        );

        vm.toggleFilter = () => {
            $mdSidenav('permission-filter').toggle();
        };

        /**
         * Abrir vista para crear nuevo permiso
         */
        vm.showSaveDialog = ($event) => {
            $workflowFactory.canCreate().then(() => {
                $mdDialog.show({
                    targetEvent: $event,
                    clickOutsideToClose: true,
                    templateUrl: '/components/permission/permissionListView/dialog.new.html',
                    controller:
                        /* @ngInject */
                        function DialogController($mdDialog, $scope, $timeout) {
                            var vm = this;

                            // Opciones que podría tener seleccionado un día del calendario
                            let defaultItemOptions = [
                                { label: 'Día', quantity: 1, measure: 'day' },
                                { label: 'Medio día (am)', quantity: 0.5, schedule: 'am', measure: 'day' },
                                { label: 'Medio día (pm)', quantity: 0.5, schedule: 'pm', measure: 'day' },
                                { label: 'Seleccionar horas', measure: 'hour', schedule: '', quantity: 1 },
                                { label: 'Sin seleccionar' }
                            ];

                            // Opciones del calendario, antes de seleccionar un tipo de permiso
                            vm.calendarOptions = null;

                            vm.onTypeChanged = (type) => {
                                // Si el tipo de permiso no es "Tiempo compensatorio" se omite la opción "Horas"
                                let itemOptions = (type !== 5) ? _.filter(defaultItemOptions, option => option.measure != 'hour') : defaultItemOptions;
                                vm.itemOptions = itemOptions.map((opt, index) => {
                                    return Object.assign(opt, { index: index + 1 });
                                });

                                // Opciones generales del calendario
                                vm.calendarOptions = {
                                    watchUntilDate: type !== 1,
                                    watchDuration: type === 1,
                                    editMode: type !== 1
                                };

                                // Se resetean los valores del permiso
                                Object.assign(vm.permission, {
                                    detailsDay: null,
                                    fromDate: null,
                                    untilDate: null,
                                    duration: null
                                });
                            };

                            vm.onFromDateChanged = (fromDate) => {
                                if ((!vm.permission.untilDate || (vm.permission.fromDate > vm.permission.untilDate)) && vm.calendarOptions.watchUntilDate) {
                                    vm.permission.untilDate = angular.copy(fromDate);
                                }
                            };

                            vm.onUntilDateChanged = (untilDate) => {
                                if ((!vm.permission.fromDate || (vm.permission.fromDate > vm.permission.untilDate))) {
                                    vm.permission.fromDate = angular.copy(untilDate);
                                }
                            };


                            var timeoutPromise;
                            $scope.$watch('vm.permission.detailsDay', days => {
                                if (_.isEmpty(days)) { return; }
                                $timeout.cancel(timeoutPromise);
                                timeoutPromise = $timeout(function () {
                                    vm.formDisabled = !_.some(days, day => day.value && day.value.quantity);
                                }, 600);
                            }, true);

                            vm.close = () => $mdDialog.cancel();
                            vm.save = () => $mdDialog.hide(vm.permission);
                        },
                    controllerAs: 'vm',
                    bindToController: true,
                    locals: {
                        permissionTypeList: vm.permissionTypeList
                    }
                }).then(permission => {
                    $permissionFactory.create(permission).then(permission => {
                        $state.go('triangular.mi-ssvq.permission-details', {
                            id: permission.id,
                            permission: Object.assign(permission, { owner: employee })
                        });
                    }).catch(err => {
                        console.log(err);
                        $mdToast.showSimple('Ha ocurrido un error: ' + err);
                    });
                });
            }, err => {
                $mdDialog.show(
                    $mdDialog.alert({
                        title: 'Alerta',
                        textContent: err || 'No puedes realizar una solicitud de permiso',
                        ok: 'Aceptar',
                        targetEvent: $event
                    })
                );
            });
        };
    }
})();