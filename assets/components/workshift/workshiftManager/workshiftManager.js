(() => {
    'use strict';
    /**
      * Example
      * <ssvq-workshift-manager></ssvq-workshift-manager>
      */
    app.directive('ssvqWorkshiftManager', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/workshift/workshiftManager/workshiftManager.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, workshiftFactory, $mdToast, $location, establishmentFactory, uiCalendarConfig) {
        var vm = this;

        vm.showCreateDialog = ($event, tmpWorkshift) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/workshift/workshiftManager/dialog.workshiftCreate.html',
                /* @ngInject */
                controller: function ($scope, $mdDialog, workshiftFactory) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.workshiftData);

                    let getVehicleList = establishment => {
                        if (_.isEmpty(establishment)) { return (vm.vehicleList = null); }
                        // Limpiar equipos existentes
                        _.remove(vm.workshiftData.careTeamList, careTeam => !_.isEmpty(careTeam.vehicle));
                        // Obtener lista de vehículos asociados a la base
                        workshiftFactory.getEstablishmentVehicleList(establishment.id).then(
                            vehicleList => {
                                vm.workshiftData.careTeamList = (vm.workshiftData.careTeamList || []).concat(
                                    _.sortBy(vehicleList, 'name').map(vehicle => {
                                        return {
                                            vehicle: vehicle,
                                            checked: true
                                        };
                                    }));
                            },
                            err => console.log(err)
                        );
                    };

                    vm.onEstablishmentChange = establishment => {
                        if (_.isEmpty(establishment)) { return _.remove(vm.workshiftData.careTeamList, 'vehicle'); }
                        getVehicleList(establishment);
                    };

                    vm.onEstablishmentChange(vm.workshiftData.establishment);
                    vm.workshiftData.careTeamList = [{ type: 'baseTeam', checked: true }];
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    workshiftData: Object.assign({ establishment: vm.establishmentSelected }, tmpWorkshift || {})
                }
            }).then(data => {
                Object.assign(data, {
                    establishment: data.establishment.id,
                    careTeamList: _.map(_.filter(data.careTeamList || [], 'checked'), careTeam => {
                        return {
                            vehicle: careTeam.vehicle ? careTeam.vehicle.id : null,
                            participantList: _.map(careTeam.participantList || [], participant => {
                                return { member: participant.member.id };
                            })
                        };
                    })
                });
                workshiftFactory.create(data).then(
                    workshiftCreated => window.location.href = '#/samu/turnos/detalles/' + workshiftCreated.id,
                    err => $mdToast.showSimple('Error creando turno: ' + err));
            }).catch(() => { });
        };

        vm.alertEventOnClick = workshift => {
            $location.path('/samu/turnos/detalles/' + workshift.id);
        };

        vm.calendarConfig = {
            header: false,
            height: $("#workshiftCalendar").height(),
            timeFormat: 'HH:mm',
            lang: 'es',
            firstDay: 1,
            eventClick: vm.alertEventOnClick,
            displayEventEnd: {
                month: true
            },
            eventBackgroundColor: '#3380bf',
            viewRender: function (view, calendar) {
                vm.title = view.title;
            },
            dayClick: function (date, $event) {
                vm.showCreateDialog($event, {
                    startTime: new Date((date.month() + 1) + '/' + date.date() + '/' + date.year())
                });
            }
        };

        vm.goPrev = () => uiCalendarConfig.calendars.workshiftCalendar.fullCalendar('prev');
        vm.goNext = () => uiCalendarConfig.calendars.workshiftCalendar.fullCalendar('next');

        async.series({
            getEstablishmentList: cb => {
                establishmentFactory.get({ type: 9 }).then(establishmentList => {
                    vm.establishmentList = establishmentList;
                    if (_.find(establishmentList, { id: employee.establishment })) {
                        vm.establishmentSelected = _.find(establishmentList, { id: employee.establishment });
                    } else {
                        vm.establishmentSelected = _.first(establishmentList);
                    }
                    cb();
                }, err => cb(err || new Error('Error cargando establecimientos')));
            },
            initCalendar: cb => {
                vm.calendarQuery = [(start, end, timezone, cb) => {
                    workshiftFactory.getList({
                        establishment: vm.establishmentSelected.id,
                        startTime: start,
                        endTime: end
                    }).then(list => {
                        vm.workshiftList = list.map(workshift => {
                            return {
                                id: workshift.id,
                                title: workshift.title || '',
                                start: new Date(workshift.startTime),
                                end: new Date(workshift.endTime)
                            };
                        });
                        cb(vm.workshiftList);
                    }, err => cb([]));
                }];

                vm.initCalendar = true;

                cb();
            }
        }, (err, results) => {
            if (err) { console.log(err); }
        });

        vm.selectEstablishment = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/workshift/workshiftManager/dialog.establishmentSelector.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.establishmentSelected);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    establishmentList: vm.establishmentList,
                    establishmentSelected: vm.establishmentSelected
                }
            }).then((establishmentSelected) => {
                vm.establishmentSelected = establishmentSelected;
                uiCalendarConfig.calendars.workshiftCalendar.fullCalendar('refetchEvents');
            });
        };
    }
})();