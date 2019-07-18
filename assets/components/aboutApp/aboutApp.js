(function () {
    'use strict';
    /**
     * Example
     * <ssvq-view-about-app></ssvq-view-about-app>
     */
    app.directive('ssvqViewAboutApp', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/aboutApp/aboutApp.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();