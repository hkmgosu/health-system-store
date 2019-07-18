(() => {
    'use strict';
    /**
     * Example
     * <ssvq-storage-report-autocomplete></ssvq-storage-report-autocomplete>
     */
    app.directive('ssvqStorageReportAutocomplete', function() {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                label: "@",
                selected: "=",
                onSelect: "&?",
                clearSearch: "@",
                productType: '=?',
                units: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/report/reportAutocomplete/reportAutocomplete.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, productFactory, unitProductsManagerFactory) {
        var vm = this;
        window.vmc = this;

        vm.searchText = '';
        vm.products = [];

        // requerido para imagen de producto
        vm.timestamp = product => moment((product || {}).updatedAt).format('X');

        // al seleccionar ejecuta la funcion por parametro vm.onSelect
        vm.onSelected = selected => {
            vm.selected = selected;
            vm.onSelect && vm.onSelect()(selected);
            if (vm.clearSearch) vm.searchText = '';
        };

        // obtengo los primeros 10 productos
        vm.timeSearch = null;
        vm.getMatches = (searchText) => {
            // if (!searchText) vm.onSelected(null);
            if (vm.timeSearch) clearTimeout(vm.timeSearch);

            vm.products = [];
            if (!vm.units || !vm.units.length) return;

            let criteriaProducts = {};
            criteriaProducts.page = 1;
            criteriaProducts.limit = 10;
            criteriaProducts.where = {};

            if (searchText) criteriaProducts.filter = searchText;
            if (vm.productType) criteriaProducts.where.productType = vm.productType;

            // solo productos en unidades seleccionadas
            let criteriaUnits = {};
            criteriaUnits.where = {};
            criteriaUnits.where.unit = vm.units || 0;

            return unitProductsManagerFactory.getAll(criteriaUnits)
                .then(obj => {
                    let idProducts = [];
                    obj.unitProductsManagers.forEach(el => {
                        if (idProducts.indexOf(el.product) == -1) {
                            idProducts.push(el.product);
                        }
                    });
                    criteriaProducts.where.id = idProducts;
                })
                .then(() => productFactory.getAll(criteriaProducts))
                .then(obj => vm.products = obj.products)
                // .then(() => console.log(vm.products))
                // .then(() => vm.products)
                .catch(err => $mdToast.showSimple('Error al consultar productos' + (console.error(err) || '')));
        }

        $scope.$watch('vm.searchText', () => {
            if (!vm.searchText) vm.onSelected(null);
        });
        $scope.$watch('vm.productType', () => {
            vm.selected = null;
            vm.getMatches(null);
        });
        $scope.$watchCollection('vm.units', () => {
            vm.selected = null;
            vm.getMatches(null);
        });
    }
})();