(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-medication-form-view></ssvq-adverse-event-medication-form-view>
     */
    app.directive('ssvqAdverseEventMedicationFormView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventFormView/medicationFormView/medicationFormView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
    }
})();