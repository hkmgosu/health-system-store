(() => {
    'use strict';
    /**
      * Example
      * <ssvq-resource-location-form></ssvq-resource-location-form>
      */
    app.directive('ssvqResourceLocationForm', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { resource: '=', onConfirm: '&?' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/resourceMaintainer/resourceLocationForm/resourceLocationForm.html'
        };
    });

    /* @ngInject */
    function ComponentController($resourceFactory, $scope) {
        var vm = this;

        vm.initResource = angular.copy(vm.resource);

        /* if (!_.isEmpty(vm.resource.jsonData)) {
            $resourceFactory.getAssignmentCoincidences(vm.resource.jsonData)
                .then(list => vm.assignmentCoincidences = list);
        } */

        var onEmployeeSelect = employee => {
            if (!vm.resource.establishment && employee.establishment) {
                vm.resource.establishment = employee.establishment;
            }
            if (!vm.resource.unit && employee.unit && employee.unit.establishment === vm.resource.establishment.id) {
                vm.resource.unit = employee.unit;
            }
        };

        vm.onEmployeeSelect = employee => onEmployeeSelect(employee);
        vm.onSuggestionSelect = employee => {
            vm.resource.currentEmployee = angular.copy(employee);
            onEmployeeSelect(employee);
        };

        $scope.$watch('vm.resource', (resource, prev) => {
            if (!resource || !prev) { return; }
            if ((resource.currentEmployee ? resource.currentEmployee.id : null) !== (prev.currentEmployee ? prev.currentEmployee.id : null)) {
                vm.locationForm.$setDirty();
            }
            if ((resource.establishment ? resource.establishment.id : null) !== (prev.establishment ? prev.establishment.id : null)) {
                vm.locationForm.$setDirty();
            }
            if ((resource.unit ? resource.unit.id : null) !== (prev.unit ? prev.unit.id : null)) {
                vm.locationForm.$setDirty();
            }
        }, true);

        vm.confirmLocation = () => {
            vm.onConfirm()();
            vm.locationForm.$setPristine();
        };
    }
})();