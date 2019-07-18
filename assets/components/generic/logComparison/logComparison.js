(function () {
    'use strict';
    /**
     * Example
     * <ssvq-log-comparison old-value="" new-value=""></ssvq-log-comparison>
     */
    app.directive('ssvqLogComparison', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                oldValue: '=',
                newValue: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/generic/logComparison/logComparison.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();