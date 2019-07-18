(function () {
    'use strict';
    /**
     * Example
     * <ssvq-request-list-item request=""></ssvq-request-list-item>
     */
    app.directive('ssvqRequestListItem', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                request: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/request/requestListItem/requestListItem.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();