(() => {
    'use strict';
    /**
     * Example
     * <ssvq-permission-details-sidebar employee=""></ssvq-permission-details-sidebar>
     */
    app.directive('ssvqPermissionDetailsSidebar', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                employee: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/permission/permissionDetailsSidebar/permissionDetailsSidebar.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdToast, $mdDialog, $translate, $location, $stateParams) {
        var vm = this;
    }
})();
