(function () {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-list-view></ssvq-adverse-event-list-view>
     */
    app.directive('ssvqAdverseEventListView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventListView/adverseEventListView.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdSidenav, $state, $adverseEventDialog, adverseEventFactory) {
        var vm = this;
        vm.toggleFilter = () => {
            $mdSidenav('event-filter').toggle();
        };

        vm.showNewEvent = ($event, anonimo) => {
            $adverseEventDialog
                .show($event, undefined, anonimo);
        };

        if ($state.current.name.split('.').pop() === 'adverse-event-supervision') vm.viewSupervisor = true;

        (() => {
            adverseEventFactory
                .getValidEstablishment()
                .then(response => {
                    vm.availableEstablishment = response.obj.valid;
                }, err => {
                    vm.availableEstablishment = false;
                });
        })();
    }
})();