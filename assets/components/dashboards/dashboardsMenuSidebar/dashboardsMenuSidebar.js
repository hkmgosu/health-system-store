(function () {
    'use strict';
    /**
     * Example
     * <ssvq-dashboards-menu-sidebar></ssvq-dashboards-menu-sidebar>
     */
    app.directive('ssvqDashboardsMenuSidebar', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/dashboards/dashboardsMenuSidebar/dashboardsMenuSidebar.html'
        };
    });

    /* @ngInject */
    function ComponentController(triLayout, triSettings) {
        var vm = this;
        vm.layout = triLayout.layout;
        vm.toggleIconMenu = function toggleIconMenu() {
            var menu = (vm.layout.sideMenuSize === 'icon' ? 'full' : 'icon');
            triLayout.setOption('sideMenuSize', menu);
        };
        vm.triSettings = triSettings;
    }
})();