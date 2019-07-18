(() => {
    'use strict';
    /**
     * Example
     * <ssvq-permission-list></ssvq-permission-list>
     */
    app.directive('ssvqPermissionList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                type: '@',
                filter: '=',
                count: '=',
                permissionList: '=permissions'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/permission/permissionList/permissionList.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $state, $permissionFactory) {
        var vm = this;
        vm.loading = false;
        vm.page = 1;
        
        // Se identifica la vista actual
        let currentView = $state.current.name.split('.').pop();
        vm.viewSupervisor = currentView === 'permission-supervision' || currentView === 'permission-closure';
        var getPermissions = vm.viewSupervisor ? $permissionFactory.getSupervised : $permissionFactory.getSent;

        let getList = () => {
            vm.loading = true;
            getPermissions({
                filter: _.extend({}, vm.filter, { type: vm.type }),
                page: vm.page
            }).then(
                response => {
                    vm.permissionList = _.concat(vm.permissionList || [], response.permissions);
                    vm.count = response.count || 0;
                    vm.showMoreButton = vm.count > vm.permissionList.length;
                    vm.loading = false;
                },
                (err) => {
                    vm.permissionList = [];
                    vm.count = 0;
                    vm.loading = false;
                    console.log('Error obteniendo eventos' + err)
                }
            );
        };

        vm.nextPage = () => {
            vm.page++;
            getList();
        };

        $scope.$watch(
            () => { return vm.filter; },
            (filter, oldFilter) => {
                if (!_.isEmpty(filter) || filter !== oldFilter) {
                    vm.page = 1;
                    vm.permissionList = null;
                    getList();
                }
            },
            true
        );


    }
})();