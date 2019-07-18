(function () {
    'use strict';
    /**
     * Example
     * <ssvq-typecasting-header></ssvq-typecasting-header>
     */
    app.directive('ssvqTypecastingHeader', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: true,
            restrict: 'E',
            scope: {},
            templateUrl: '/components/typecasting/typecastingHeader/typecastingHeader.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    };
})();