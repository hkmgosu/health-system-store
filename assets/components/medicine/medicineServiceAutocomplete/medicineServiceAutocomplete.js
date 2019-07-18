(function () {
    'use strict';
    /**
     * Example
     * <ssvq-medicine-service-autocomplete></ssvq-medicine-service-autocomplete>
     */
    app.directive('ssvqMedicineServiceAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                medicine: '=',
                requiredOption: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/medicine/medicineServiceAutocomplete/medicineServiceAutocomplete.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, medicineFactory) {
        var vm = this;

        if (_.isInteger(vm.medicine)) {
            medicineFactory.getMedicineServiceByIds(vm.medicine)
                .then((response) => {
                    if (response.ok) {
                        vm.medicine = response.obj[0];
                    }
                }, (err) => {
                    console.log(err);
                });
        }

        vm.getMatches = (searchText) => {
            return medicineFactory.getMedicineService({ filter: searchText })
                .then((response) => {
                    if (response.ok) {
                        return response.obj.medicines;
                    } else {
                        return [];
                    }
                }, (err) => {
                    console.log(err);
                    return [];
                });
        };
    }

})();