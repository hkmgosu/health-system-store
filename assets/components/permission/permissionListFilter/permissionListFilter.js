(() => {
    'use strict';
    /**
     * Example
     * <ssvq-permission-list-filter filter=""></ssvq-permission-list-filter>
     */
    app.directive('ssvqPermissionListFilter', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                filter: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/permission/permissionListFilter/permissionListFilter.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $state, $workflowFactory) {
        var vm = this;
        let defaultFilter = {
            searchText: '',
            createdBy: null,
            minDate: null,
            maxDate: null,
            status: []
        };
        vm.filter = angular.copy(defaultFilter);

        vm.status = $state.current.name.split('.').pop();

        //Limpiar filtros
        vm.cleanFilters = () => {
            vm.workflowStatus ? vm.workflowStatus.forEach(status => status.checked = false) : null;
            vm.filter = angular.copy(defaultFilter);
        };

        $scope.$on("$destroy", () => {
            $(document).unbind('keyup.permissionFilter');
        });

        $(document).on('keyup.permissionFilter', e => {
            if (e.keyCode === 27) {
                vm.filterOpened = null;
                $scope.$apply();
            }
        });

        // Mostrar filtro de fecha creación
        vm.showCreatedAtFilter = ($event) => {
            let applyFilter = filter => {
                _.extend(vm.filter, filter);
            };
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/permission/permissionListFilter/dialog.createdAt-filter.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog, applyFilter) {
                        var vm = this;
                        vm.applyFilter = () => {
                            applyFilter(vm.filter);
                            $mdDialog.hide();
                        };
                        vm.cancel = () => {
                            $mdDialog.hide();
                        };
                    },
                controllerAs: 'vm',
                locals: {
                    applyFilter: applyFilter
                }
            });
        };

        vm.selectMeAsCreatedBy = () => {
            vm.filter.createdBy = employee;
        };

        $workflowFactory.getStatus('permission', true)
            .then(result => {
                vm.workflowStatus = result.status;
            })
            .catch(err => {
                console.log(err);
                vm.workflowStatus = [];
            });


        /**
             * Agregar filtro por unidades supervisadas
             */
        $scope.$watch('vm.workflowStatus', status => {
            if (status) {
                angular.extend(vm.filter, {
                    status: _.map(_.filter(status, 'checked'), 'id')
                });
            }
        }, true);

    }
})();