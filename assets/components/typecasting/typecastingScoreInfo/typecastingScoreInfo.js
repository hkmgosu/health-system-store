(function () {
    'use strict';
    /**
     * Example
     * <ssvq-typecasting-score-info></ssvq-typecasting-score-info>
     */
    app.directive('ssvqTypecastingScoreInfo', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: true,
            restrict: 'E',
            scope: {},
            templateUrl: '/components/typecasting/typecastingScoreInfo/typecastingScoreInfo.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    };
})();
