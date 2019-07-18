(function () {
    'use strict';
    app.provider('$remVehicleDialog', () => {
        return {
            $get: customProvider
        };
    });

    /* @ngInject */
    function customProvider($mdDialog) {
        return {
            showDialog: ($event, dataForDialog) => {
                return new Promise((resolve, reject) => {
                    $mdDialog.show({
                        targetEvent: $event || null,
                        clickOutsideToClose: true,
                        templateUrl: '/components/rem/remVehicleDialogProvider/remVehicleDialogProvider.html',
                        /* @ngInject */
                        controller: function ($scope, $mdDialog, $mdToast, remVehicle, vehicleFactory) {
                            var vm = this;
                            vm.msg = '';
                            vm.remVehicle = remVehicle || {
                                participantList: []
                            };
                            vm.logStatusPosition = [];
                            vm.participantListOpts = {
                                theme: 'white',
                                employeeFields: {
                                    job: true
                                }
                            };

                            vm.isPrivateChanged = isPrivate => {
                                if (isPrivate) {
                                    vm.vehicleChanged(null);
                                    vm.remVehicle.vehicle = null;
                                }
                            };

                            if (remVehicle) {
                                var socketRem = function (event) {
                                    if (event.id == remVehicle.rem) {
                                        switch (event.data.message) {
                                            case 'remLogVehicle':
                                                if (remVehicle.id === event.data.data.remVehicle.id) {
                                                    vm.remLogVehicle.push(event.data.data.log);
                                                }
                                                break;
                                            default:
                                                console.warn('Unrecognized socket event (`%s`) from server:', event.verb, event);
                                        }
                                    }
                                };
                                io.socket.on('rem', socketRem);
                                $scope.$on('$destroy', function () {
                                    io.socket.off('rem', socketRem);
                                });
                            }
                            vm.save = () => $mdDialog.hide(vm.remVehicle);
                            vm.cancel = () => {
                                $mdDialog.cancel();
                            };

                            let vehicleInTransitAlert = currentRem => $mdDialog.alert({
                                parent: angular.element(document.querySelector('#rem-vehicle-dialog')),
                                title: 'Alerta',
                                htmlContent: 'Vehículo con despacho en curso, al guardar finalizará el <a href="#/samu/incidentes/' + currentRem + '" target="_BLANK">despacho actual</a>',
                                ok: 'Entiendo',
                                multiple: true
                            });
                            vm.vehicleChanged = selected => {
                                _.extend(vm.remVehicle, _.pick(selected, [
                                    'establishment',
                                    'category'
                                ]));
                                if (selected && selected.status.type === 'ensalida') {
                                    $mdDialog.show(vehicleInTransitAlert(selected.currentRem));
                                }

                                vehicleFactory.getCurrentCareTeam(selected.id).then(careTeam => {
                                    vm.remVehicle.participantList = careTeam.participantList.map(participant => {
                                        return {
                                            remVehicle: vm.remVehicle.id,
                                            member: participant.member,
                                            deleted: false
                                        };
                                    });
                                }, err => $mdToast.showSimple('El vehículo seleccionado no tiene un turno vigente'));
                            };

                            vm.subValidate = () => {
                                if (vm.saveForm.vehicleAutocompleteForm) {
                                    vm.saveForm.vehicleAutocompleteForm.vehicleAutocomplete.$setTouched();
                                }
                                return true;
                            };
                            vm.deleteRemVehicle = () => {
                                $mdDialog.show(
                                    $mdDialog.confirm()
                                        .parent(angular.element(document.querySelector('#rem-vehicle-dialog')))
                                        .clickOutsideToClose(true)
                                        .title('¿Estás seguro de eliminar el despacho?')
                                        .textContent('La información del despacho será eliminada permanentemente')
                                        .ariaLabel('¿Estás seguro de eliminar el despacho?')
                                        .ok('Eliminar despacho')
                                        .cancel('Volver')
                                        .multiple(true)
                                ).then(() => {
                                    $mdDialog.hide({
                                        id: vm.remVehicle.id,
                                        deleted: true
                                    });
                                });
                            };

                            $scope.$watch('vm.remVehicle.participantList', (participantList, old) => {
                                if (participantList && old && (participantList != old)) {
                                    vm.saveForm.$setDirty();
                                }
                            }, true);
                        },
                        controllerAs: 'vm',
                        locals: {
                            remVehicle: dataForDialog
                        }
                    })
                        .then(resolve)
                        .catch(reject);
                });
            }
        };

    }
})();