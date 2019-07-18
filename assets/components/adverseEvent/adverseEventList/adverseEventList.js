(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-list></ssvq-adverse-event-list>
     */
    app.directive('ssvqAdverseEventList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                finished: '=',
                rejected: '=',
                filter: '=',
                count: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventList/adverseEventList.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $state, adverseEventFactory) {
        var vm = this;
        vm.events = null;
        vm.loading = false;
        vm.page = 1;

        let status = $state.current.name.split('.').pop();
        let getEvents = (status === 'adverse-event') ? adverseEventFactory.getSent : adverseEventFactory.getSupervised;

        let getEvent = () => {
            vm.loading = true;
            getEvents({
                filter: _.extend({}, vm.filter, { finished: vm.finished, rejected: vm.rejected }),
                page: vm.page
            }).then(
                response => {
                    let events = response.events || [];
                    vm.showMoreButton = !(events.length < 10);
                    vm.events = _.concat(vm.events || [], events);
                    vm.count = response.count || 0;
                    vm.loading = false;
                },
                (err) => {
                    vm.count = 0;
                    vm.events = [];
                    vm.loading = false;
                    console.log('Error obteniendo eventos' + err)
                }
            );
        };

        vm.nextPage = () => {
            vm.page++;
            getEvent();
        };

        $scope.$watch(
            () => { return vm.filter; },
            (filter, oldFilter) => {
                if (!_.isEmpty(filter) || filter !== oldFilter) {
                    vm.page = 1;
                    vm.events = null;
                    getEvent();
                }
            },
            true
        );

    }
})();