(function () {
    'use strict';
    /**
     * Example
     * <ssvq-bed-monitoring></ssvq-bed-monitoring>
     */
    app.directive('ssvqBedMonitoring', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/bed/bedMonitoring/bedMonitoring.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $mdSidenav, $derivationFactory, $bedFactory, $scope) {
        var vm = this;

        vm.changeUnit = unit => {
            vm.currentUnit = unit;
        };

        vm.showRoomDetails = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/bed/bedMonitoring/dialog.roomDetails.html',
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

        vm.deleteRoom = () => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('Eliminar sala')
                    .textContent('¿Está seguro de eliminar la sala "Pediatría C"?')
                    .ok('Si')
                    .ariaLabel('Eliminar sala')
                    .cancel('Cancelar')
            ).then(() => { }, () => { });
        };

        vm.showBedDetails = (bed, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/bed/bedMonitoring/dialog.bedDetails.html',
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

        vm.showFilter = () => {
            $mdSidenav('bm-filter').toggle();
        };

        vm.changeEstablishment = $event => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/bed/bedMonitoring/dialog.establishmentSelector.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.currentEstablishment);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    establishmentList: vm.supervisedEstablishmentList,
                    currentEstablishment: vm.currentEstablishment
                }
            }).then((establishment) => {
                vm.currentEstablishment = establishment;
            });
        };

        var defaultItem = {
            patient: {
                name: 'Jaime Felipe Cisternas Mutis',
                edad: 28 + ' años',
                sexo: 'M'
            },
            requestedUnit: { name: 'Cirugía' },
            fromEstablishment: { name: 'Hospital Gustavo Fricke' },
            toEstablishment: { name: 'Hospital de Quilpué' },
            createdAt: moment().subtract('minutes', 60).toDate()
        };
        vm.transferList = [];
        for (let i = 0; i < 15; ++i) {
            vm.transferList.push(defaultItem);
        }

        vm.customTransferList = [];
        for (let i = 0; i < 4; ++i) {
            vm.customTransferList.push(defaultItem);
        }

        vm.addBed = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/bed/bedMonitoring/dialog.addBed.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.bed);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    roomList: vm.roomList
                }
            }).then((bed) => {
                $bedFactory.addBed(bed).then(() => {
                    _.find(vm.roomList, { id: bed.room }).bedList.unshift(bed)
                    $scope.$apply();
                });
            });
        };
        vm.addRoom = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/bed/bedMonitoring/dialog.addRoom.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.room);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {}
            }).then((room) => {
                room.unit = vm.currentUnit.id;
                $bedFactory.addRoom(room).then(() => {
                    vm.roomList.unshift(room);
                });
            });
        };

        $derivationFactory.getMySupervisedEstablishmentList().then(list => {
            vm.supervisedEstablishmentList = list;
            vm.currentEstablishment = vm.supervisedEstablishmentList[0];

        });

        $scope.$watch('vm.currentEstablishment', currentEstablishment => {
            if (!currentEstablishment) { return; }
            $bedFactory.getUnitList(vm.currentEstablishment.id).then(
                unitList => {
                    vm.unitList = unitList;
                    vm.currentUnit = unitList[0];
                    $scope.$apply();
                }
            );
        });
        $scope.$watch('vm.currentUnit', currentUnit => {
            if (!currentUnit) { return; }
            $bedFactory.getRoomList(vm.currentUnit.id).then(
                roomList => {
                    vm.roomList = roomList;
                    $scope.$apply();
                }
            );
        });

        vm.setPatient = (bed, $event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/bed/bedMonitoring/dialog.setPatient.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.patient);
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {}
            }).then((patient) => {
                $bedFactory.addBedPatient({
                    idBed: bed.id,
                    idPatient: patient.id
                });
            });
        };

        vm.setCategory = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/bed/bedMonitoring/dialog.patientCategorySeletor.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide();

                        vm.categoryList = [{
                            id: 1,
                            name: 'C1',
                            selected: true
                        }, {
                            id: 2,
                            name: 'C2'
                        }, {
                            id: 3,
                            name: 'C3'
                        }];
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