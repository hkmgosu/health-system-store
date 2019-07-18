(function () {
    'use strict';
    /**
     * Example
     * <ssvq-vehicle-autocomplete selected=""></ssvq-vehicle-autocomplete>
     */
    app.directive('ssvqVehicleAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                selected: '=',
                onSelect: '&?',
                label: '@?',
                type: '@?', // search | input
                isDisabled: '@?',
                statusType: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: (elem, attr) => {
                return '/components/vehicle/vehicleAutocomplete/vehicleAutocomplete' + (attr.type === 'search' ? 'Search' : 'Input') + '.html';
            }
        };
    });

    /* @ngInject */
    function ComponentController($q) {
        var vm = this;
        vm.label = vm.label || 'Vehículo';
        vm.getMatches = searchText => {
            var deferred = $q.defer();
            io.socket.post('/vehicle/getAutocomplete', {
                searchText: searchText,
                statusType: vm.statusType
            }, function (data) {
                if (data.ok) {
                    deferred.resolve(data.obj || []);
                } else {
                    deferred.resolve([]);
                }
            });
            return deferred.promise;
        };
        vm.myOnSelect = selected => {
            if (selected) {
                vm.onSelect()(selected);
            }
        };
    }
})();