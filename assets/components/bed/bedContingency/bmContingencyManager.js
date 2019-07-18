(function () {
    'use strict';
    /**
     * Example
     * <ssvq-bm-contingency-manager key=""></ssvq-bm-contingency-manager>
     */
    app.directive('ssvqBmContingencyManager', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                key: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/bedManagement/bmContingencyManager/bmContingencyManager.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog) {
        var vm = this;
        vm.contingencyList = [{}, {}, {}, {}];
        vm.showContingency = (contingency, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/bedManagement/bmContingencyManager/dialog.contingencyDetails.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide();
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {}
            }).then(() => {

            }, () => {

            });
        };
    }
})();