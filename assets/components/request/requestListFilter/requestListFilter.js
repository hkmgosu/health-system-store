(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-list-filter filter=""></ssvq-request-list-filter>
     */
    app.directive('ssvqRequestListFilter', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                filter: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestListFilter/requestListFilter.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, employeeFactory, localStorageService) {
        var vm = this;
        let defaultFilter = {
            searchText: '',
            createdBy: null,
            employeeAssigned: null,
            minDate: null,
            maxDate: null,
            supervisedUnits: []
        };
        vm.filter = Object.assign({}, defaultFilter, { mode: 'subscribed' }, localStorageService.get('requestFilter'));

        //Limpiar filtros
        vm.cleanFilters = () => {
            vm.supervisedUnits ? vm.supervisedUnits.forEach(unit => unit.checked = false) : null;
            vm.filter = Object.assign({}, defaultFilter, { mode: vm.filter.mode });
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

        vm.selectMeAsEmployeeAssigned = () => {
            vm.filter.employeeAssigned = employee;
        };
        vm.selectMeAsCreatedBy = () => {
            vm.filter.createdBy = employee;
        };

        vm.cleanFilterOpened = () => {
            vm.filterOpened = '';
        };

        // Obtener unidades supervisadas para filtrar
        employeeFactory.getSupervisedUnits(employee.id).then(
            supervisedUnits => vm.supervisedUnits = supervisedUnits.map(unit => {
                unit.checked = vm.filter.supervisedUnits.includes(unit.id);
                return unit;
            }),
            reason => console.log('Error obteniendo unidades supervisadas', reason)
        );
        /**
         * Agregar filtro por unidades supervisadas
         */
        $scope.$watch('vm.supervisedUnits', supervisedUnits => {
            if (supervisedUnits) {
                angular.extend(vm.filter, {
                    supervisedUnits: _.map(_.filter(supervisedUnits, 'checked'), 'id')
                });
            }
        }, true);

        $scope.$watch('vm.filter', filter => {
            if (filter) {
                localStorageService.set('requestFilter', filter);
                vm.filterCleaned = _.isEmpty(vm.filter.employeeAssigned) &&
                    _.isEmpty(vm.filter.createdBy) &&
                    _.isEmpty(vm.filter.minDate) &&
                    _.isEmpty(vm.filter.maxDate) &&
                    _.isEmpty(vm.filter.supervisedUnits) &&
                    _.isEmpty(vm.filter.searchText);
            }
        }, true);
    }
})();