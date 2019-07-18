(function() {
    'use strict';
    /**
     * Example
     * <ssvq-product-autocomplete></ssvq-product-autocomplete>
     */
    app.directive('ssvqProductAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                label: "@",
                selected: "=",
                onSelect: "&?",
                clearSearch: "@",
                required: "@",
                disabled: "@",
                description: "=",
                productCode: "=",
                exclude: "=",
                productSearchText: "=",
                allowedOnly: "=",
                requestAllowedOnly: "=",
                productTypeSearch: "="
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/storage/product/productAutocomplete/productAutocomplete.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, productFactory) {
        var vm = this;
        vm.label = vm.label || 'Buscar producto';
        vm.required = vm.required || false;
        vm.disabled = vm.disabled || false;
        vm.searchText = '';
        vm.products = false;
        vm.validProductTypes = ["todos", "economato", "farmacia", "controlado", "nocontrolado"];


        // requerido para imagen de producto
        vm.timestamp = product => moment((product || {}).updatedAt).format('X');

        // al seleccionar ejecuta la funcion por parametro vm.onSelect
        vm.onSelected = selected => {
            vm.selected = selected;
            vm.onSelect ? vm.onSelect()(selected) : console.log("función onSelect no existe");
            if (vm.clearSearch) vm.searchText = null;
        };

        vm.getMatches = searchText => {
            let searchParams = {
                filter: searchText,
                limit: 15,
                allowedOnly: vm.allowedOnly,
                requestAllowedOnly: vm.requestAllowedOnly,
                productTypeSearch: typeof vm.productTypeSearch === 'undefined' ? "todos" : vm.productTypeSearch

            };
            return productFactory.getAllowedProducts(searchParams).then(
                obj => {
                    // si no existe exclucion, retorna todo
                    if (!vm.exclude) return obj.products;

                    // exclude los productos con id indicados en vm.exclude
                    let products = [];
                    for (let i = 0; i < obj.products.length; ++i) {
                        if (vm.exclude.indexOf(obj.products[i].id) == -1) {
                            products.push(obj.products[i]);
                        }
                    }
                    return products;
                },
                err => $mdToast.showSimple('No se pudo obtener los productos.' + (console.log(err) || ''))
            );
        }


        $scope.$watch("vm.searchText", searchText => vm.productSearchText = searchText);
    }
})();