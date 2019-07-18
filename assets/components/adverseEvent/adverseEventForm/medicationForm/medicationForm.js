(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-medication-form></ssvq-adverse-event-medication-form>
     */
    app.directive('ssvqAdverseEventMedicationForm', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '=',
                damageType: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventForm/medicationForm/medicationForm.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, adverseEventFactory) {
        var vm = this;
        var damageCategorization = adverseEventFactory.getDamageCategorization();
        if ((vm.data || {}).via) vm.data.via = vm.data.via.id;
        var filterOptions = () => {
            if (_.indexOf(damageCategorization.incident, vm.damageType) >= 0) {
                vm.parametrics.eventConsequences = [];
            }
        }

        (() => {
            adverseEventFactory
                .getAllParametricsMedicationForm()
                .then(
                    data => {
                        vm.parametrics = data;
                        filterOptions();
                    }
                )
                .catch(
                    err => {
                        console.log(err);
                        vm.parametrics = [];
                    }
                );
        })();

        vm.getMatches = (filter, nameParametric) => {
            var promise = adverseEventFactory.getParametricsAutocomplete(filter, nameParametric)
                .then(response => {
                    return (response.obj || {}).parametrics || [];
                }, err => {
                    console.log(err);
                    return [];
                });
            return promise;
        };
    }
})();