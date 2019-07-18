(function () {
    'use strict';
    /**
     * Example
     * <ssvq-unit-org-chart unit=""></ssvq-unit-org-chart>
     */
    app.directive('ssvqUnitOrgChart', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                unit: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/unit/unitOrgChart/unitOrgChart.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();