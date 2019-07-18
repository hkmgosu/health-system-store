(function () {
    'use strict';
    /**
     * Example
     * <ssvq-typecasting-search></ssvq-typecasting-search>
     */
    app.directive('ssvqTypecastingSearch', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/typecasting/typecastingSearch/typecastingSearch.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();