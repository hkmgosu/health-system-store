(() => {
    'use strict';
    /**
      * Example
      * <ssvq-resource-data></ssvq-resource-data>
      */
    app.directive('ssvqResourceData', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { resource: '=', onConfirm: '&?' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/resourceMaintainer/resourceData/resourceData.html'
        };
    });

    /* @ngInject */
    function ComponentController($resourceFactory) {
        var vm = this;

        vm.confirmUpdate = () => {
            vm.onConfirm()();
            vm.generalDataForm.$setPristine();
        };

        $resourceFactory.getResourceTypeList().then(resourceTypeList => vm.resourceTypeList = resourceTypeList);
    }
})();