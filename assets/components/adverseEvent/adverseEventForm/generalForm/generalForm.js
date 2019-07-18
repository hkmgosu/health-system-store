(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-general-form></ssvq-adverse-event-general-form>
     */
    app.directive('ssvqAdverseEventGeneralForm', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventForm/generalForm/generalForm.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
    }
})();