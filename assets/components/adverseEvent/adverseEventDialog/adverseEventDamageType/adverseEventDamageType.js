(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-damage-type></ssvq-adverse-event-damage-type>
     */
    app.directive('ssvqAdverseEventDamageType', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '=',
                relatedToPatients: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventDialog/adverseEventDamageType/adverseEventDamageType.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, adverseEventFactory) {
        var vm = this;
        vm.damageTypeForm = $scope.$parent.damageTypeForm;

        vm.selectOption = (id, cleanEvent = true) => {
            vm.data.damageType = id;
            if (vm.data.eventType && cleanEvent) {
                vm.data.eventType = undefined;
            }
        };

        vm.customFilter = item => {
            if (vm.relatedToPatients) return item;
            else if (!item.relatedToPatients) return item;
        };

        (() => {
            adverseEventFactory
                .getAllDamageType()
                .then(
                    data => {
                        vm.damageTypes = data.damageTypes;
                        if ((vm.data.damageType || {}).id) vm.selectOption(vm.data.damageType.id, false);
                        vm.completed = true;
                    }
                )
                .catch(
                    err => {
                        console.log(err);
                    }
                );
        })();

    }
})();