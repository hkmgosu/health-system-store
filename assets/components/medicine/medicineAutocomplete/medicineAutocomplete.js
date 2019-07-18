(function () {
    'use strict';
    /**
     * Example
     * <ssvq-medicine-autocomplete></ssvq-medicine-autocomplete>
     */
    app.directive('ssvqMedicineAutocomplete', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                medicine: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/medicine/medicineAutocomplete/medicineAutocomplete.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, medicineFactory) {
        var vm = this;

        if (_.isInteger(vm.medicine)) {
            medicineFactory.getByIds(vm.medicine)
                .then((response) => {
                    if (response.ok) {
                        vm.medicine = response.obj[0];
                    }
                }, (err) => {
                    console.log(err);
                });
        }

        vm.getMatches = (searchText) => {
            return medicineFactory.get({ filter: searchText })
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