(function () {
    'use strict';
    /**
     * Example
     * <ssvq-typecasting-priority-info></ssvq-typecasting-priority-info>
     */
    app.directive('ssvqTypecastingPriorityInfo', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: true,
            restrict: 'E',
            scope: {},
            templateUrl: '/components/typecasting/typecastingPriorityInfo/typecastingPriorityInfo.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    };
})();
