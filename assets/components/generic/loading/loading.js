(function () {
    'use strict';
    /**
     * Example
     * <ssvq-loading key=""></ssvq-loading>
     */
    app.directive('ssvqLoading', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/generic/loading/loading.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();