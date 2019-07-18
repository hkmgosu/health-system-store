(function () {
    'use strict';
    /**
     * Example
     * <ssvq-permission-item permission=""></ssvq-permission-item>
     */
    app.directive('ssvqPermissionItem', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                permission: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/permission/permissionItem/permissionItem.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();