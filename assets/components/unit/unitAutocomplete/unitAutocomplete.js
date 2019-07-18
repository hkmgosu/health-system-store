(function () {
    'use strict';
    /**
     * Example
     * <ssvq-unit-autocomplete unit=""></ssvq-unit-autocomplete>
     */
    app.directive('ssvqUnitAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                clearOnSelect: '=',
                onSelect: '&?',
                selected: "=",
                establishment: "=?",
                required: "=",
                filterSupervised: "=",
                filter: '=',
                minLength: '@?',
                label: '@?',
                type: '@?',
                myEstablishment: '@?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: (elem, attr) => {
                return '/components/unit/unitAutocomplete/unitAutocomplete' + (attr.type === 'search' ? 'Search' : 'Input') + '.html';
            }
        };
    });

    /* @ngInject */
    function ComponentController($q) {
        var vm = this;
        angular.merge(vm, {
            /* Variables */
            searching: false,
            resultCount: -1,
            /* Métodos*/
            getMatches: function () {
                var deferred = $q.defer();
                vm.searching = true;
                let url = vm.filterSupervised ? '/unit/getAvailableToRequest' : '/unit/getAutocomplete';
                io.socket.post(url, {
                    searchText: '',
                    filter: vm.filter || {},
                    establishment: vm.establishment,
                    populate: true,
                    filterSupervised: vm.filterSupervised || false,
                    myEstablishment: vm.myEstablishment === 'true'
                }, function (data) {
                    vm.resultCount = 0;
                    if (data.ok) {
                        vm.resultCount = data.obj.units.length;
                        deferred.resolve(data.obj.units);
                    } else {
                        deferred.resolve([]);
                    }
                    vm.searching = false;
                });
                return deferred.promise;
            },
            localOnSelect: (selected) => {
                if (vm.onSelect && selected) {
                    vm.onSelect()(selected);
                }
                if (vm.clearOnSelect && selected) {
                    vm.filter.searchText = '';
                    vm.selected = undefined;
                }
            }
        });
    }
})();