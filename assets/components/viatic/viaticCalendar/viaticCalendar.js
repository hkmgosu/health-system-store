(() => {
    'use strict';
    /**
     * Example
     * <ssvq-viatic-calendar></ssvq-viatic-calendar>
     */
    app.directive('ssvqViaticCalendar', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                fromDate: '=',
                untilDate: '=',
                duration: '=',
                days: '=',
                options: '=',
                itemOptions: '=',
                extraData: '=',
                module: '@?'
            },
            restrict: 'E',
            scope: {},
            templateUrl: '/components/viatic/viaticCalendar/viaticCalendar.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $mdDialog, $viaticFactory, $holidayFactory, $timeout) {
        var vm = this;
        vm.weekDayList = ['Lu.', 'Ma.', 'Mi.', 'Ju.', 'Vi.', 'Sa.', 'Do.'];
        vm.months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        vm.extraData = {};

        // Recibe objeto moment, retorna si es un día fin de semana
        let isWeekend = date => {
            return [6, 7].includes(date.isoWeekday());
        };
        let getHoliday = (day, holidays) => {
            return _.find(holidays, holiday => holiday.date === day.format('DD-MM-YYYY'));
        };

        var rangePromise;
        var initRangeDay = () => {
            $timeout.cancel(rangePromise);
            rangePromise = $timeout(function () {

                // Si no viene fecha de inicio
                // O si no viene fecha de término y no viene días de duración
                // Entonces la función retorna de inmediato
                if (!vm.fromDate || (!vm.untilDate && !vm.duration)) return;

                let opts = {
                    weekendEnabled: false,
                    holidaysEnabled: false
                };
                let days = [];

                vm.days = null;

                async.parallel({
                    blockedDays: cb => {
                        if (vm.module !== 'viatic') { return async.setImmediate(() => cb(null, [])); }
                        $viaticFactory.validateDates(vm.fromDate, vm.untilDate).then(days => {
                            cb(null, days || []);
                        }, () => cb(null, []));
                    },
                    holidays: cb => {
                        $holidayFactory.getHolidays(vm.fromDate, vm.untilDate || moment(vm.fromDate).add(1, 'year').toDate()).then(
                            holidays => cb(null, holidays), cb);
                    }
                }, (err, results) => {
                    let { holidays, blockedDays } = results;
                    var currentDay = moment(vm.fromDate);
                    if (vm.untilDate) {
                        while (currentDay <= moment(vm.untilDate)) {
                            let value = _.first(vm.itemOptions);
                            if (!opts.weekendEnabled && isWeekend(currentDay)) {
                                value = _.last(vm.itemOptions);
                            }
                            if (!opts.holidaysEnabled && getHoliday(currentDay, holidays)) {
                                value = _.last(vm.itemOptions);
                            }
                            if (_.find(blockedDays, day => day.date === currentDay.format('DD-MM-YYYY'))) {
                                value = {
                                    label: 'Ocupado',
                                    viatic: _.find(blockedDays, day => day.date === currentDay.format('DD-MM-YYYY')).viatic
                                };
                            }
                            days.push({
                                date: angular.copy(currentDay.toDate()),
                                dayOfWeek: currentDay.isoWeekday(),
                                isWeekend: isWeekend(currentDay),
                                isHoliday: !_.isEmpty(getHoliday(currentDay, holidays)),
                                holiday: getHoliday(currentDay, holidays),
                                weekIndex: currentDay.isoWeek(),
                                monthIndex: currentDay.month(),
                                value: value,
                                blocked: !!value.viatic
                            });

                            currentDay.add(1, 'd');
                        }
                    } else if (vm.duration) {
                        let durationIterator = 0;

                        while (durationIterator < vm.duration) {
                            let isValid = true;
                            if (!opts.weekendEnabled && isWeekend(currentDay)) {
                                isValid = false;
                            }
                            if (!opts.holidaysEnabled && getHoliday(currentDay, holidays)) {
                                isValid = false;
                            }
                            days.push({
                                date: angular.copy(currentDay.toDate()),
                                dayOfWeek: currentDay.isoWeekday(),
                                isWeekend: isWeekend(currentDay),
                                isHoliday: !_.isEmpty(getHoliday(currentDay, holidays)),
                                holiday: getHoliday(currentDay, holidays),
                                weekIndex: currentDay.isoWeek(),
                                monthIndex: currentDay.month(),
                                value: isValid ? _.first(vm.itemOptions) : _.last(vm.itemOptions)
                            });

                            if (isValid) { durationIterator++; }
                            if (durationIterator < vm.duration) { currentDay.add(1, 'd'); }
                        }
                        vm.untilDate = currentDay;
                    }

                    vm.days = days;
                });
            }, 500);
        };

        // Escuchar cambios en campo "fecha desde"
        $scope.$watch('vm.fromDate', fromDate => {
            if (!fromDate) { return; }
            initRangeDay();
        });
        // Escuchar cambios en campo "fecha hasta"
        $scope.$watch('vm.untilDate', untilDate => {
            if (!untilDate) { return; }
            vm.options.watchUntilDate ? initRangeDay() : null;
        });
        // Escuchar cambios en campo duración
        $scope.$watch('vm.duration', duration => {
            if (!duration) { return; }
            vm.untilDate = null;
            vm.options.watchDuration ? initRangeDay() : null;
        });

        var daysWatchPromise;
        $scope.$watch('vm.days', days => {
            $timeout.cancel(daysWatchPromise);
            daysWatchPromise = $timeout(function () {
                Object.assign(vm.extraData, {
                    hasHolidaysSelected: _.some(days, (day) => {
                        return day.isHoliday && day.value.quantity;
                    }),
                    hasWeekendSelected: _.some(days, day => {
                        return day.isWeekend && day.value.quantity;
                    })
                });
            }, 800);
        }, true);
    }
})();