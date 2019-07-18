(function () {
    'use strict';
    /**
     * Example
     * <ssvq-timing-selector label=""></ssvq-timing-selector>
     */
    app.directive('ssvqTimingSelector', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                dateTime: '=date',
                max: '@',
                min: '@',
                label: '@',
                nowButton: '@',
                required: '='
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/generic/timingSelector/timingSelector.html'
        };
    });

    /* @ngInject */
    function ComponentController(utilitiesFactory, $scope) {
        var vm = this;
        vm.viewNowButton = (vm.nowButton === 'true' || !vm.nowButton) ? true : false;
        vm.setNow = () => {
            utilitiesFactory.getDateTime()
                .then(data => {
                    vm.dateTime = new Date(data.dateTime);
                    vm.dateTime.setMilliseconds(null);
                    vm.date = angular.copy(vm.dateTime);
                    vm.date.setHours(0, 0, 0);
                    vm.time = angular.copy(vm.dateTime);
                }, err => {
                    console.log(err);
                });
        };
        vm.setDateTime = () => {
            if (vm.time && vm.date) {
                vm.dateTime = moment(moment(vm.date).format('YYYY-MM-DD') + ' ' + moment(vm.time).format('HH:mm')).toDate();
            } else {
                vm.dateTime = undefined;
            }
        };

        $scope.$watch('vm.dateTime', dateTime => {
            if (!dateTime) { return; }
            vm.date = angular.copy(new Date(dateTime));
            vm.time = angular.copy(new Date(dateTime));
        }, true);
    }
})();