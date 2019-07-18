(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-list-filter></ssvq-adverse-event-list-filter>
     */
    app.directive('ssvqAdverseEventListFilter', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                filter: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventListFilter/adverseEventListFilter.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $state, employeeFactory, adverseEventFactory, $dateRangeSelectorDialog) {
        var vm = this;
        let defaultFilter = {
            patient: null,
            eventType: null,
            occurrenceService: null,
            damageType: null,
            minDate: null,
            maxDate: null,
            supervisedEstablishment: [],
            supervisedUnit: []
        };
        
        vm.closeFilterOpen = () => vm.filterOpened = null;
        vm.damageCategories = adverseEventFactory.getDamageCategories();
        vm.showCreatedAtFilter = ($event) => {
            $dateRangeSelectorDialog
                .showDialog($event, { fromDate: vm.filter.minDate, toDate: vm.filter.maxDate })
                .then(dates => {
                    vm.filter.minDate = dates.fromDate;
                    vm.filter.maxDate = dates.toDate;
                })
                .catch(() => {});
        };

        vm.selectDamageCategory = (selected) => {
            var select = JSON.parse(selected);
            vm.filter.damageType = select.ids;
            vm.categoryDamage = select.name;
            vm.closeFilterOpen();
        };

        vm.selectOcurrence = (selected) => {
            vm.filter.occurrenceService = selected;
            vm.closeFilterOpen();
        };

        (vm.cleanFilters = () => {
            vm.filter = angular.copy(defaultFilter);
        })();

        vm.status = $state.current.name.split('.').pop();

        // Obtener unidades supervisadas para filtrar
        if (vm.status === 'adverse-event-supervision') {
            employeeFactory.getAdverseEventSupervised().then(
                supervised => {
                    vm.supervisedUnit = supervised.adverseEventUnitSupervised;
                    vm.supervisedEstablishment = supervised.adverseEventEstablishmentSupervised;
                    vm.supervisedEstablishmentIds = _.map(vm.supervisedEstablishment, 'id');
                },
                reason => console.log('Error obteniendo supervisiones', reason)
            );

            /**
             * Agregar filtro por unidades supervisadas
             */
            $scope.$watch('vm.supervisedUnit', supervised => {
                if (supervised && supervised.length > 0) {
                    angular.extend(vm.filter, {
                        supervisedUnit: _.map(_.filter(supervised, 'checked'), 'id')
                    });
                }
            }, true);

            /**
             * Agregar filtro por establecimientos supervisados
             */
            $scope.$watch('vm.supervisedEstablishment', supervised => {
                if (supervised && supervised.length > 0) {
                    angular.extend(vm.filter, {
                        supervisedEstablishment: _.map(_.filter(supervised, 'checked'), 'id')
                    });
                }
            }, true);
        }
    }
})();