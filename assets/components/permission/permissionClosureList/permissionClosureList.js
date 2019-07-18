(() => {
    'use strict';
    /**
     * Example
     * <ssvq-permission-closure-list></ssvq-permission-closure-list>
     */
    app.directive('ssvqPermissionClosureList', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/permission/permissionClosureList/permissionClosureList.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $permissionClosureFactory) {
        var vm = this;
        var page = 1;
        vm.closuresList = [];

        const getClosures = () => {
            $permissionClosureFactory.getClosures(page)
                .then(result => {
                    vm.closuresList = _.concat(vm.closuresList || [], result.closures);
                    vm.showMoreButton = result.count > vm.closuresList.length;
                })
                .catch(err => console.log(err));
        };

        vm.nextPage = () => {
            page++;
            getClosures();
        };

        getClosures();
    }
})();