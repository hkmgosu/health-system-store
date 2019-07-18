(() => {
    'use strict';
    /**
      * Example
      * <ssvq-viatic-day-details></ssvq-viatic-day-details>
      */
    app.directive('ssvqViaticDayDetails', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { dayDetails: '=' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/viatic/viaticDayDetails/viaticDayDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope) {
        var vm = this;

        var calcHumanTimeHours = hours => {
            if ((hours - parseInt(hours)) * 60 == 0) {
                return parseInt(hours) + ' hrs';
            } else {
                return parseInt(hours) + ':' + (hours - parseInt(hours)) * 60 + ' hrs';
            }
        };

        $scope.$watch('vm.dayDetails', dayDetails => {
            if (!dayDetails) { return; }

            vm.dates = _.groupBy(dayDetails, date => {
                if (date.unity === 'hour') {
                    date.quantityHuman = calcHumanTimeHours(date.quantity) + ' ' + date.schedule;
                }
                return moment(date.date).format('MMMM YYYY');
            });
        });
    }
})();