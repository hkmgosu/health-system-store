(() => {
    'use strict';
    /**
      * Example
      * <ssvq-input-range></ssvq-input-range>
      */
    app.directive('ssvqInputRange', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                range: '='
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/generic/inputRange/inputRange.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;

        $scope.$watch('vm.range.startTime', startTime => {
            if (!startTime) { return; }
            vm.range.endTime = moment(startTime).add(12, 'h').toDate();
        }, true);
    }
})();