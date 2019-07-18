(function () {
    'use strict';
    /**
     * Example
     * <ssvq-viatic-item viatic=""></ssvq-viatic-item>
     */
    app.directive('ssvqViaticItem', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                viatic: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/viatic/viaticItem/viaticItem.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();