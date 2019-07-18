(() => {
    'use strict';
    /**
      * Example
      * <ssvq-workshift-validator></ssvq-workshift-validator>
      */
    app.directive('ssvqWorkshiftValidator', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                workshiftData: '=',
                isValid: '='
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/workshift/workshiftValidator/workshiftValidator.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, workshiftFactory, $timeout) {
        var vm = this;

        var timeoutPromise;

        $scope.$watch('vm.workshiftData', workshift => {
            if (_.has(workshift, 'establishment') && _.has(workshift, 'startTime') && _.has(workshift, 'endTime')) {

                $timeout.cancel(timeoutPromise);

                timeoutPromise = $timeout(function () {
                    workshiftFactory.remoteValidate({
                        id: workshift.id,
                        establishment: workshift.establishment.id,
                        startTime: workshift.startTime,
                        endTime: workshift.endTime
                    }).then(workshiftFinded => {
                        vm.workshiftConflicts = workshiftFinded;
                        vm.isValid = undefined;
                        $scope.$apply();
                    }, () => {
                        vm.isValid = true;
                        vm.workshiftConflicts = [];
                        $scope.$apply();
                    });
                }, 1000);
            }
        }, true);
    }
})();