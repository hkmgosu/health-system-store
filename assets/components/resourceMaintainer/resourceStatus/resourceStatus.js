(function () {
    'use strict';
    /**
     * Example
     * <ssvq-resource-status id=""></ssvq-resource-status>
     */
    app.directive('ssvqResourceStatus', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { id: '@' },
            restrict: 'E',
            scope: {},
            template: '{{vm.rendered}}'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $resourceFactory) {
        var vm = this;

        $scope.$watch('vm.id', id => {
            if (!id) { return; }
            $resourceFactory.getResourceStatusList().then(resourceStatusList => {
                vm.rendered = (_.find(resourceStatusList, { id: parseInt(id) }) || {}).name;
            });
        });
    }
})();