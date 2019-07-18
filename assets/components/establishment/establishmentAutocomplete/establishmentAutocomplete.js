(function () {
    'use strict';
    /**
     * Example
     * <ssvq-establishment-autocomplete selected=""></ssvq-establishment-autocomplete>
     */
    app.directive('ssvqEstablishmentAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                selected: '=',
                onSelect: '&?',
                filter: '=',
                required: "=",
                label: '@?',
                type: '@?', // search | input  
                locals: '=', // []
                opts: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: (elem, attr) => {
                return '/components/establishment/establishmentAutocomplete/establishmentAutocomplete' + (attr.type === 'search' ? 'Search' : 'Input') + '.html';
            }
        };
    });

    /* @ngInject */
    function ComponentController($scope, establishmentFactory) {
        var vm = this;
        angular.merge($scope, {
            /* Variables */
            searching: false,
            resultCount: -1,
            searchText: '',
            /* Métodos*/
            getMatches: (searchText) => new Promise((resolve, reject) => {
                if (!_.isEmpty(vm.locals)) {
                    async.setImmediate(() => resolve(vm.locals));
                } else {
                    establishmentFactory.get(
                        _.extend(vm.filter || {}, { name: { contains: searchText } })
                    ).then(resolve, reject);
                }
            })
        });
        vm.localOnSelect = selected => vm.onSelect ? vm.onSelect()(selected) : null;
    }
})();