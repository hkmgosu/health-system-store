(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-fall-form-view></ssvq-adverse-event-fall-form-view>
     */
    app.directive('ssvqAdverseEventFallFormView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventFormView/fallFormView/fallFormView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
    }
})();