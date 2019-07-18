(() => {
    'use strict';
    /**
      * Example
      * <ssvq-viatic-list-filter></ssvq-viatic-list-filter>
      */
    app.directive('ssvqViaticListFilter', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { filter: '=' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/viatic/viaticListFilter/viaticListFilter.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $state, $viaticFactory) {
        var vm = this;
        let defaultFilter = {
            searchText: '',
            createdBy: null,
            status: null,
            employeeAssigned: null,
            minDate: null,
            maxDate: null,
            supervisedUnits: []
        };
        vm.filter = angular.copy(defaultFilter);

        vm.status = $state.current.name.split('.').pop();

        //Limpiar filtros
        vm.cleanFilters = () => {
            vm.supervisedUnits ? vm.supervisedUnits.forEach(unit => unit.checked = false) : null;
            vm.filter = angular.copy(defaultFilter);
        };

        $scope.$on("$destroy", function () {
            $(document).unbind('keyup.requestFilter');
        });

        $(document).on('keyup.requestFilter', e => {
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
                templateUrl: '/components/request/requestListFilter/dialog.createdAt-filter.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog, applyFilter) {
                        var vm = this;
                        vm.applyFilter = function () {
                            applyFilter(vm.filter);
                            $mdDialog.hide();
                        };
                        vm.cancel = function () {
                            $mdDialog.hide();
                        };
                    },
                controllerAs: 'vm',
                locals: {
                    applyFilter: applyFilter
                }
            });
        };

        $viaticFactory.getStatusList().then(statusList => {
            vm.statusList = statusList;
        });

        vm.selectMeAsEmployeeAssigned = () => {
            vm.filter.employeeAssigned = employee;
        };
        vm.selectMeAsCreatedBy = () => {
            vm.filter.createdBy = employee;
        };

        vm.cleanFilterOpened = () => {
            vm.filterOpened = '';
        };
    }
})();