(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-occurrence></ssvq-adverse-event-occurrence>
     */
    app.directive('ssvqAdverseEventOccurrence', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventDialog/adverseEventOccurrence/adverseEventOccurrence.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, adverseEventFactory) {
        var vm = this;
        vm.completed;
        vm.data = vm.data || {};
        vm.occurrForm = $scope.$parent.occurrForm;
        vm.min = moment.utc().subtract(2, 'year').format('YYYY-MM-DD');
        vm.max = moment.utc().format('YYYY-MM-DD');
        var establishment = (vm.data.establishment || {}).id;
        vm.intrahospitalId = adverseEventFactory.getIntrahospitalId();

        vm.isIntrahospital = () => {
            let is = vm.data.originOccurrence == vm.intrahospitalId;
            if (!is) vm.data.occurrenceService = undefined;
            return is;
        };

        (() => {
            adverseEventFactory
                .getOriginOccurrence()
                .then(
                    data => vm.occurrenceOrigins = data,
                    err => {
                        vm.occurrenceOrigins = [];
                        console.log(err);
                    }
                );
            adverseEventFactory
                .getUnitsEvents(establishment)
                .then(
                    data => {
                        vm.units = data.units;
                        vm.data.occurrenceService = (vm.data.occurrenceService || {}).id || undefined;
                        vm.data.reportService = (vm.data.reportService || {}).id || undefined;
                        vm.data.originOccurrence = (vm.data.originOccurrence || {}).id || vm.intrahospitalId;
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