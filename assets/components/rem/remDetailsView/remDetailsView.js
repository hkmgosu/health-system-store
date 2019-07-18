(function () {
    'use strict';
    /**
     * <ssvq-rem-details-view></ssvq-rem-details-view>
     */
    app.directive('ssvqRemDetailsView', () => {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            restrict: 'E',
            scope: {},
            templateUrl: '/components/rem/remDetailsView/remDetailsView.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $rootScope, $stateParams, $mdToast, $translate, screenSize, remFactory, $mdDialog, remVehicleFactory) {
        var vm = this;
        vm.idRem = $stateParams.id;
        let oldStatus;
        let basicInformationAttrs = ['id', 'callReason', 'subCallReason', 'priority', 'description', 'applicantType', 'applicantName', 'applicantPhone'];
        if (vm.idRem) {
            remFactory.get(vm.idRem).then((rem) => {
                if (rem === undefined) {
                    $mdToast.showSimple('No existe incidente');
                    window.location.href = '#/samu/incidentes';
                }
                vm.rem = rem;
                vm.basicInformation = _.pick(rem, basicInformationAttrs);
            }, (err) => {
                $mdToast.showSimple('Ha ocurrido un error');
                console.log(err);
                window.location.href = '#/samu/incidentes';
            });
            remFactory.subscribe(vm.idRem)
                .then(res => console.log('Success rem subscribe'))
                .catch(err => console.log('Error rem subscribe'))
        } else {
            window.location.href = '#/samu/incidentes';
        }

        $scope.desktop = screenSize.on('md, lg', function (match) {
            $scope.desktop = match;
        });
        $scope.mobile = screenSize.on('xs, sm', function (match) {
            $scope.mobile = match;
        });

        $scope.$on("$destroy", function () {
            $rootScope.$broadcast('detailsview:off', {});
        });

        /*
        $scope.$on('$locationChangeStart', function( event ) {
            var answer = confirm("Está seguro que desea salir?")
            if (!answer) {
                event.preventDefault();
            }
        });
        */

        remFactory.getRemStatus()
            .then(
                (res) => vm.remStatus = res,
                (err) => console.error('remFactory.getRemStatus', err)
            );

        vm.changeStatus = () => {

            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/rem/remDetailsView/dialogConfirmStatusChanged.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog, utilitiesFactory, employeeFactory, remFactory) {
                        var vm = this;
                        vm.priorities = utilitiesFactory.getPriority();
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide({
                            statusSelected: vm.statusSelected,
                            comment: vm.comment.description,
                            reason: vm.reasonSelected,
                            requestedType: vm.requestedType,
                            finishRemVehicles: vm.finishRemVehicles,
                            priority: vm.priority,
                        });

                        vm.commentOptions = {
                            attachments: false,
                            confirmButton: false,
                            unitRoot: '323.402.420.421'
                        };

                        vm.showList = true;

                        vm.reasonSelected = null;

                        vm.reasons = [{
                            status: 2,
                            description: 'Finalizado correctamente'
                        }, {
                            status: 2,
                            description: 'Finalizado con incidentes',
                        }, {
                            status: 2,
                            description: 'Finalizado sin dar respuesta a usuario'
                        }, {
                            status: 6,
                            description: 'Se entregan indicaciones o consejos'
                        }, {
                            status: 6,
                            description: 'Se indica traslado por sus medios'
                        }, {
                            status: 6,
                            description: 'No atingente a SAMU'
                        }, {
                            status: 5,
                            description: 'Llamada para 133 o 132'
                        }, {
                            status: 5,
                            description: 'Pitanza'
                        }, {
                            status: 5,
                            description: 'Llamada sanitaria no SAMU'
                        }, {
                            status: 5,
                            description: 'Número equivocado'
                        }, {
                            status: 5,
                            description: 'Otro'
                        }];
                    },
                controllerAs: 'vm',
                bindToController: true,
                locals: {
                    statusList: vm.remStatus.filter(status => status.id !== vm.rem.status.id),
                    statusInitial: angular.copy(vm.rem.status),
                    remVehicleCount: vm.remVehicleCount
                }
            }).then(options => {
                $mdToast.showSimple('Actualizando estado del incidente...');
                remFactory.save({ id: vm.rem.id, status: options.statusSelected.id }, {
                    log: 'statusChanged',
                    comment: options.comment,
                    reason: options.reason,
                    employeeNotifyList: $('<div>' + options.comment + '</div>').find('ssvq-employee-profile-link').toArray().map(node => $(node).attr('id-employee'))
                }).then((response) => {
                    if (response.ok) {
                        vm.rem.status = options.statusSelected;
                        $mdToast.showSimple('Estado actualizado');
                    } else {
                        $mdToast.showSimple('Ha ocurrido un error: ' + response.msg);
                    }
                }, (err) => {
                    $mdToast.showSimple('Ha ocurrido un error: ' + err);
                });

                if (options.requestedType) {
                    remFactory.saveRemVehicle({
                        rem: vm.rem.id,
                        status: 10,
                        requestedType: options.requestedType
                    }, 'vehicleCreated').then(() => { });
                }
                if (options.priority) {
                    remFactory.save({
                        id: vm.rem.id,
                        priority: options.priority
                    }, { log: 'basicInformationChanged' }).then(() => { });
                }
                if (options.finishRemVehicles) {
                    remVehicleFactory.finishByRem(vm.rem.id).then(() => { });
                }
            });
        };

        $scope.$watch('vm.rem.status', (newValue, oldValue) => {
            if (oldValue) {
                oldStatus = oldValue;
            }
        }, true);

        vm.showAddressInformation = true;
        vm.showBasicInformation = true;
        vm.showObservations = true;
        vm.showRemVehiclePatients = true;

        var socketRem = function (event) {
            if (event.id == vm.idRem && event.data.message === 'remLog') {
                let log = event.data.data.remLog;
                let rem = event.data.data.rem;
                if (log.type === 'statusChanged') {
                    vm.rem.status = log.status;
                }
                if (log.type === 'addressInformationChanged') {
                    _.extend(vm.rem.originAddress, rem.originAddress);
                }
                if (log.type === 'basicInformationChanged') {
                    _.extend(vm.basicInformation, _.pick(rem, basicInformationAttrs));
                }
                $scope.$apply();
            }
        };
        io.socket.on('rem', socketRem);
        $scope.$on('$destroy', function () {
            io.socket.off('rem', socketRem);
        });

        vm.updateCallCounter = () => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: '¿Alguien más llamó por el mismo incidente?',
                    textContent: 'Agrega una nueva llamada relacionada al incidente',
                    ok: 'Agregar llamada',
                    cancel: 'Volver'
                })
            ).then(() => {
                remFactory.save({
                    id: vm.rem.id,
                    callCounter: vm.rem.callCounter + 1
                }).then((response) => {
                    if (response.ok) {
                        vm.rem.callCounter += 1;
                        $mdToast.showSimple('Se agregó una llamada relacionada');
                    } else {
                        $mdToast.showSimple('Error actualizando llamadas relacionadas');
                    }
                }, (err) => {
                    $mdToast.showSimple('Ha ocurrido un error: ' + err);
                });
            });
        };

        vm.commentBoxOptions = {
            placeholderText: 'Escribe una observación',
            submitText: 'Agregar observación',
            unitRoot: '323.402.420.421',
            attachments: true
        };

        vm.sendComment = (comment) => new Promise((resolve, reject) => {
            comment.idModelModule = vm.idRem;
            comment.modelModule = 'rem';
            let mentionedList = $('<div>' + comment.description + '</div>').find('ssvq-employee-profile-link').toArray().map(node => $(node).attr('id-employee'));
            remFactory.addComment(comment, mentionedList || []).then(resolve, reject);
        });
    }
})();