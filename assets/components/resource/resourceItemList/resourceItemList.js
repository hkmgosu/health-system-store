(() => {
    'use strict';
    /**
      * Example
      * <ssvq-resource-item-list></ssvq-resource-item-list>
      */
    app.directive('ssvqResourceItemList', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { resource: '=' },
            restrict: 'E',
            templateUrl: '/components/resource/resourceItemList/resourceItemList.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;

        vm.getResourceIcon = (type) => {
            type = parseInt(type);
            switch (type) {
                case 1:
                    return 'fa fa-mobile';
                case 2:
                    return 'fa fa-tablet';
                case 3:
                    return 'fa fa-desktop';
                case 4:
                    return 'fa fa-desktop';
                case 5:
                    return 'fa fa-television';
                case 6:
                    return 'fa fa-wifi';
                case 7:
                    return 'fa fa-laptop';
                default:
                    return 'fa fa-question-circle-o';
            }
        };
    }
})();