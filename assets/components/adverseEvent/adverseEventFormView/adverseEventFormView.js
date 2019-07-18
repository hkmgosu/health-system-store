(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-form-view></ssvq-adverse-event-form-view>
     */
    app.directive('ssvqAdverseEventFormView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '=',
                form: '=formType'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventFormView/adverseEventFormView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
    }
})();