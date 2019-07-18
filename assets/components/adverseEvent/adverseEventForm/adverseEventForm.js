(() => {
    'use strict';
    /**
     * Example
     * <ssvq-adverse-event-form></ssvq-adverse-event-form>
     */
    app.directive('ssvqAdverseEventForm', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                data: '=',
                patient: '=',
                origin: '=',
                form: '=tupleSelected'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/adverseEvent/adverseEventForm/adverseEventForm.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;
        vm.data = vm.data ? vm.data : {};

        $scope.$watch(() => {return vm.form}, (newVal, oldVal) => {
            if (!_.isEmpty(oldVal) && (newVal || {}).id !== (oldVal || {}).id) {
                vm.data = {};
            }
        })
    }
})();
