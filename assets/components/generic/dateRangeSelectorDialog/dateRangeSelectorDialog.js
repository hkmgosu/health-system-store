(() => {
    'use strict';
    app.provider('$dateRangeSelectorDialog', () => {
        return {
            $get: customProvider
        };
    });

    /* @ngInject */
    function customProvider($mdDialog) {
        return {
            showDialog: ($event, dates) => $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/generic/dateRangeSelectorDialog/dateRangeSelectorDialog.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.apply = () => $mdDialog.hide(vm.dates);
                        vm.cancel = () => $mdDialog.cancel();
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    dates: angular.copy(dates)
                }
            })
        };
    }
})();