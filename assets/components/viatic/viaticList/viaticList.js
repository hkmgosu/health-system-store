(() => {
    'use strict';
    /**
     * Example
     * <ssvq-viatic-list></ssvq-viatic-list>
     */
    app.directive('ssvqViaticList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                type: '@',
                filter: '=',
                count: '=',
                viaticList: '=viatics'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/viatic/viaticList/viaticList.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $state, $viaticFactory) {
        var vm = this;
        vm.loading = false;
        vm.page = 0;

        // Se identifica la vista actual
        let currentView = $state.current.name.split('.').pop();
        vm.viewSupervisor = currentView === 'viatic-supervision' || currentView === 'viatic-closure';
        var getViatics = vm.viewSupervisor ? $viaticFactory.getSupervised : $viaticFactory.getSent;


        vm.nextPage = () => new Promise((resolve, reject) => {
            vm.page++;
            getViatics({
                filter: _.extend({}, vm.filter, { type: vm.type }),
                page: vm.page
            }).then(response => {
                vm.viaticList = _.concat(vm.viaticList || [], response.viatics);
                vm.count = response.count || 0;
                !_.isEmpty(response.viatics) ? resolve() : reject();
            }, () => reject());
        });

        $scope.$watch(
            () => { return vm.filter; },
            (filter, oldFilter) => {
                if (!_.isEmpty(filter) || filter !== oldFilter) {
                    vm.page = 0;
                    vm.count = 0;
                    vm.viaticList = undefined;
                    vm.nextPage().then(() => { }, () => { });
                }
            },
            true
        );
    }
})();