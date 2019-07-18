(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-fall-form></ssvq-adverse-event-fall-form>
     */
    app.directive('ssvqAdverseEventFallForm', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '=',
                damageType: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventForm/fallForm/fallForm.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, adverseEventFactory) {
        var vm = this;
        var damageCategorization = adverseEventFactory.getDamageCategorization();
        var filterOptions = () => {
            if (_.indexOf(damageCategorization.incident, vm.damageType) >= 0) {
                vm.parametrics.eventConsequences = [];
            }
            if (_.indexOf(damageCategorization.adverse, vm.damageType) >= 0) {
                vm.parametrics.eventConsequences = _.filter(vm.parametrics.eventConsequences, obj => { return _.indexOf([1, 2, 3, 4, 5], obj.id) >= 0 });
            }
            if (_.indexOf(damageCategorization.sentinel, vm.damageType) >= 0) {
                vm.parametrics.eventConsequences = _.filter(vm.parametrics.eventConsequences, obj => { return _.indexOf([5, 6, 7, 8], obj.id) >= 0 });
            }
        }

        (() => {
            adverseEventFactory
                .getAllParametricsFallForm()
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