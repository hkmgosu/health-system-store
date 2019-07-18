(function () {
    'use strict';
    /**
     * Example
     * <ssvq-typecasting-history-info></ssvq-typecasting-history-info>
     */
    app.directive('ssvqTypecastingHistoryInfo', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: true,
            restrict: 'E',
            scope: {},
            templateUrl: '/components/typecasting/typecastingHistoryInfo/typecastingHistoryInfo.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    };
})();