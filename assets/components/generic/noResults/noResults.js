(function () {
    'use strict';
    /**
     * Example
     * <ssvq-no-results key=""></ssvq-no-results>
     */
    app.directive('ssvqNoResults', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                message: '@?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/generic/noResults/noResults.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();