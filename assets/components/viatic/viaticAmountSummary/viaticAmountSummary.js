(() => {
    'use strict';
    /**
      * Example
      * <ssvq-viatic-amount-summary></ssvq-viatic-amount-summary>
      */
    app.directive('ssvqViaticAmountSummary', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                viatic: '=viaticData',
                static: '@?'
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/viatic/viaticAmountSummary/viaticAmountSummary.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $viaticFactory) {
        var vm = this;

        if (!vm.static) {
            $viaticFactory.getValues().then(viaticValues => {
                vm.viaticValues = viaticValues;
                vm.viatic = Object.assign(vm.viatic || {}, {
                    completeDayUnitValue: vm.viaticValues.valueTotal,
                    partialDayUnitValue: vm.viaticValues.valuePartial
                });
            });
        }

        let setTotalAmount = () => {
            vm.viatic.completeDayAmount = (vm.viatic.completeDayQuantity || 0) * vm.viaticValues.valueTotal;
            vm.viatic.partialDayAmount = (vm.viatic.partialDayQuantity || 0) * vm.viaticValues.valuePartial;
            vm.viatic.totalAmount = vm.viatic.completeDayAmount + vm.viatic.partialDayAmount;
        };

        $scope.$watch('vm.viatic.completeDayQuantity', completeDayQuantity => {
            if (!vm.viaticValues || vm.static) { return; }
            setTotalAmount();
        }, true);

        $scope.$watch('vm.viatic.partialDayQuantity', partialDayQuantity => {
            if (!vm.viaticValues || vm.static) { return; }
            setTotalAmount();
        }, true);
    }
})();