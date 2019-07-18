(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-list-item></ssvq-adverse-event-list-item>
     */
    app.directive('ssvqAdverseEventListItem', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                event: '=',
                target: '@'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventListItem/adverseEventListItem.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
        vm.formatDate = date => { return moment(date).format('LLL'); };
        vm.target = vm.target === 'true';

        vm.getColor = category => {
            switch (category) {
                case 'Incidente sin daño':
                    return '#93c47d';
                case 'Evento adverso':
                    return '#ffd966';
                case 'Evento centinela':
                    return '#ea9999';
                default:
                    return '#ccc';
            }
        };
    }
})();