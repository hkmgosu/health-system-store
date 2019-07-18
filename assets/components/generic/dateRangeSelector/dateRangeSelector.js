(function () {
    'use strict';
    /**
     * Example
     * <ssvq-date-range-selector key=""></ssvq-date-range-selector>
     */
    app.directive('ssvqDateRangeSelector', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                onChange: '&?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/generic/dateRangeSelector/dateRangeSelector.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog) {
        var vm = this;
        /**
        * Filtro inicial:
        *      Fecha desde: Principio del mes actual
        *      Fecha hasta: Fin del mes actual
        */
        vm.dates = {
            fromDate: moment().startOf('month').toDate(),
            toDate: moment().endOf('month').toDate()
        };

        vm.selectDates = $event => {
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: '/components/generic/dateRangeSelector/dialog.dateRangeSelector.html',
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
                    dates: angular.copy(vm.dates)
                }
            }).then(dates => {
                if (!dates || !vm.onChange) { return; }
                vm.dates = dates;
                vm.onChange()(dates);
            });
        };

        vm.onChange()(vm.dates);
    }
})();