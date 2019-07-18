(() => {
    'use strict';
    /**
      * Example
      * <ssvq-workshift-details></ssvq-workshift-details>
      */
    app.directive('ssvqWorkshiftDetails', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/workshift/workshiftDetails/workshiftDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, workshiftFactory, $stateParams, $mdDialog, vehicleFactory, $mdToast) {
        var vm = this;

        vm.idWorkshift = $stateParams.id;

        // Obtener información básica del turno
        workshiftFactory.getDetails(vm.idWorkshift).then(workshift => {
            vm.workshiftData = workshift;
        });

        // Obtener lista de equipos de trabajo con participantes
        workshiftFactory.getFullCareTeamList(vm.idWorkshift).then(careTeamList => {
            vm.careTeamList = careTeamList;
            $scope.$apply();
        }, err => console.log(err));

        // Obtener lista de comentarios
        workshiftFactory.getTimeline(vm.idWorkshift).then(commentList => {
            vm.commentList = commentList;
            $scope.$apply();
        }, err => console.log(err));

        vm.addVehicleDialog = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/workshift/workshiftDetails/dialog.addVehicleList.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.vehicleList);
                    vm.vehicleList = [];
                    vm.addVehicle = vehicle => vm.vehicleList.unshift(vehicle);
                    vm.removeVehicle = vehicle => _.remove(vm.vehicleList, { id: vehicle.id });
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {}
            }).then(vehicleList => {
                // Acción confirmada
                workshiftFactory.addCareTeam(vm.workshiftData.id, _.map(vehicleList, 'id')).then(
                    vehicleTeamCreated => {
                        _.map(vehicleTeamCreated, team => team.participantList = []);
                        vm.careTeamList = vm.careTeamList.concat(vehicleTeamCreated);
                        $mdToast.showSimple('Los vehículos han sido agregado al turno');
                    },
                    err => $mdToast.showSimple('Error: ' + (err || 'Error desconocido'))
                );
            });
        };

        vm.showEditDialog = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/workshift/workshiftDetails/dialog.editInfo.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.workshiftData);
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    workshiftData: Object.assign({}, vm.workshiftData, {
                        startTime: new Date(vm.workshiftData.startTime),
                        endTime: new Date(vm.workshiftData.endTime)
                    })
                }
            }).then((editedWorkshift) => {
                workshiftFactory.update(_.pick(editedWorkshift, ['id', 'title', 'startTime', 'endTime'])).then(() => {
                    $mdToast.showSimple('El turno fue actualizado');
                    Object.assign(vm.workshiftData, editedWorkshift);
                }, err => {
                    console.log(err)
                    $mdToast.showSimple('Ocurrió un error actualizando el turno');
                });
            });
        };

        // Enviar comentario
        vm.sendComment = (comment) => new Promise((resolve, reject) => {
            comment.idModelModule = vm.idWorkshift;
            comment.modelModule = 'workshift';
            workshiftFactory.addComment(comment).then(resolve, reject);
        });

        vm.showDeleteWorkshiftDialog = ($event) => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .targetEvent($event)
                    .title('Eliminar turno')
                    .textContent('¿Estás seguro de eliminar el turno permanentemente?')
                    .ok('Si, eliminar')
                    .ariaLabel('Eliminar turno')
                    .cancel('Volver')
            ).then(() => {
                $mdToast.showSimple('Eliminando el turno...');
                workshiftFactory.delete(vm.workshiftData.id).then((response) => {
                    $mdToast.showSimple('El turno fue eliminado');
                    window.location.href = '#/samu/turnos';
                }, () => $mdToast.showSimple('Ha ocurrido un error eliminando el turno'));
            });
        };

        vm.showValidateWorkshiftDialog = ($event) => {
            $mdDialog.show(
                $mdDialog.confirm()
                    .targetEvent($event)
                    .title('Activar turno')
                    .textContent('¿Deseas activar el turno?')
                    .ok('Si, activar')
                    .ariaLabel('Activar turno')
                    .cancel('Volver')
            ).then(() => {
                $mdToast.showSimple('Activando turno...');
                workshiftFactory.validate(vm.workshiftData.id).then(() => {
                    vm.workshiftData.validated = true;
                    $mdToast.showSimple('El turno fue activado');
                }, err => $mdToast.showSimple('Error: ' + err));
            });
        };

        vm.showCopyDialog = ($event) => {
            $mdDialog.show({
                targetEvent: $event,
                clickOutsideToClose: true,
                templateUrl: '/components/workshift/workshiftDetails/dialog.copy.html',
                /* @ngInject */
                controller: function ($mdDialog) {
                    var vm = this;
                    vm.cancel = () => $mdDialog.cancel();
                    vm.confirm = () => $mdDialog.hide(vm.copyValues);

                    vm.addTimeItem = () => vm.copyValues.timeList.push({
                        establishment: vm.establishment
                    });
                    vm.deleteTimeItem = timeItem => {
                        if (vm.copyValues.timeList.length <= 1) { return; }
                        _.remove(vm.copyValues.timeList, { $$hashKey: timeItem.$$hashKey });
                    };
                },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    copyValues: {
                        id: vm.workshiftData.id,
                        title: vm.workshiftData.title,
                        timeList: [{
                            establishment: vm.workshiftData.establishment
                        }]
                    },
                    establishment: vm.workshiftData.establishment
                }
            }).then(copyValues => {
                $mdToast.showSimple('Creando copias del turno');
                copyValues.timeList = copyValues.timeList.map(timeItem => { return _.omit(timeItem, 'establishment'); });
                workshiftFactory.copy(copyValues).then(copied => {
                    $mdToast.showSimple('Se han creado las copias solicitadas del turno');
                }, err => {
                    $mdToast.showSimple('Ha ocurrido un error creando las copias del turno');
                    console.log(err);
                });
            });
        };

        var onSocketMessage = function (event) {
            if (event.id == vm.idWorkshift) {
                let { message, data } = event.data;
                switch (message) {
                    case 'commentCreated':
                        vm.commentList.unshift(data);
                        break;
                    case 'logCreated':
                        vm.commentList.unshift(data);
                        break;
                    case 'participantRemoved':
                        vm.careTeamList.forEach(careTeam => {
                            _.remove(careTeam.participantList, { id: data.idParticipant });
                        });
                        break;
                    case 'participantAdded':
                        let careTeam = _.find(vm.careTeamList, { id: data.participant.careTeam });
                        careTeam.participantList.push(data.participant);
                        break;
                }
                $scope.$apply();
            }
        };
        io.socket.on('workshift', onSocketMessage);
        $scope.$on('$destroy', () => io.socket.off('workshift', onSocketMessage));

    }
})();