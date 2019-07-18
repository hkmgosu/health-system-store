(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-upp-form-view></ssvq-adverse-event-upp-form-view>
     */
    app.directive('ssvqAdverseEventUppFormView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventFormView/uppFormView/uppFormView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
    }
})();