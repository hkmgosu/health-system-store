(function () {
    'use strict';
    /**
     * Example
     * <ssvq-resource-maintainer-filter filter=""></ssvq-resource-maintainer-filter>
     */
    app.directive('ssvqResourceMaintainerFilter', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                onChange: '&?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/resourceMaintainer/resourceMaintainerFilter/resourceMaintainerFilter.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, employeeFactory, unitFactory, establishmentFactory, $resourceFactory, $timeout) {
        var vm = this;

        let tmpSelected = {
            searchText: '',
            employees: [],
            establishment: [],
            units: [],
            status: [],
            type: []
        };

        /**
         * Filtro por funcionario
         */
        vm.filterEmployee = {
            getItems: searchText => employeeFactory.getList({ filter: searchText })
        };
        /**
         * Filtro por unidad
         */
        vm.filterUnit = {
            getItems: searchText => unitFactory.get({ filter: searchText })
        };
        /**
         * Filtro por establecimiento
         */
        vm.filterEstablishment = {
            getItems: searchText => establishmentFactory.get({ name: { contains: searchText } })
        };
        /**
         * Filtro por estado
         */
        vm.filterStatus = {
            getItems: () => new Promise((resolve, reject) => {
                async.setImmediate(() => resolve(vm.resourceStatusList || []))
            })
        };
        /**
         * Filtro por tipo
         */
        vm.filterType = {
            getItems: () => new Promise((resolve, reject) => {
                async.setImmediate(() => resolve(vm.resourceTypeList || []))
            })
        };

        var timeoutPromise;
        $scope.$watch('vm.selected', selected => {
            if (_.isEmpty(selected)) { return; }
            $timeout.cancel(timeoutPromise);
            timeoutPromise = $timeout(function () {
                vm.onChange()({
                    searchText: selected.searchText,
                    currentEmployee: _.map(selected.employees, 'id'),
                    unit: _.map(selected.units, 'id'),
                    establishment: _.map(selected.establishment, 'id'),
                    status: _.map(selected.status, 'id'),
                    type: _.map(selected.type, 'id')
                });
            }, 1000);
        }, true);

        vm.cleanFilters = () => vm.selected = angular.copy(tmpSelected);

        /**
         * Obtener lista de estados
         */
        $resourceFactory.getResourceStatusList().then(resourceStatusList => {
            resourceStatusList.forEach(resourceStatus => resourceStatus.wanted = true);
            vm.resourceStatusList = resourceStatusList;
        });

        /**
         * Obtener tipos de recurso
         */
        $resourceFactory.getResourceTypeList().then(resourceTypeList =>
            vm.resourceTypeList = resourceTypeList
        );

        // Init
        vm.selected = angular.copy(tmpSelected);
    }
})();