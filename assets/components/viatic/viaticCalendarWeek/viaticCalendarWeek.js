(() => {
    'use strict';
    /**
      * Example
      * <ssvq-viatic-calendar-week></ssvq-calendar-week>
      */
    app.directive('ssvqViaticCalendarWeek', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { weekDays: '=', editMode: '=', itemOptions: '=' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/viatic/viaticCalendarWeek/viaticCalendarWeek.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog) {
        var vm = this;

        vm.week = _.times(7, i => {
            return _.find(vm.weekDays, { dayOfWeek: i + 1 }) || { dayOfWeek: i + 1 }
        });

        vm.changeOption = (day, option) => {
            if (option.measure === 'hour') {
                vm.setHours(day);
            } else {
                day.value = option;
            }
        };
        
        vm.showBlocked = day => {
            window.open('#/viaticos/detalles/' + day.value.viatic,'_blank');
        };

        vm.setHours = (day, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                parent: angular.element(document.querySelector('#calendar-container')),
                templateUrl: '/components/viatic/viaticCalendarWeek/dialog.hours.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.day);
                        vm.calcHumanTime = () => {
                            let quantity = vm.day.value.quantity;
                            let hours = parseInt(quantity);
                            let minutes = (quantity - parseInt(quantity)) * 60;
                            if (!hours) {
                                vm.day.value.label = minutes + ' min';
                            } else {
                                vm.day.value.label = hours + (minutes ? ':' + minutes : '') + ' hrs';
                            }
                        };

                        vm.day.value.measure = 'hour';

                        vm.calcHumanTime();
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: { day: angular.copy(day) },
                multiple: true
            }).then(dayUpdated => {
                Object.assign(day, dayUpdated);
            });
        };
    }
})();